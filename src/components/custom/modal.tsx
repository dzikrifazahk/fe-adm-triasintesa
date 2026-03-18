"use client";

import { useEffect, useRef } from "react";
import { FaXmark } from "react-icons/fa6";
import { Button } from "../ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  width?: string;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  overflowScroll?: string;
  showConfirmButton?: boolean;
  closeOnBackdropClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  width = "w-[90vw]",
  onSubmit,
  onCancel,
  overflowScroll = "overflow-y-auto",
  showConfirmButton = true,
  closeOnBackdropClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      closeOnBackdropClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  useEffect(() => {
    // Prevent body scroll when modal is open
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
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className={`bg-white ${width} rounded-lg ${overflowScroll} overflow-y-auto max-h-[90vh] h-auto z-50 dark:bg-background`}
            // className={`bg-white rounded-lg overflow-scroll shadow-lg max-h-[90vh] h-auto z-100 ${width}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between p-5 border-b border-[#E4E4E4] bg-[#F9F9F9] rounded-t-lg sticky top-0 z-40 dark:bg-background dark:border-muted">
              <div className="font-bold text-xl text-primary">{title}</div>
              <FaXmark size={30} onClick={onClose} className="cursor-pointer" />
            </div>

            <form onSubmit={onSubmit}>
              <div>{children}</div>
              {showConfirmButton && (
                <div className="border border-t border-[#E4E4E4] bg-[#F9F9F9] mt-10 p-5 flex justify-end gap-2  rounded-b-lg sticky bottom-0 z-50 dark:bg-background dark:border-muted">
                  <Button
                    type="submit"
                    className="btn bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary cursor-pointer"
                  >
                    Submit
                  </Button>
                  <Button
                    className="btn bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    onClick={onClose}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};
