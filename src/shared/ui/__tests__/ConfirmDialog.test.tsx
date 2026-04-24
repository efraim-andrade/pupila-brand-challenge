import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

beforeEach(() => jest.clearAllMocks());

describe('ConfirmDialog', () => {
  describe('open/closed state', () => {
    it('returns null when open is false', () => {
      const { container } = render(
        <ConfirmDialog
          open={false}
          title="Delete"
          message="Are you sure?"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('renders the dialog when open is true', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete"
          message="Are you sure?"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('title', () => {
    it('renders the title in the modal', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete Palette"
          message="Are you sure?"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(
        screen.getByRole('heading', { level: 2, name: 'Delete Palette' })
      ).toBeInTheDocument();
    });
  });

  describe('message', () => {
    it('renders the message text', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete"
          message="This action cannot be undone."
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(
        screen.getByText('This action cannot be undone.')
      ).toBeInTheDocument();
    });
  });

  describe('buttons', () => {
    it('renders Cancel button', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete"
          message="Are you sure?"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders default confirm label as "Delete"', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete"
          message="Are you sure?"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Delete' })
      ).toBeInTheDocument();
    });

    it('renders custom confirm label when provided', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete"
          message="Are you sure?"
          confirmLabel="Remove"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Remove' })
      ).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('calls onCancel when Cancel button is clicked', async () => {
      const onCancel = jest.fn();
      render(
        <ConfirmDialog
          open={true}
          title="Delete"
          message="Are you sure?"
          onConfirm={jest.fn()}
          onCancel={onCancel}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Confirm button is clicked', async () => {
      const onConfirm = jest.fn();
      render(
        <ConfirmDialog
          open={true}
          title="Delete"
          message="Are you sure?"
          onConfirm={onConfirm}
          onCancel={jest.fn()}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
