import type { ColorPalette, ExportData } from '@/types';

export function exportToJSON(
  content: Omit<ExportData, 'version' | 'exportedAt'>
): void {
  const payload: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...content,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pupila-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPaletteToJSON(
  palette: ColorPalette,
  filename?: string
): void {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    palette: {
      name: palette.name,
      colors: palette.colors,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    filename ??
    `${palette.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-palette-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string) as ExportData;
        if (raw.version !== 1) {
          reject(new Error('Unsupported export version'));
          return;
        }
        if (!raw.images || !raw.palettes || !raw.groups || !raw.tags) {
          reject(new Error('Invalid export file: missing required fields'));
          return;
        }
        resolve(raw);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
