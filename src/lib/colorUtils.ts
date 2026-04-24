export interface RGB {
  red: number;
  green: number;
  blue: number;
}

export interface HSL {
  hue: number;
  saturation: number;
  lightness: number;
}

export function hexToRgb(hex: string): RGB {
  const hexWithoutPrefix = hex.replace('#', '');
  return {
    red: parseInt(hexWithoutPrefix.slice(0, 2), 16),
    green: parseInt(hexWithoutPrefix.slice(2, 4), 16),
    blue: parseInt(hexWithoutPrefix.slice(4, 6), 16),
  };
}

export function rgbToHex({ red, green, blue }: RGB): string {
  return (
    '#' +
    [red, green, blue]
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function rgbToHsl({ red, green, blue }: RGB): HSL {
  const rn = red / 255;
  const gn = green / 255;
  const bn = blue / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;

  if (max === min)
    return { hue: 0, saturation: 0, lightness: Math.round(lightness * 100) };

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === rn) hue = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) hue = ((bn - rn) / delta + 2) / 6;
  else hue = ((rn - gn) / delta + 4) / 6;

  return {
    hue: Math.round(hue * 360),
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100),
  };
}

export function hslToRgb({ hue, saturation, lightness }: HSL): RGB {
  const sn = saturation / 100;
  const ln = lightness / 100;
  const chroma = (1 - Math.abs(2 * ln - 1)) * sn;
  const hueSectionValue = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const lightnessOffset = ln - chroma / 2;
  let red = 0,
    green = 0,
    blue = 0;

  if (hue < 60) {
    red = chroma;
    green = hueSectionValue;
  } else if (hue < 120) {
    red = hueSectionValue;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = hueSectionValue;
  } else if (hue < 240) {
    green = hueSectionValue;
    blue = chroma;
  } else if (hue < 300) {
    red = hueSectionValue;
    blue = chroma;
  } else {
    red = chroma;
    blue = hueSectionValue;
  }

  return {
    red: Math.round((red + lightnessOffset) * 255),
    green: Math.round((green + lightnessOffset) * 255),
    blue: Math.round((blue + lightnessOffset) * 255),
  };
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

export function getContrastColor(hex: string): '#000000' | '#ffffff' {
  const { red, green, blue } = hexToRgb(hex);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function normalizeHex(hex: string): string {
  const hexWithoutPrefix = hex.replace('#', '');
  if (hexWithoutPrefix.length === 3) {
    return (
      '#' +
      hexWithoutPrefix
        .split('')
        .map((hexChar) => hexChar + hexChar)
        .join('')
    );
  }
  return `#${hexWithoutPrefix.toLowerCase()}`;
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
      const drawingContext = canvas.getContext('2d');
      if (!drawingContext) {
        resolve([]);
        return;
      }

      drawingContext.drawImage(img, 0, 0, sampleSize, sampleSize);
      const { data } = drawingContext.getImageData(
        0,
        0,
        sampleSize,
        sampleSize
      );

      const colorCounts = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const red = Math.round(data[i] / 24) * 24;
        const green = Math.round(data[i + 1] / 24) * 24;
        const blue = Math.round(data[i + 2] / 24) * 24;
        const key = `${red},${green},${blue}`;
        colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
      }

      const sorted = [...colorCounts.entries()]
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([key]) => {
          const [red, green, blue] = key.split(',').map(Number);
          return rgbToHex({ red, green, blue });
        });

      const result: string[] = [];
      for (const hex of sorted) {
        if (result.length >= count) break;
        const candidate = hexToRgb(hex);
        const isSimilarToExisting = result.some((existing) => {
          const existingRgb = hexToRgb(existing);
          const distance = Math.sqrt(
            (candidate.red - existingRgb.red) ** 2 +
              (candidate.green - existingRgb.green) ** 2 +
              (candidate.blue - existingRgb.blue) ** 2
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
