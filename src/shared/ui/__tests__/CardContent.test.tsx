import { render, screen } from '@testing-library/react';
import { CardContent } from '../CardContent';

describe('CardContent', () => {
  const baseProps = {
    name: 'Test Item',
    commentCount: 0,
    group: undefined as { name: string } | undefined,
    tags: [] as Array<{ id: string; name: string; color?: string }>,
  };

  describe('name', () => {
    it('renders the name', () => {
      render(<CardContent {...baseProps} name="My Item" />);
      expect(screen.getByText('My Item')).toBeInTheDocument();
    });

    it('truncates long names', () => {
      render(
        <CardContent
          {...baseProps}
          name="A very long name that should be truncated"
        />
      );
      expect(
        screen.getByText('A very long name that should be truncated')
      ).toBeInTheDocument();
    });
  });

  describe('subtitle', () => {
    it('renders subtitle when provided', () => {
      render(<CardContent {...baseProps} subtitle="5 colors" />);
      expect(screen.getByText('5 colors')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<CardContent {...baseProps} />);
      expect(screen.queryByText('5 colors')).not.toBeInTheDocument();
    });
  });

  describe('comments', () => {
    it('renders comment count when greater than zero', () => {
      render(<CardContent {...baseProps} commentCount={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders comment count of 1', () => {
      render(<CardContent {...baseProps} commentCount={1} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not render comment count when zero', () => {
      render(<CardContent {...baseProps} commentCount={0} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('group', () => {
    it('renders group when provided', () => {
      render(<CardContent {...baseProps} group={{ name: 'My Group' }} />);
      expect(screen.getByText('My Group')).toBeInTheDocument();
    });

    it('does not render group when undefined', () => {
      render(<CardContent {...baseProps} group={undefined} />);
      expect(screen.queryByText('My Group')).not.toBeInTheDocument();
    });
  });

  describe('tags', () => {
    it('renders tags', () => {
      const tags = [
        { id: 't-1', name: 'Tag One', color: '#ff0000' },
        { id: 't-2', name: 'Tag Two', color: '#00ff00' },
      ];
      render(<CardContent {...baseProps} tags={tags} />);
      expect(screen.getByText('Tag One')).toBeInTheDocument();
      expect(screen.getByText('Tag Two')).toBeInTheDocument();
    });

    it('renders without tags', () => {
      render(<CardContent {...baseProps} tags={[]} />);
      expect(screen.queryByText('Tag One')).not.toBeInTheDocument();
    });
  });

  describe('combined rendering', () => {
    it('renders all elements together', () => {
      render(
        <CardContent
          name="Full Item"
          subtitle="10 items"
          commentCount={5}
          group={{ name: 'Group A' }}
          tags={[{ id: 't-1', name: 'Red', color: '#ff0000' }]}
        />
      );

      expect(screen.getByText('Full Item')).toBeInTheDocument();
      expect(screen.getByText('10 items')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Group A')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
    });
  });
});
