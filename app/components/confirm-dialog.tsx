"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    function handleCancel(event: Event) {
      event.preventDefault();
      onCancel();
    }

    dialog.addEventListener("cancel", handleCancel);

    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      className="w-[calc(100vw-2rem)] max-w-md rounded-ds-lg border border-ds-line bg-ds-surface p-0 text-ds-text shadow-ds-overlay backdrop:bg-black/40"
    >
      <div className="p-4">
        <h2
          id="confirm-dialog-title"
          className="text-sm font-semibold text-ds-text"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mt-1 text-sm leading-5 text-ds-text-subtle"
        >
          {description}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="subtle" onPress={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
