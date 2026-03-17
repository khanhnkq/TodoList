import { BOARD_THEMES, type BoardThemeKey } from "../../constants/themes";

type BoardThemeSwitcherProps = {
  boardTheme: BoardThemeKey;
  onThemeChange: (theme: BoardThemeKey) => void;
};

export function BoardThemeSwitcher({
  boardTheme,
  onThemeChange,
}: BoardThemeSwitcherProps) {
  return (
    <div className="pointer-events-auto flex gap-2 bg-white/20 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/30">
      {(Object.keys(BOARD_THEMES) as BoardThemeKey[]).map((themeKey) => (
        <button
          key={themeKey}
          onClick={() => onThemeChange(themeKey)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${boardTheme === themeKey ? "bg-white text-[#5C4D43] shadow-sm" : "text-white hover:bg-white/20"}`}>
          {BOARD_THEMES[themeKey].name}
        </button>
      ))}
    </div>
  );
}
