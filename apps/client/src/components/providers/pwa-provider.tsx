'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { Download, RefreshCw, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const INSTALL_DISMISSED_KEY = 'tl:pwa-install-dismissed-at'
const INSTALLED_KEY = 'tl:pwa-installed'
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000
const INSTALL_DELAY_MS = 30_000
const PWA_ENABLED = process.env.NEXT_PUBLIC_PWA_ENABLED === 'true'
const PWA_ACTIVE = PWA_ENABLED && process.env.NODE_ENV === 'production'
const INSTALL_PROMPT_ENABLED =
  process.env.NEXT_PUBLIC_PWA_INSTALL_PROMPT_ENABLED === 'true'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

const isEligiblePublicRoute = (pathname: string) =>
  pathname === '/' ||
  /^\/vaga\/[^/]+\/?$/.test(pathname) ||
  /^\/vagas\/[^/]+\/?$/.test(pathname)

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  Boolean((window.navigator as NavigatorWithStandalone).standalone)

const reportPwaError = (error: unknown, operation: string) => {
  Sentry.captureException(error, { tags: { feature: 'pwa', operation } })
}

export const PwaProvider = () => {
  const pathname = usePathname()
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installDelayElapsed, setInstallDelayElapsed] = useState(false)
  const [installDismissed, setInstallDismissed] = useState(true)
  const [installed, setInstalled] = useState(true)
  const reloadingRef = useRef(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (!PWA_ACTIVE) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .then(() =>
          caches
            .keys()
            .then((names) =>
              Promise.all(
                names
                  .filter((name) => name.startsWith('tl-pwa-'))
                  .map((name) => caches.delete(name)),
              ),
            ),
        )
        .catch((error: unknown) => reportPwaError(error, 'disable'))
      return
    }

    const handleControllerChange = () => {
      if (reloadingRef.current) return
      reloadingRef.current = true
      window.location.reload()
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        if (registration.waiting) setWaitingWorker(registration.waiting)

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing
          if (!installingWorker) return

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(registration.waiting ?? installingWorker)
            }
          })
        })

        await registration.update()
      } catch (error) {
        reportPwaError(error, 'register-or-update')
      }
    }

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange,
    )
    void register()

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange,
      )
    }
  }, [])

  useEffect(() => {
    if (!INSTALL_PROMPT_ENABLED || !PWA_ACTIVE) return

    const dismissedAt = Number(localStorage.getItem(INSTALL_DISMISSED_KEY) ?? 0)
    const alreadyInstalled =
      localStorage.getItem(INSTALLED_KEY) === 'true' || isStandalone()

    setInstallDismissed(Date.now() - dismissedAt < DISMISS_DURATION_MS)
    setInstalled(alreadyInstalled)

    const timer = window.setTimeout(
      () => setInstallDelayElapsed(true),
      INSTALL_DELAY_MS,
    )

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, 'true')
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const dismissInstallPrompt = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()))
    setInstallDismissed(true)
  }

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, 'true')
        setInstalled(true)
      } else {
        dismissInstallPrompt()
      }
      setDeferredPrompt(null)
    } catch (error) {
      reportPwaError(error, 'install-prompt')
    }
  }

  const updateApp = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
  }

  const isIos =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)
  const showInstallPrompt =
    INSTALL_PROMPT_ENABLED &&
    PWA_ACTIVE &&
    installDelayElapsed &&
    !installDismissed &&
    !installed &&
    isEligiblePublicRoute(pathname) &&
    (Boolean(deferredPrompt) || isIos)

  return (
    <>
      {waitingWorker && (
        <div
          role="status"
          className="fixed top-0 right-0 left-0 z-60 bg-gray-900 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-white shadow-[0_8px_24px_rgba(17,24,39,0.18)]"
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <p className="text-sm font-medium">Nova versão disponível</p>
            <Button
              type="button"
              size="sm"
              onClick={updateApp}
              className="shrink-0 bg-white text-gray-900 hover:bg-surface"
            >
              <RefreshCw size={15} aria-hidden />
              Atualizar
            </Button>
          </div>
        </div>
      )}

      {showInstallPrompt && (
        <aside
          aria-label="Instalar TrabalhaLagos"
          className="fixed right-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 z-50 mx-auto max-w-md rounded-2xl bg-gray-900 p-4 text-white shadow-[0_12px_32px_rgba(17,24,39,0.24)]"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Download size={20} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Tenha as vagas sempre à mão</p>
              <p className="mt-1 text-sm leading-5 text-gray-300">
                {isIos
                  ? 'Toque em Compartilhar e depois em “Adicionar à Tela de Início”.'
                  : 'Instale o TrabalhaLagos para abrir mais rápido, até quando a conexão falhar.'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {isIos ? (
                  <Button type="button" size="sm" onClick={dismissInstallPrompt}>
                    <Share size={15} aria-hidden />
                    Entendi
                  </Button>
                ) : (
                  <Button type="button" size="sm" onClick={installApp}>
                    Instalar
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={dismissInstallPrompt}
                  className="text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  Agora não
                </Button>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-label="Fechar convite de instalação"
              onClick={dismissInstallPrompt}
              className="-mt-2 -mr-2 h-9 w-9 shrink-0 px-0 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <X size={18} aria-hidden />
            </Button>
          </div>
        </aside>
      )}
    </>
  )
}
