import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { filterPalettes } from '../lib/filterPalettes';

export function usePalettesPage() {
  const palettes = useAppStore((store) => store.palettes);
  const groups = useAppStore((store) => store.groups);
  const tags = useAppStore((store) => store.tags);
  const filter = useAppStore((store) => store.palettesFilter);
  const viewMode = useAppStore((store) => store.palettesViewMode);
  const setFilter = useAppStore((store) => store.setPalettesFilter);
  const resetFilter = useAppStore((store) => store.resetPalettesFilter);
  const setViewMode = useAppStore((store) => store.setPalettesViewMode);
  const deletePalette = useAppStore((store) => store.deletePalette);
  const openModal = useAppStore((store) => store.openModal);

  const tagNamesById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag.id, tag.name])),
    [tags]
  );

  const paletteGroups = useMemo(
    () =>
      groups.filter(
        (group) => group.type === 'palette' || group.type === 'shared'
      ),
    [groups]
  );

  const filteredPalettes = useMemo(
    () => filterPalettes(palettes, filter, tagNamesById),
    [palettes, filter, tagNamesById]
  );

  return {
    palettes: filteredPalettes,
    totalCount: palettes.length,
    groups: paletteGroups,
    tags,
    filter,
    viewMode,
    setFilter,
    resetFilter,
    setViewMode,
    deletePalette,
    openModal,
  };
}
