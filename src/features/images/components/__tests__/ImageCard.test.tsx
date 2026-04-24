import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Group, Image, Tag } from '@/types';
import { ImageCard } from '../ImageCard';

beforeEach(() => jest.clearAllMocks());

const makeImage = (overrides: Partial<Image> = {}): Image => ({
  id: 'img-1',
  url: 'https://example.com/image.jpg',
  name: 'Test Image',
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'g-1',
  name: 'Test Group',
  type: 'image',
  ...overrides,
});

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 't-1',
  name: 'Test Tag',
  color: '#ff0000',
  ...overrides,
});

describe('ImageCard', () => {
  describe('image name and info', () => {
    it('renders image name', () => {
      render(
        <ImageCard
          image={makeImage({ name: 'My Image' })}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      expect(screen.getByText('My Image')).toBeInTheDocument();
    });

    it('renders group name when group is provided', () => {
      render(
        <ImageCard
          image={makeImage()}
          group={makeGroup({ name: 'My Group' })}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      expect(screen.getByText('My Group')).toBeInTheDocument();
    });

    it('does not render group when group is undefined', () => {
      render(
        <ImageCard
          image={makeImage()}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      expect(screen.queryByText('My Group')).not.toBeInTheDocument();
    });

    it('renders tags associated with the image', () => {
      const tags = [
        makeTag({ id: 't-1', name: 'Tag One' }),
        makeTag({ id: 't-2', name: 'Tag Two' }),
      ];
      const image = makeImage({ tagIds: ['t-1', 't-2'] });

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={tags}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      expect(screen.getByText('Tag One')).toBeInTheDocument();
      expect(screen.getByText('Tag Two')).toBeInTheDocument();
    });

    it('renders comment count when image has comments', () => {
      const image = makeImage({
        comments: [
          {
            id: 'c1',
            text: 'Comment 1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'c2',
            text: 'Comment 2',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      });

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders singular comment text when only one comment', () => {
      const image = makeImage({
        comments: [
          {
            id: 'c1',
            text: 'Comment',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      });

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('calls onExpand when clicking the image', async () => {
      const onExpand = jest.fn();
      const image = makeImage({ name: 'Expandable Image' });

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={onExpand}
          onCreatePalette={jest.fn()}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Expand Expandable Image' })
      );

      expect(onExpand).toHaveBeenCalledWith(image.id);
    });

    it('calls onEdit when clicking edit button', async () => {
      const onEdit = jest.fn();
      const image = makeImage({ name: 'Editable Image' });

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={onEdit}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Edit image' }));

      expect(onEdit).toHaveBeenCalledWith(image);
    });

    it('calls onDelete when clicking delete button', async () => {
      const onDelete = jest.fn();
      const image = makeImage({ id: 'delete-me' });

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={[]}
          onDelete={onDelete}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete image' })
      );

      expect(onDelete).toHaveBeenCalledWith('delete-me');
    });

    it('calls onCreatePalette when clicking create palette button', async () => {
      const onCreatePalette = jest.fn();
      const image = makeImage({ name: 'Test Image' });

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={onCreatePalette}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Create palette from image' })
      );

      expect(onCreatePalette).toHaveBeenCalledWith(image);
    });

    it('stops propagation when clicking action buttons', async () => {
      const onExpand = jest.fn();
      const onEdit = jest.fn();
      const image = makeImage();

      render(
        <ImageCard
          image={image}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={onEdit}
          onExpand={onExpand}
          onCreatePalette={jest.fn()}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Edit image' }));

      expect(onExpand).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible aria-label on expand button', () => {
      render(
        <ImageCard
          image={makeImage({ name: 'My Image' })}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onExpand={jest.fn()}
          onCreatePalette={jest.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Expand My Image' })
      ).toBeInTheDocument();
    });
  });
});
