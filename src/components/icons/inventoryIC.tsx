import React from "react";

interface Props {
  className?: string;
}

export default function InventoryIC({ className }: Props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 16.5V9.00005M8.25 16.2975C8.47803 16.4292 8.7367 16.4985 9 16.4985C9.2633 16.4985 9.52197 16.4292 9.75 16.2975L15 13.2975C15.2278 13.166 15.417 12.9769 15.5487 12.7492C15.6803 12.5214 15.7497 12.2631 15.75 12V6.00005C15.7497 5.737 15.6803 5.47866 15.5487 5.25092C15.417 5.02319 15.2278 4.83407 15 4.70255L9.75 1.70255C9.52197 1.5709 9.2633 1.50159 9 1.50159C8.7367 1.50159 8.47803 1.5709 8.25 1.70255L3 4.70255C2.7722 4.83407 2.58299 5.02319 2.45135 5.25092C2.31971 5.47866 2.25027 5.737 2.25 6.00005V12C2.25027 12.2631 2.31971 12.5214 2.45135 12.7492C2.58299 12.9769 2.7722 13.166 3 13.2975L8.25 16.2975Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.4675 5.25001L9 9.00001L15.5325 5.25001M5.625 3.20251L12.375 7.06501"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
