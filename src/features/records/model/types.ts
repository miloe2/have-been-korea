export type RegionRecord = {
  id: string;
  regionCode: string;
  regionName: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
};

export type RegionSummary = {
  code: string;
  name: string;
  nameEng: string;
};
