"use client";

import { useEffect, useRef } from "react";
import { FaXmark } from "react-icons/fa6";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  width?: string;
  onCancel?: () => void;
}

export const ModalFilter: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  width = "w-[30vw]",
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          // className="fixed inset-0 flex items-center justify-end bg-black bg-opacity-50 z-50"
          className="fixed inset-0 flex items-center justify-end bg-black/30 backdrop-blur-sm z-50 "
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className={`bg-white ${width} rounded-lg overflow-y-auto h-full z-50 dark:bg-background dark:border-muted`}
            // className={`bg-white rounded-lg overflow-scroll shadow-lg max-h-[90vh] h-auto z-100 ${width}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between p-5 border-b border-[#E4E4E4] bg-[#F9F9F9] rounded-t-lg sticky top-0 z-10 dark:bg-background dark:border-muted">
              <div className="font-bold text-xl text-primary">{title}</div>
              <FaXmark size={30} onClick={onClose} className="cursor-pointer" />
            </div>

            <div>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};
