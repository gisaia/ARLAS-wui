export interface VisualisationInterface {
  name: string;
  descriptions: string;
  itemsFamilies: ItemFamily[];
  visualisation?: boolean;
}

export interface ItemFamily {
  protocol: string;
  visualisationUrl: string;
  url: string;
  filter: {field: string; values: string[];};

}
