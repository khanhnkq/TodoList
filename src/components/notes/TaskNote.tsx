import { useState } from "react";
import { motion, type PanInfo, useDragControls } from "motion/react";
import { Resizable } from "re-resizable";
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
  handleResizeEnd: (id: string, width: number, height: number) => void;
  zoomScale: number;
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
  handleResizeEnd,
  zoomScale,
}: TaskNoteProps) {
  const theme = THEMES[task.colorTheme];
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ left: 0, top: 0 }}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onPointerDown={(e) => {
        if (
          !isEditing &&
          !isResizing &&
          !(e.target as HTMLElement).closest('.custom-resize-handle')
        ) {
          dragControls.start(e);
        }
      }}
      onMouseDown={() => bringToFront(task.id)}
      onDragEnd={(_event, info) => {
        setIsDragging(false);
        handleDragEnd(task.id, info);
      }}
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
      style={{
        position: "absolute",
        zIndex: task.zIndex,
      }}
      className="cursor-grab active:cursor-grabbing group task-note">
      <Pin theme={theme} />

      <Resizable
        size={{ width: task.width || 320, height: task.height || 400 }}
        minWidth={200}
        minHeight={150}
        scale={zoomScale}
        onResizeStart={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
        onResizeStop={(_e, _direction, ref) => {
          setIsResizing(false);
          updateTask(task.id, { width: ref.offsetWidth, height: ref.offsetHeight });
          handleResizeEnd(task.id, ref.offsetWidth, ref.offsetHeight);
        }}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: !isDragging,
          bottomLeft: false,
          topLeft: false,
        }}
        handleClasses={{
          bottomRight: 'custom-resize-handle',
        }}
        handleComponent={{
          bottomRight: (
            <div 
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bottom-5 right-5 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/5 hover:bg-black/10 rounded-full"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black/30 rotate-90">
                <polyline points="21 3 21 21 3 21"></polyline>
              </svg>
            </div>
          )
        }}
        className={`bg-[#FDFBF7] rounded-[2rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.15)] p-2.5 relative overflow-hidden transition duration-300 flex flex-col ${task.completed ? "opacity-60 grayscale-[0.3]" : ""}`}
      >
        <NoteContent
          task={task}
          index={index}
          theme={theme}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          updateTask={updateTask}
          setIsEditing={setIsEditing}
        />
      </Resizable>
    </motion.div>
  );
}
