import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageGrid } from '../ImageGrid'
import type { Image, Group, Tag, ViewMode } from '@/types'

beforeEach(() => jest.clearAllMocks())

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
})

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'g-1',
  name: 'Test Group',
  type: 'image',
  color: '#6366f1',
  ...overrides,
})

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 't-1',
  name: 'Tag One',
  color: '#ff0000',
  ...overrides,
})

const defaultProps = {
  images: [] as Image[],
  groups: [] as Group[],
  tags: [] as Tag[],
  viewMode: 'grid' as ViewMode,
  onDeleteImage: jest.fn(),
  onEditImage: jest.fn(),
  onCreatePalette: jest.fn(),
}

describe('ImageGrid', () => {
  describe('empty state', () => {
    it('renders empty state when no images', () => {
      render(<ImageGrid {...defaultProps} />)

      expect(screen.getByText('No images found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your filters or add a new image')).toBeInTheDocument()
    })
  })

  describe('grid view', () => {
    it('renders image cards in grid layout', () => {
      render(<ImageGrid {...defaultProps} images={[makeImage()]} />)

      expect(screen.getByText('Test Image')).toBeInTheDocument()
    })

    it('renders multiple image cards', () => {
      render(
        <ImageGrid
          {...defaultProps}
          images={[
            makeImage({ id: 'img-1', name: 'Image 1' }),
            makeImage({ id: 'img-2', name: 'Image 2' }),
          ]}
        />
      )

      expect(screen.getByText('Image 1')).toBeInTheDocument()
      expect(screen.getByText('Image 2')).toBeInTheDocument()
    })
  })

  describe('list view', () => {
    it('renders image rows in list layout', () => {
      render(<ImageGrid {...defaultProps} images={[makeImage()]} viewMode="list" />)

      expect(screen.getByText('Test Image')).toBeInTheDocument()
    })

    it('renders multiple image rows', () => {
      render(
        <ImageGrid
          {...defaultProps}
          images={[
            makeImage({ id: 'img-1', name: 'Image 1' }),
            makeImage({ id: 'img-2', name: 'Image 2' }),
          ]}
          viewMode="list"
        />
      )

      expect(screen.getByText('Image 1')).toBeInTheDocument()
      expect(screen.getByText('Image 2')).toBeInTheDocument()
    })

    it('shows comment count in list view', () => {
      const image = makeImage({
        id: 'img-1',
        comments: [
          { id: 'c1', text: 'Comment', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
        ],
      })

      render(<ImageGrid {...defaultProps} images={[image]} viewMode="list" />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('group display', () => {
    it('displays group name in list view', () => {
      const group = makeGroup({ id: 'g-1', name: 'My Group' })
      const image = makeImage({ groupId: 'g-1' })

      render(<ImageGrid {...defaultProps} images={[image]} groups={[group]} viewMode="list" />)

      expect(screen.getByText('My Group')).toBeInTheDocument()
    })

    it('displays group with default color when not specified', () => {
      const group = makeGroup({ id: 'g-1', name: 'Group', color: undefined })
      const image = makeImage({ groupId: 'g-1' })

      render(<ImageGrid {...defaultProps} images={[image]} groups={[group]} viewMode="list" />)

      expect(screen.getByText('Group')).toBeInTheDocument()
    })
  })

  describe('tag display', () => {
    it('displays tags in list view', () => {
      const tag = makeTag({ id: 't-1', name: 'Tag One' })
      const image = makeImage({ tagIds: ['t-1'] })

      render(<ImageGrid {...defaultProps} images={[image]} tags={[tag]} viewMode="list" />)

      expect(screen.getByText('Tag One')).toBeInTheDocument()
    })
  })

  describe('list view actions', () => {
    it('calls onEditImage when edit button clicked in list view', async () => {
      const onEditImage = jest.fn()
      const image = makeImage({ id: 'img-1', name: 'Edit Me' })

      render(<ImageGrid {...defaultProps} images={[image]} viewMode="list" onEditImage={onEditImage} />)

      await userEvent.click(screen.getByRole('button', { name: 'Edit image' }))

      expect(onEditImage).toHaveBeenCalledWith(image)
    })

    it('opens confirm dialog when delete requested in list view', async () => {
      const onDeleteImage = jest.fn()
      const image = makeImage({ id: 'img-1' })

      render(<ImageGrid {...defaultProps} images={[image]} viewMode="list" onDeleteImage={onDeleteImage} />)

      await userEvent.click(screen.getByRole('button', { name: 'Delete image' }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('delete confirmation', () => {
    it('opens confirm dialog when delete requested in grid view', async () => {
      const onDeleteImage = jest.fn()
      const image = makeImage({ id: 'img-1' })

      render(<ImageGrid {...defaultProps} images={[image]} onDeleteImage={onDeleteImage} />)

      await userEvent.click(screen.getByRole('button', { name: 'Delete image' }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete image')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this image? This action cannot be undone.')).toBeInTheDocument()
    })
  })

  describe('lightbox', () => {
    it('does not render lightbox when no image expanded', () => {
      render(<ImageGrid {...defaultProps} images={[makeImage()]} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})