"use client";

import { useRef, type ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@repo/design-system/components/ui/dialog";

export type DetailOverlayProps = {
  children: ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
};

export function DetailOverlay({ children, title, open, onClose }: DetailOverlayProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }} open={open}>
      <DialogContent
        className="top-0! left-0! flex! h-dvh! max-h-none! w-screen! max-w-none! translate-x-0! translate-y-0! flex-col gap-0! overflow-hidden rounded-none! border-0! p-0! duration-0! data-[state=open]:animate-none! data-[state=closed]:animate-none! sm:max-w-none!"
        onOpenAutoFocus={() => {
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus({ preventScroll: true });
          }
        }}
      >
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3 pr-14 text-left sm:px-6 sm:pr-14">
          <DialogTitle className="sr-only">{title} details</DialogTitle>
          <DialogDescription className="sr-only">Explore the details, then return to your conversation.</DialogDescription>
          <Button className="w-fit" onClick={onClose} size="sm" variant="ghost">
            <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
            Back to chat
          </Button>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-testid="detail-scroll">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
