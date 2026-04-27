import type { JSX, ReactNode } from 'react';
import { Modal } from './Modal';

interface ModalWithContentProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
  showHeader?: boolean;
}

export function ModalWithContent({
  open,
  onClose,
  title,
  size = 'md',
  children,
  showHeader = true,
}: ModalWithContentProps): JSX.Element | null {
  return (
    <Modal open={open} onClose={onClose} title={title} size={size}>
      {showHeader && <div className="mb-6">{children}</div>}
      {!showHeader && <div className="space-y-6">{children}</div>}
    </Modal>
  );
}
