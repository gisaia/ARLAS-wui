export interface DownloadSettings {
  id?: string;
  version?: string;
  title?: string;
  description?: string;
  inputs?: DownloadSettingsInputs;
}

export interface DownloadSettingsInputs {
  [key: string]: DownloadInput;
}

export interface DownloadInput {
  title: string;
  description: string;
  schema: {
    type: string;
    enum?: string[];
    format?: string;
    items?: {
      type: string;
      enum?: string[];
    };
    required?: boolean;
  };
}
