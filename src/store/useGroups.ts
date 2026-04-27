import { useAppStore } from '@/store';

export function useGroups() {
  const groups = useAppStore((store) => store.groups);
  const addGroup = useAppStore((store) => store.addGroup);
  const updateGroup = useAppStore((store) => store.updateGroup);
  const deleteGroup = useAppStore((store) => store.deleteGroup);

  const paletteGroups = groups.filter(
    (group) => group.type === 'palette' || group.type === 'shared'
  );
  const imageGroups = groups.filter(
    (group) => group.type === 'image' || group.type === 'shared'
  );

  return {
    groups,
    paletteGroups,
    imageGroups,
    addGroup,
    updateGroup,
    deleteGroup,
  };
}
