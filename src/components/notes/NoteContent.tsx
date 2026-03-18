import { useEffect, useState } from "react";
import { Check, Palette, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  THEMES,
  type ThemeConfig,
  type ThemeKey,
} from "../../constants/themes";
import type { Task } from "../../types/task";
import { YouTubePreview } from "./YouTubePreview";

type NoteContentProps = {
  task: Task;
  index: number;
  theme: ThemeConfig;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setIsEditing: (isEditing: boolean) => void;
};

export function NoteContent({
  task,
  index,
  theme,
  toggleTask,
  deleteTask,
  updateTask,
  setIsEditing,
}: NoteContentProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);

  useEffect(() => {
    setIsEditing(isEditingTitle || isEditingDesc);
  }, [isEditingTitle, isEditingDesc, setIsEditing]);

  useEffect(() => {
    setEditTitle(task.title);
    setEditDesc(task.description);
  }, [task.title, task.description]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (editTitle.trim() !== task.title) {
      const newTitle = editTitle.trim() || "Untitled";
      updateTask(task.id, { title: newTitle });
      setEditTitle(newTitle);
    }
  };

  const handleDescSave = () => {
    setIsEditingDesc(false);
    if (editDesc.trim() !== task.description) {
      updateTask(task.id, { description: editDesc.trim() });
      setEditDesc(editDesc.trim());
    }
  };

  return (
    <div
      className={`w-full h-full ${theme.bg} rounded-[1.5rem] p-8 flex flex-col relative min-h-0`}>
      <div className="mb-4 pointer-events-none">
        <span
          className={`${theme.text} font-handwriting text-4xl font-bold opacity-80`}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {task.youtube ? <YouTubePreview youtube={task.youtube} /> : null}

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6 z-10">
        <div className="relative">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setShowPalette(!showPalette);
            }}
            onPointerDownCapture={(event) => event.stopPropagation()}
            className="p-2.5 bg-[#FDFBF7]/80 hover:bg-[#FDFBF7] rounded-full text-[#8C7A6B] transition-all shadow-sm hover:shadow hover:scale-110 cursor-pointer"
            title="Change color">
            <Palette size={18} />
          </button>

          <AnimatePresence>
            {showPalette && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg p-2 flex gap-2 border border-black/5"
                onPointerDownCapture={(event) => event.stopPropagation()}>
                {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => (
                  <button
                    key={themeKey}
                    onClick={(event) => {
                      event.stopPropagation();
                      updateTask(task.id, { colorTheme: themeKey });
                      setShowPalette(false);
                    }}
                    className={`w-6 h-6 rounded-full ${THEMES[themeKey].swatch} shadow-sm hover:scale-110 transition-transform ${task.colorTheme === themeKey ? "ring-2 ring-offset-1 ring-black/20" : ""}`}
                    title={themeKey}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            toggleTask(task.id);
          }}
          onPointerDownCapture={(event) => event.stopPropagation()}
          className="p-2.5 bg-[#FDFBF7]/80 hover:bg-[#FDFBF7] rounded-full text-[#8C7A6B] transition-all shadow-sm hover:shadow hover:scale-110 cursor-pointer"
          title={task.completed ? "Mark incomplete" : "Mark complete"}>
          <Check size={18} className={task.completed ? "text-[#78CDB0]" : ""} />
        </button>

        <button
          onClick={(event) => {
            event.stopPropagation();
            deleteTask(task.id);
          }}
          onPointerDownCapture={(event) => event.stopPropagation()}
          className="p-2.5 bg-[#FDFBF7]/80 hover:bg-[#FDFBF7] rounded-full text-[#E5989B] transition-all shadow-sm hover:shadow hover:scale-110 cursor-pointer"
          title="Delete task">
          <Trash2 size={18} />
        </button>
      </div>

      {isEditingTitle ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(event) => setEditTitle(event.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleTitleSave();
            }
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          className={`text-2xl font-bold text-[#5C4D43] mb-3 leading-tight bg-white/50 rounded px-2 -ml-2 outline-none focus:ring-2 focus:ring-[#78CDB0]/40 w-full ${task.completed ? "line-through opacity-50" : ""}`}
        />
      ) : (
        <h3
          onDoubleClick={(event) => {
            event.stopPropagation();
            setIsEditingTitle(true);
          }}
          onPointerDownCapture={(event) => event.stopPropagation()}
          className={`text-2xl font-bold text-[#5C4D43] mb-3 leading-tight cursor-text hover:bg-white/40 rounded px-2 -ml-2 transition-colors ${task.completed ? "line-through opacity-50" : ""}`}
          title="Double click to edit">
          {task.title}
        </h3>
      )}

      {isEditingDesc ? (
        <textarea
          autoFocus
          value={editDesc}
          onChange={(event) => setEditDesc(event.target.value)}
          onBlur={handleDescSave}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              handleDescSave();
            }
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          style={{ height: '100%' }}
          className={`text-base font-medium text-[#8C7A6B] leading-relaxed flex-grow bg-white/50 rounded px-2 -ml-2 outline-none focus:ring-2 focus:ring-[#78CDB0]/40 w-full resize-none whitespace-pre-wrap ${task.completed ? "line-through opacity-50" : ""}`}
          rows={6}
        />
      ) : (
        <div className="flex flex-col flex-grow overflow-hidden min-h-0">
          <p
            onDoubleClick={(event) => {
              event.stopPropagation();
              setIsEditingDesc(true);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            className={`text-base font-medium text-[#8C7A6B] leading-relaxed cursor-text hover:bg-white/40 rounded px-2 -ml-2 transition-colors whitespace-pre-wrap ${
              !isExpanded && (task.description?.length || 0) > 200 ? "line-clamp-[8]" : "overflow-y-auto min-h-0 custom-scrollbar pb-2"
            } ${task.completed ? "line-through opacity-50" : ""}`}
            title="Double click to edit (Cmd+Enter to save)">
            {task.description || "Double click to add description..."}
          </p>
          {(task.description?.length || 0) > 200 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-[#78CDB0] text-sm font-bold mt-1 hover:underline self-start">
              {isExpanded ? "See Less" : "See More..."}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
