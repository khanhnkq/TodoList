import type { YouTubeVideo } from "../types/youtube";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
]);

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

type YouTubeOEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

const sanitizeVideoId = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  return VIDEO_ID_REGEX.test(trimmedValue) ? trimmedValue : null;
};

export const buildYouTubeWatchUrl = (videoId: string): string =>
  `https://www.youtube.com/watch?v=${videoId}`;

export const buildYouTubeThumbnailUrl = (videoId: string): string =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export const extractYouTubeVideoId = (rawUrl: string): string | null => {
  try {
    const parsedUrl = new URL(rawUrl.trim());
    const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

    if (!YOUTUBE_HOSTS.has(host)) {
      return null;
    }

    if (host === "youtu.be") {
      const shortId = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
      return sanitizeVideoId(shortId);
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
      const firstSegment = pathSegments[0] ?? "";

      if (parsedUrl.pathname === "/watch" || firstSegment === "watch") {
        return sanitizeVideoId(parsedUrl.searchParams.get("v"));
      }

      if (
        firstSegment === "shorts" ||
        firstSegment === "embed" ||
        firstSegment === "live"
      ) {
        return sanitizeVideoId(pathSegments[1] ?? null);
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const createYouTubeDraft = (rawUrl: string): YouTubeVideo | null => {
  const videoId = extractYouTubeVideoId(rawUrl);
  if (!videoId) {
    return null;
  }

  return {
    url: buildYouTubeWatchUrl(videoId),
    videoId,
    thumbnailUrl: buildYouTubeThumbnailUrl(videoId),
    title: "YouTube video",
    channel: "Loading channel...",
    status: "loading",
  };
};

export const fetchYouTubeMetadata = async (
  videoUrl: string,
): Promise<Pick<YouTubeVideo, "title" | "channel" | "thumbnailUrl">> => {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Could not load YouTube metadata");
  }

  const payload = (await response.json()) as YouTubeOEmbedResponse;
  return {
    title: payload.title?.trim() || "YouTube video",
    channel: payload.author_name?.trim() || "YouTube",
    thumbnailUrl: payload.thumbnail_url?.trim() || "",
  };
};
