import { useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import type { YouTubeVideo } from "../../types/youtube";

type YouTubePreviewProps = {
  youtube: YouTubeVideo;
};

const resolveSubtitle = (youtube: YouTubeVideo): string => {
  if (youtube.status === "loading") {
    return "Loading video info...";
  }

  if (youtube.status === "error") {
    return youtube.errorMessage || "Could not load video details.";
  }

  return youtube.channel;
};

export function YouTubePreview({ youtube }: YouTubePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtube.videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      onPointerDownCapture={(event) => event.stopPropagation()}
      className="block mb-4 rounded-2xl overflow-hidden bg-white/55 ring-1 ring-black/5 hover:ring-[#78CDB0]/50 transition-all">
      <div className="relative aspect-video bg-black/10">
        {isPlaying ? (
          <iframe
            title={youtube.title}
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={youtube.thumbnailUrl}
              alt={youtube.title}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/10" />
          </>
        )}

        {!isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            aria-label={`Play ${youtube.title}`}>
            <span className="w-10 h-10 rounded-full bg-white/90 text-[#E11D48] shadow-lg flex items-center justify-center">
              <Play size={22} fill="currentColor" className="ml-0.5" />
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
            aria-label="Close player">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="px-3 py-2.5">
        <p className="text-sm font-bold text-[#5C4D43] leading-snug">
          {youtube.title}
        </p>
        <p className="text-xs text-[#8C7A6B] mt-1">
          {resolveSubtitle(youtube)}
        </p>
        <a
          href={youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#4A7C68] hover:text-[#3A6B58]">
          Open on YouTube
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
