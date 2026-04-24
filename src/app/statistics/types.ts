export interface GroupStat {
  id: string;
  name: string;
  color: string;
  images: number;
  palettes: number;
  total: number;
}

export interface TagStat {
  id: string;
  name: string;
  color: string;
  images: number;
  palettes: number;
  total: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}
