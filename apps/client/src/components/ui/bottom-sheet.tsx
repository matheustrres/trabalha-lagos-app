"use client";

import type { ReactNode } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl max-w-lg mx-auto max-h-[80vh] overflow-auto z-50 transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-5" />
        {title && (
          <h2 className="text-lg font-bold text-gray-900 px-6">{title}</h2>
        )}
        <div className="px-6 pb-8">{children}</div>
      </div>
    </>
  );
}
