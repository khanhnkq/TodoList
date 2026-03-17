export type YouTubeMetadataStatus = "loading" | "ready" | "error";

export type YouTubeVideo = {
  url: string;
  videoId: string;
  thumbnailUrl: string;
  title: string;
  channel: string;
  status: YouTubeMetadataStatus;
  errorMessage?: string;
};
