export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return (
    '#' +
    [r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')
  );
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / delta + 2) / 6;
  else h = ((rn - gn) / delta + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const chroma = (1 - Math.abs(2 * ln - 1)) * sn;
  const hueSectionValue = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const lightnessOffset = ln - chroma / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = chroma;
    g = hueSectionValue;
  } else if (h < 120) {
    r = hueSectionValue;
    g = chroma;
  } else if (h < 180) {
    g = chroma;
    b = hueSectionValue;
  } else if (h < 240) {
    g = hueSectionValue;
    b = chroma;
  } else if (h < 300) {
    r = hueSectionValue;
    b = chroma;
  } else {
    r = chroma;
    b = hueSectionValue;
  }

  return {
    r: Math.round((r + lightnessOffset) * 255),
    g: Math.round((g + lightnessOffset) * 255),
    b: Math.round((b + lightnessOffset) * 255),
  };
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

export function getContrastColor(hex: string): '#000000' | '#ffffff' {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function normalizeHex(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return (
      '#' +
      clean
        .split('')
        .map((hexChar) => hexChar + hexChar)
        .join('')
    );
  }
  return '#' + clean.toLowerCase();
}

function toProxiedUrl(imageUrl: string): string {
  try {
    const parsed = new URL(imageUrl);
    if (parsed.origin !== window.location.origin) {
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    }
  } catch {
    // relative URLs are same-origin, no proxy needed
  }
  return imageUrl;
}

export async function extractDominantColors(
  imageUrl: string,
  count: number = 6
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const sampleSize = 80;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

      const colorCounts = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const r = Math.round(data[i] / 24) * 24;
        const g = Math.round(data[i + 1] / 24) * 24;
        const b = Math.round(data[i + 2] / 24) * 24;
        const key = `${r},${g},${b}`;
        colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
      }

      const sorted = [...colorCounts.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number);
          return rgbToHex({ r, g, b });
        });

      const result: string[] = [];
      for (const hex of sorted) {
        if (result.length >= count) break;
        const candidate = hexToRgb(hex);
        const isSimilarToExisting = result.some((existing) => {
          const existingRgb = hexToRgb(existing);
          const distance = Math.sqrt(
            (candidate.r - existingRgb.r) ** 2 +
              (candidate.g - existingRgb.g) ** 2 +
              (candidate.b - existingRgb.b) ** 2
          );
          return distance < 60;
        });
        if (!isSimilarToExisting) result.push(hex);
      }

      resolve(result);
    };

    img.onerror = () => resolve([]);
    img.src = toProxiedUrl(imageUrl);
  });
}
