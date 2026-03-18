import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { THEMES, type ThemeKey } from "../../constants/themes";

type AddTaskFormProps = {
  newTaskTitle: string;
  newTaskDesc: string;
  newTaskYoutubeUrl: string;
  youtubeUrlError: string;
  selectedNewTheme: ThemeKey;
  onTitleChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onYoutubeUrlChange: (value: string) => void;
  onThemeChange: (theme: ThemeKey) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export function AddTaskForm({
  newTaskTitle,
  newTaskDesc,
  newTaskYoutubeUrl,
  youtubeUrlError,
  selectedNewTheme,
  onTitleChange,
  onDescChange,
  onYoutubeUrlChange,
  onThemeChange,
  onSubmit,
}: AddTaskFormProps) {
  return (
    <div className="w-[94%] max-w-2xl">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={onSubmit}
        className="bg-[#FDFBF7]/96 backdrop-blur-xl p-3 rounded-2xl shadow-[0_14px_35px_-14px_rgba(0,0,0,0.28)] border border-white/70 flex flex-col gap-2 interactive-element">
        <div className="flex items-center gap-2 px-1 overflow-x-auto pb-1">
          {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => (
            <button
              key={themeKey}
              type="button"
              onClick={() => onThemeChange(themeKey)}
              className={`w-5 h-5 rounded-full ${THEMES[themeKey].swatch} shadow-sm hover:scale-110 transition-transform shrink-0 ${selectedNewTheme === themeKey ? "ring-2 ring-offset-2 ring-[#78CDB0]" : ""}`}
              title={`Select ${themeKey} theme`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
          <input
            type="text"
            placeholder="What's the next step?"
            value={newTaskTitle}
            onChange={(event) => onTitleChange(event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F0EBE1] border-transparent focus:bg-white focus:border-[#78CDB0]/35 focus:ring-3 focus:ring-[#78CDB0]/20 transition-all text-base font-semibold text-[#5C4D43] outline-none placeholder:text-[#A89F91]"
            required
          />

          <button
            type="submit"
            className="h-10 bg-[#78CDB0] text-[#2F6454] px-4 rounded-xl font-bold hover:bg-[#63B48E] hover:text-white transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#78CDB0]/30 whitespace-nowrap">
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <textarea
            placeholder="Add some details (optional)..."
            value={newTaskDesc}
            onChange={(event) => onDescChange(event.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-[#F0EBE1] border-transparent focus:bg-white focus:border-[#78CDB0]/35 focus:ring-3 focus:ring-[#78CDB0]/20 transition-all outline-none font-medium text-[#8C7A6B] placeholder:text-[#A89F91] text-sm resize-none min-h-[42px] max-h-32"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />

          <input
            type="url"
            placeholder="Paste YouTube link (optional)..."
            value={newTaskYoutubeUrl}
            onChange={(event) => onYoutubeUrlChange(event.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-[#F0EBE1] border-transparent focus:bg-white focus:border-[#78CDB0]/35 focus:ring-3 focus:ring-[#78CDB0]/20 transition-all outline-none font-medium text-[#8C7A6B] placeholder:text-[#A89F91] text-sm h-[42px]"
          />
        </div>

        {youtubeUrlError ? (
          <p className="px-1 text-xs font-medium text-[#C2410C]">
            {youtubeUrlError}
          </p>
        ) : null}
      </motion.form>
    </div>
  );
}
