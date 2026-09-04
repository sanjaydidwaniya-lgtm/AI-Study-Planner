import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, title, description, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#19332b]/35 p-4 sm:p-6" role="dialog" aria-modal="true">
    <div className="mx-auto my-4 w-full max-w-xl rounded-2xl border bg-card shadow-2xl sm:my-10">
      <div className="flex items-start justify-between gap-4 border-b p-5 sm:p-7">
        <div><h2 className="font-display text-3xl">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}</div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-secondary" aria-label="Close modal"><X size={18} /></button>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
      {footer && <div className="border-t px-5 py-4 sm:px-7">{footer}</div>}
    </div>
  </div>;
}