'use client';

import { useEffect } from 'react';
import { groupDB, imageDB, paletteDB, tagDB } from '@/lib/db';
import { mockGroups, mockImages, mockPalettes, mockTags } from '@/lib/mockData';
import { useAppStore } from '@/store';

export function StoreHydrator(): null {
  const hydrateImages = useAppStore((store) => store.hydrateImages);
  const hydratePalettes = useAppStore((store) => store.hydratePalettes);
  const hydrateOrganization = useAppStore((store) => store.hydrateOrganization);
  const setHydrated = useAppStore((store) => store.setHydrated);
  const addImage = useAppStore((store) => store.addImage);
  const addPalette = useAppStore((store) => store.addPalette);
  const addGroup = useAppStore((store) => store.addGroup);
  const addTag = useAppStore((store) => store.addTag);

  useEffect(() => {
    async function hydrate() {
      const [images, palettes, groups, tags] = await Promise.all([
        imageDB.getAll(),
        paletteDB.getAll(),
        groupDB.getAll(),
        tagDB.getAll(),
      ]);

      // Seed mock data on first run
      if (images.length === 0 && palettes.length === 0) {
        for (const mockGroup of mockGroups)
          addGroup({
            name: mockGroup.name,
            type: mockGroup.type,
            color: mockGroup.color,
          });
        for (const mockTag of mockTags)
          addTag({ name: mockTag.name, color: mockTag.color });
        for (const mockImage of mockImages) {
          addImage({
            url: mockImage.url,
            name: mockImage.name,
            groupId: null,
            tagIds: [],
            comments: mockImage.comments,
          });
        }
        for (const mockPalette of mockPalettes) {
          addPalette({
            name: mockPalette.name,
            colors: mockPalette.colors,
            groupId: null,
            tagIds: [],
            comments: mockPalette.comments,
          });
        }
      } else {
        hydrateImages(images);
        hydratePalettes(palettes);
        hydrateOrganization(groups, tags);
      }

      setHydrated(true);
    }

    hydrate();
  }, []);

  return null;
}
