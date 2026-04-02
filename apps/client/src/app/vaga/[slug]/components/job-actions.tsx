"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { InterestForm } from "./interest-form";

interface JobActionsProps {
  whatsappContact: string;
  jobTitle: string;
  jobCity: string;
  jobSlug: string;
  companyName: string;
  jobId: string;
}

export function JobActions({ whatsappContact, companyName, jobId }: JobActionsProps) {
  const [showInterestSheet, setShowInterestSheet] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const hasWhatsapp = Boolean(whatsappContact);
  const interestStorageKey = `tl:interest:${jobId}`;

  useEffect(() => {
    const savedInterest = localStorage.getItem(interestStorageKey);
    setInterestSent(savedInterest === "true");
  }, [interestStorageKey]);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border pb-[env(safe-area-inset-bottom,8px)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex gap-2.5">
          <a
            href={hasWhatsapp ? `https://wa.me/${whatsappContact}` : "#"}
            target={hasWhatsapp ? "_blank" : undefined}
            rel={hasWhatsapp ? "noopener noreferrer" : undefined}
            className="flex-1"
            onClick={(event) => {
              if (!hasWhatsapp) event.preventDefault();
            }}
          >
            <Button variant="whatsapp" className="w-full" disabled={!hasWhatsapp}>
              📱 WhatsApp
            </Button>
          </a>
          {interestSent ? (
            <Button
              variant="secondary"
              className="flex-[1.5] bg-gray-200 text-gray-400 border-0"
              disabled
            >
              ✓ Interesse enviado
            </Button>
          ) : (
            <Button
              variant="primary"
              className="flex-[1.5]"
              onClick={() => setShowInterestSheet(true)}
            >
              Tenho interesse
            </Button>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={showInterestSheet}
        onClose={() => setShowInterestSheet(false)}
        title="Demonstrar interesse"
      >
        <InterestForm
          jobId={jobId}
          companyName={companyName}
          onSuccess={() => {
            localStorage.setItem(interestStorageKey, "true");
            setInterestSent(true);
            setShowInterestSheet(false);
          }}
          onCancel={() => setShowInterestSheet(false)}
        />
      </BottomSheet>
    </>
  );
}
