import { AlertTriangle } from 'lucide-react';
import type { JSX } from 'react';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

interface DuplicateNameDialogProps {
  open: boolean;
  conflictingPaletteName: string;
  onChooseRename: () => void;
  onChooseReplace: () => void;
  onDismiss: () => void;
}

export function DuplicateNameDialog({
  open,
  conflictingPaletteName,
  onChooseRename,
  onChooseReplace,
  onDismiss,
}: DuplicateNameDialogProps): JSX.Element {
  return (
    <Modal open={open} onClose={onDismiss} title="Duplicate name" size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-gray-600">
            A palette named{' '}
            <strong className="text-gray-900">{conflictingPaletteName}</strong>{' '}
            already exists. What would you like to do?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="md" onClick={onChooseRename}>
            Rename the new palette
          </Button>
          <Button variant="danger" size="md" onClick={onChooseReplace}>
            Replace existing palette
          </Button>
          <Button variant="secondary" size="md" onClick={onDismiss}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
