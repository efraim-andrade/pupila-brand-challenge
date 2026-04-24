import type { FilterState, Image } from '@/types';

export function filterImages(
  images: Image[],
  filter: FilterState,
  tagNamesById: Record<string, string>
): Image[] {
  return images.filter((image) => {
    if (filter.groupId && image.groupId !== filter.groupId) return false;
    if (
      filter.tagIds.length > 0 &&
      !filter.tagIds.some((tagId) => image.tagIds.includes(tagId))
    )
      return false;
    if (filter.search) {
      const query = filter.search.toLowerCase();
      const matchesName = image.name.toLowerCase().includes(query);
      const matchesTags = image.tagIds.some((tagId) =>
        tagNamesById[tagId]?.toLowerCase().includes(query)
      );
      const matchesComments = image.comments.some((comment) =>
        comment.text.toLowerCase().includes(query)
      );
      if (!matchesName && !matchesTags && !matchesComments) return false;
    }
    return true;
  });
}
