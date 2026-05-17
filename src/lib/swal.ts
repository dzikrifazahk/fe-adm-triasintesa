import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

function getActiveDialogTarget(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const openedDialogs = document.querySelectorAll<HTMLElement>(
    "[data-slot='dialog-content'][data-state='open']",
  );
  if (!openedDialogs.length) return null;
  return openedDialogs[openedDialogs.length - 1];
}

export function openSwal(
  options: SweetAlertOptions,
): Promise<SweetAlertResult<any>> {
  const target = options.target ?? getActiveDialogTarget() ?? document.body;
  return Swal.fire({
    heightAuto: false,
    returnFocus: false,
    allowEscapeKey: true,
    allowOutsideClick: true,
    ...options,
    target,
  });
}

export function showSwalValidationMessage(message: string): void {
  Swal.showValidationMessage(message);
}
