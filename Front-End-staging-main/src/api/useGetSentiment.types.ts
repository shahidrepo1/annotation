export type MediaFile = {
  id: number;
  name: string;
  media_type: "text" | "video" | "audio";
  media_file: string;
  module_name: string;
  uploaded_at: string;
  is_annotated: boolean;
};

export type Sentiment = {
  id: number;
  label: "positive" | "negative" | "neutral";
};

export type SentimentEntry = {
  id: number;
  media_file: MediaFile;
  sentiment: Sentiment;
  unique_id: string;
  created_at: string;
  is_edited: boolean;
  is_untrained: boolean;
  is_deleted: boolean;
  user: number;
};

export type SentimentGroup = {
  positive?: Array<SentimentEntry>;
  negative?: Array<SentimentEntry>;
  neutral?: Array<SentimentEntry>;
};

export type SentimentDataResponse = {
  trainedData: SentimentGroup;
  untrainedData: SentimentGroup;
};
