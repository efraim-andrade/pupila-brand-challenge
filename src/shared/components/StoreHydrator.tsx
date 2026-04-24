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
        for (const g of mockGroups)
          addGroup({ name: g.name, type: g.type, color: g.color });
        for (const t of mockTags) addTag({ name: t.name, color: t.color });
        for (const img of mockImages) {
          addImage({
            url: img.url,
            name: img.name,
            groupId: null,
            tagIds: [],
            comments: img.comments,
          });
        }
        for (const pal of mockPalettes) {
          addPalette({
            name: pal.name,
            colors: pal.colors,
            groupId: null,
            tagIds: [],
            comments: pal.comments,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
