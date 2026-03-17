import type { ThemeKey } from "../constants/themes";
import type { YouTubeVideo } from "./youtube";

export type Task = {
  id: string;
  title: string;
  description: string;
  youtube?: YouTubeVideo;
  completed: boolean;
  colorTheme: ThemeKey;
  x: number;
  y: number;
  zIndex: number;
  rotation: number;
};
