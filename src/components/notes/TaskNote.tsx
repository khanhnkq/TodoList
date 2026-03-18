import { motion, type PanInfo } from "motion/react";
import { THEMES } from "../../constants/themes";
import type { Task } from "../../types/task";
import { NoteContent } from "./NoteContent";
import { Pin } from "./Pin";

type TaskNoteProps = {
  task: Task;
  index: number;
  bringToFront: (id: string) => void;
  handleDragEnd: (id: string, info: PanInfo) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
};

export function TaskNote({
  task,
  index,
  bringToFront,
  handleDragEnd,
  toggleTask,
  deleteTask,
  updateTask,
  isEditing,
  setIsEditing,
}: TaskNoteProps) {
  const theme = THEMES[task.colorTheme];

  return (
    <motion.div
      drag
      dragListener={!isEditing}
      dragConstraints={{ left: 0, top: 0 }}
      dragMomentum={false}
      onMouseDown={() => bringToFront(task.id)}
      onDragEnd={(_event, info) => handleDragEnd(task.id, info)}
      initial={{
        opacity: 0,
        scale: 0.8,
        x: task.x,
        y: task.y,
        rotate: task.rotation,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        x: task.x,
        y: task.y,
        rotate: task.rotation,
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ position: "absolute", zIndex: task.zIndex }}
      className="w-80 cursor-grab active:cursor-grabbing group task-note">
      <Pin theme={theme} />

      <div
        className={`bg-[#FDFBF7] rounded-[2rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.15)] p-2.5 relative overflow-hidden transition-all duration-300 ${task.completed ? "opacity-60 grayscale-[0.3]" : ""}`}>
        <NoteContent
          task={task}
          index={index}
          theme={theme}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          updateTask={updateTask}
          setIsEditing={setIsEditing}
        />
      </div>
    </motion.div>
  );
}
