import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Comment } from '@/types';
import { CommentsSection } from '../CommentsSection';

beforeEach(() => jest.clearAllMocks());

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'c1',
  text: 'hello world',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  ...overrides,
});

const defaultProps = {
  onAdd: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
};

describe('CommentsSection', () => {
  describe('comment list rendering', () => {
    it('renders the text for each comment in the list', () => {
      const comments = [
        makeComment({ id: 'c1', text: 'first comment' }),
        makeComment({ id: 'c2', text: 'second comment' }),
      ];

      render(<CommentsSection {...defaultProps} comments={comments} />);

      expect(screen.getByText('first comment')).toBeInTheDocument();
      expect(screen.getByText('second comment')).toBeInTheDocument();
    });

    it('shows a count in the heading when there are comments', () => {
      const comments = [makeComment(), makeComment({ id: 'c2' })];

      render(<CommentsSection {...defaultProps} comments={comments} />);

      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('does not show a count in the heading when there are no comments', () => {
      render(<CommentsSection {...defaultProps} comments={[]} />);

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });
  });

  describe('add comment textarea', () => {
    it('disables the Add comment button when the textarea is empty', () => {
      render(<CommentsSection {...defaultProps} comments={[]} />);

      expect(
        screen.getByRole('button', { name: 'Add comment' })
      ).toBeDisabled();
    });

    it('enables the Add comment button when the textarea has text', async () => {
      render(<CommentsSection {...defaultProps} comments={[]} />);

      await userEvent.type(
        screen.getByPlaceholderText(/Add a comment/),
        'some text'
      );

      expect(screen.getByRole('button', { name: 'Add comment' })).toBeEnabled();
    });

    it('calls onAdd with trimmed text when the Add comment button is clicked', async () => {
      const onAdd = jest.fn();
      render(<CommentsSection {...defaultProps} onAdd={onAdd} comments={[]} />);

      await userEvent.type(
        screen.getByPlaceholderText(/Add a comment/),
        '  my comment  '
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Add comment' })
      );

      expect(onAdd).toHaveBeenCalledWith('my comment');
    });

    it('clears the textarea after a comment is added', async () => {
      render(<CommentsSection {...defaultProps} comments={[]} />);
      const textarea = screen.getByPlaceholderText(/Add a comment/);

      await userEvent.type(textarea, 'some text');
      await userEvent.click(
        screen.getByRole('button', { name: 'Add comment' })
      );

      expect(textarea).toHaveValue('');
    });

    it('submits the comment when Enter is pressed without Shift', async () => {
      const onAdd = jest.fn();
      render(<CommentsSection {...defaultProps} onAdd={onAdd} comments={[]} />);
      const textarea = screen.getByPlaceholderText(/Add a comment/);

      await userEvent.type(textarea, 'enter submit');
      await userEvent.keyboard('{Enter}');

      expect(onAdd).toHaveBeenCalledWith('enter submit');
    });

    it('does NOT submit when Shift+Enter is pressed', async () => {
      const onAdd = jest.fn();
      render(<CommentsSection {...defaultProps} onAdd={onAdd} comments={[]} />);
      const textarea = screen.getByPlaceholderText(/Add a comment/);

      await userEvent.type(textarea, 'no submit');
      await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

      expect(onAdd).not.toHaveBeenCalled();
    });
  });

  describe('delete comment', () => {
    it('calls onDelete with the correct commentId when the Delete comment button is clicked', async () => {
      const onDelete = jest.fn();
      const comment = makeComment({ id: 'c99', text: 'delete me' });

      render(
        <CommentsSection
          {...defaultProps}
          onDelete={onDelete}
          comments={[comment]}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete comment' })
      );

      expect(onDelete).toHaveBeenCalledWith('c99');
    });
  });

  describe('edit comment', () => {
    it('shows the edit textarea pre-filled with comment text when the Edit comment button is clicked', async () => {
      const comment = makeComment({ text: 'original text' });

      render(<CommentsSection {...defaultProps} comments={[comment]} />);
      await userEvent.click(
        screen.getByRole('button', { name: 'Edit comment' })
      );

      expect(screen.getByDisplayValue('original text')).toBeInTheDocument();
    });

    it('calls onUpdate with commentId and new text when Save is clicked', async () => {
      const onUpdate = jest.fn();
      const comment = makeComment({ id: 'c1', text: 'original' });

      render(
        <CommentsSection
          {...defaultProps}
          onUpdate={onUpdate}
          comments={[comment]}
        />
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Edit comment' })
      );

      const editTextarea = screen.getByDisplayValue('original');
      await userEvent.clear(editTextarea);
      await userEvent.type(editTextarea, 'updated text');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onUpdate).toHaveBeenCalledWith('c1', 'updated text');
    });

    it('hides the edit form without calling onUpdate when Cancel is clicked', async () => {
      const onUpdate = jest.fn();
      const comment = makeComment({ text: 'original' });

      render(
        <CommentsSection
          {...defaultProps}
          onUpdate={onUpdate}
          comments={[comment]}
        />
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Edit comment' })
      );
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onUpdate).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
    });

    it('saves the edit when Enter is pressed without Shift in the edit textarea', async () => {
      const onUpdate = jest.fn();
      const comment = makeComment({ id: 'c1', text: 'original' });

      render(
        <CommentsSection
          {...defaultProps}
          onUpdate={onUpdate}
          comments={[comment]}
        />
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Edit comment' })
      );

      const editTextarea = screen.getByDisplayValue('original');
      await userEvent.clear(editTextarea);
      await userEvent.type(editTextarea, 'enter saved');
      await userEvent.keyboard('{Enter}');

      expect(onUpdate).toHaveBeenCalledWith('c1', 'enter saved');
    });

    it('cancels without calling onUpdate when Escape is pressed in the edit textarea', async () => {
      const onUpdate = jest.fn();
      const comment = makeComment({ text: 'original' });

      render(
        <CommentsSection
          {...defaultProps}
          onUpdate={onUpdate}
          comments={[comment]}
        />
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Edit comment' })
      );
      await userEvent.keyboard('{Escape}');

      expect(onUpdate).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
    });

    it('disables the Save button when the edit textarea is empty', async () => {
      const comment = makeComment({ text: 'original' });

      render(<CommentsSection {...defaultProps} comments={[comment]} />);
      await userEvent.click(
        screen.getByRole('button', { name: 'Edit comment' })
      );

      const editTextarea = screen.getByDisplayValue('original');
      await userEvent.clear(editTextarea);

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });
});
