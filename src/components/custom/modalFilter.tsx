"use client";

import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  width?: string;
  onCancel?: () => void;
}

const ANIMATION_MS = 300;

export const ModalFilter: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  width = "w-full sm:w-[380px]",
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  // `rendered` menahan panel tetap ter-mount selama animasi tutup berjalan
  const [rendered, setRendered] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      // tunggu satu frame agar transisi slide-in terpicu setelah mount
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = setTimeout(() => setRendered(false), ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!rendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white ${width} h-full overflow-y-auto rounded-lg shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none dark:border-muted dark:bg-background ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex w-full justify-between rounded-t-lg border-b border-[#E4E4E4] bg-[#F9F9F9] p-5 dark:border-muted dark:bg-background">
          <div className="text-xl font-bold text-primary">{title}</div>
          <FaXmark size={30} onClick={onClose} className="cursor-pointer" />
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
