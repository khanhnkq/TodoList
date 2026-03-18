import { Fragment, useEffect, useState, type FormEvent, useMemo, useRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { Plus, Minus, RotateCcw, LayoutPanelLeft, LayoutPanelTop, MousePointer2, Grab } from "lucide-react";
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { BoardThemeSwitcher } from "./components/board/BoardThemeSwitcher";
import { AddTaskForm } from "./components/forms/AddTaskForm";
import { TaskNote } from "./components/notes/TaskNote";
import {
  BOARD_THEMES,
  THEMES,
  type BoardThemeKey,
  type ThemeKey,
} from "./constants/themes";
import { INITIAL_TASKS } from "./data/initialTasks";
import type { Task } from "./types/task";
import { generateId } from "./utils/generateId";
import { createYouTubeDraft, fetchYouTubeMetadata } from "./utils/youtube";

const BOARD_STORAGE_KEY = "island-tasks-board:v1";

type PersistedBoardState = {
  tasks: Task[];
  boardTheme: BoardThemeKey;
  selectedNewTheme: ThemeKey;
  maxZIndex: number;
  zoomLevel: number;
  isAddFormVisible: boolean;
};

const deriveMaxZIndex = (tasks: Task[], fallback: number): number => {
  const zIndexes = tasks
    .map((task) => task.zIndex)
    .filter((zIndex) => Number.isFinite(zIndex));

  if (!zIndexes.length) {
    return fallback;
  }

  return Math.max(fallback, ...zIndexes);
};

const createDefaultBoardState = (): PersistedBoardState => ({
  tasks: INITIAL_TASKS,
  boardTheme: "grass",
  selectedNewTheme: "mint",
  maxZIndex: deriveMaxZIndex(INITIAL_TASKS, 10),
  zoomLevel: 1,
  isAddFormVisible: true,
});

const loadBoardState = (): PersistedBoardState => {
  const defaults = createDefaultBoardState();

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const serializedState = window.localStorage.getItem(BOARD_STORAGE_KEY);
    if (!serializedState) {
      return defaults;
    }

    const parsedState = JSON.parse(
      serializedState,
    ) as Partial<PersistedBoardState>;
    const tasks = Array.isArray(parsedState.tasks)
      ? parsedState.tasks
      : defaults.tasks;
    const boardTheme =
      typeof parsedState.boardTheme === "string" &&
      parsedState.boardTheme in BOARD_THEMES
        ? (parsedState.boardTheme as BoardThemeKey)
        : defaults.boardTheme;
    const selectedNewTheme =
      typeof parsedState.selectedNewTheme === "string" &&
      parsedState.selectedNewTheme in THEMES
        ? (parsedState.selectedNewTheme as ThemeKey)
        : defaults.selectedNewTheme;
    const storedMaxZIndex =
      typeof parsedState.maxZIndex === "number"
        ? parsedState.maxZIndex
        : defaults.maxZIndex;

    const zoomLevel =
      typeof parsedState.zoomLevel === "number"
        ? parsedState.zoomLevel
        : defaults.zoomLevel;
    const isAddFormVisible =
      typeof parsedState.isAddFormVisible === "boolean"
        ? parsedState.isAddFormVisible
        : defaults.isAddFormVisible;

    return {
      tasks,
      boardTheme,
      selectedNewTheme,
      maxZIndex: deriveMaxZIndex(tasks, storedMaxZIndex),
      zoomLevel,
      isAddFormVisible,
    };
  } catch {
    return defaults;
  }
};

export default function App() {
  const [initialBoardState] = useState<PersistedBoardState>(loadBoardState);
  const [tasks, setTasks] = useState<Task[]>(initialBoardState.tasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskYoutubeUrl, setNewTaskYoutubeUrl] = useState("");
  const [youtubeUrlError, setYoutubeUrlError] = useState("");
  const [selectedNewTheme, setSelectedNewTheme] = useState<ThemeKey>(
    initialBoardState.selectedNewTheme,
  );
  const [boardTheme, setBoardTheme] = useState<BoardThemeKey>(
    initialBoardState.boardTheme,
  );
  const [maxZIndex, setMaxZIndex] = useState(initialBoardState.maxZIndex);
  const [zoomLevel, setZoomLevel] = useState(initialBoardState.zoomLevel);
  const [isAddFormVisible, setIsAddFormVisible] = useState(
    initialBoardState.isAddFormVisible,
  );
  const [isPanning, setIsPanning] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persistedState: PersistedBoardState = {
      tasks,
      boardTheme,
      selectedNewTheme,
      maxZIndex: deriveMaxZIndex(tasks, maxZIndex),
      zoomLevel,
      isAddFormVisible,
    };

    try {
      window.localStorage.setItem(
        BOARD_STORAGE_KEY,
        JSON.stringify(persistedState),
      );
    } catch {
      // Ignore storage errors and keep the app usable.
    }
  }, [tasks, boardTheme, selectedNewTheme, maxZIndex, zoomLevel, isAddFormVisible]);

  const bringToFront = (id: string) => {
    setMaxZIndex((previousMaxZIndex) => {
      const nextZIndex = previousMaxZIndex + 1;

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id ? { ...task, zIndex: nextZIndex } : task,
        ),
      );

      return nextZIndex;
    });
  };

  const handleDragEnd = (id: string, info: PanInfo) => {
    // Current zoom from state (synchronized via onTransformed) or library ref
    const currentScale = transformComponentRef.current?.instance.transformState.scale || zoomLevel;
    
    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return {
          ...task,
          x: Math.max(0, task.x + info.offset.x / currentScale),
          y: Math.max(0, task.y + info.offset.y / currentScale),
        };
      }),
    );
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    const trimmedYoutubeUrl = newTaskYoutubeUrl.trim();
    const youtubeDraft = trimmedYoutubeUrl
      ? createYouTubeDraft(trimmedYoutubeUrl)
      : null;

    if (trimmedYoutubeUrl && !youtubeDraft) {
      setYoutubeUrlError("Please paste a valid YouTube URL.");
      return;
    }

    setYoutubeUrlError("");

    const centerX =
      typeof window !== "undefined" ? window.innerWidth / 2 - 160 : 200;
    const centerY =
      typeof window !== "undefined" ? window.innerHeight / 2 - 100 : 200;

    const newTaskId = generateId();
    const nextZIndex = maxZIndex + 1;
    const newTask: Task = {
      id: newTaskId,
      title: trimmedTitle,
      description: newTaskDesc.trim(),
      youtube: youtubeDraft || undefined,
      completed: false,
      colorTheme: selectedNewTheme,
      x: centerX + (Math.random() * 60 - 30),
      y: centerY + (Math.random() * 60 - 30),
      zIndex: nextZIndex,
      rotation: Math.random() * 6 - 3,
    };

    setMaxZIndex(nextZIndex);
    setTasks((previousTasks) => [...previousTasks, newTask]);

    if (youtubeDraft) {
      void fetchYouTubeMetadata(youtubeDraft.url)
        .then((metadata) => {
          setTasks((previousTasks) =>
            previousTasks.map((task) => {
              if (task.id !== newTaskId || !task.youtube) {
                return task;
              }

              return {
                ...task,
                youtube: {
                  ...task.youtube,
                  title: metadata.title,
                  channel: metadata.channel,
                  thumbnailUrl:
                    metadata.thumbnailUrl || task.youtube.thumbnailUrl,
                  status: "ready",
                  errorMessage: undefined,
                },
              };
            }),
          );
        })
        .catch(() => {
          setTasks((previousTasks) =>
            previousTasks.map((task) => {
              if (task.id !== newTaskId || !task.youtube) {
                return task;
              }

              return {
                ...task,
                youtube: {
                  ...task.youtube,
                  status: "error",
                  channel: "YouTube",
                  errorMessage: "Could not load video details.",
                },
              };
            }),
          );
        });
    }

    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskYoutubeUrl("");
  };

  const handleYoutubeUrlChange = (value: string) => {
    setNewTaskYoutubeUrl(value);
    if (youtubeUrlError) {
      setYoutubeUrlError("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((previousTasks) => previousTasks.filter((task) => task.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    );
  };

  const boardWidth = Math.max(
    typeof window !== "undefined" ? window.innerWidth : 1000,
    ...tasks.map((task) => task.x + 350),
  );
  const boardHeight = Math.max(
    typeof window !== "undefined" ? window.innerHeight : 1000,
    ...tasks.map((task) => task.y + 350),
  );

  const zoomPercent = useMemo(
    () => Math.round(zoomLevel * 100),
    [zoomLevel],
  );

  return (
    <div
      className="w-screen h-screen overflow-hidden font-sans transition-colors duration-500"
      style={{
        backgroundColor: BOARD_THEMES[boardTheme].bg,
        backgroundImage: BOARD_THEMES[boardTheme].pattern,
      }}>
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={initialBoardState.zoomLevel}
        minScale={0.2}
        maxScale={3}
        centerOnInit={false}
        disabled={false}
        limitToBounds={false}
        onTransformed={(ref) => setZoomLevel(ref.state.scale)}
        panning={{
          disabled: !isPanning,
        }}
        wheel={{
          step: 0.1,
        }}
        doubleClick={{
          disabled: true,
        }}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-8 left-8 z-30 flex justify-between items-start w-[calc(100%-4rem)] pointer-events-none">
              <div className="flex flex-col gap-4 pointer-events-auto">
                <AnimatePresence>
                  {isAddFormVisible && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-4">
                      <BoardThemeSwitcher
                        boardTheme={boardTheme}
                        onThemeChange={setBoardTheme}
                      />

                      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm self-start">
                        <button
                          onClick={() => zoomOut()}
                          className="p-2 rounded-xl hover:bg-black/5 transition-colors"
                          title="Zoom Out">
                          <Minus size={20} className="text-[#5C4D43]" />
                        </button>
                        <span className="min-w-[3rem] text-center font-bold text-sm text-[#5C4D43]">
                          {zoomPercent}%
                        </span>
                        <button
                          onClick={() => zoomIn()}
                          className="p-2 rounded-xl hover:bg-black/5 transition-colors"
                          title="Zoom In">
                          <Plus size={20} className="text-[#5C4D43]" />
                        </button>
                        <div className="w-px h-4 bg-black/10 mx-1" />
                        <button
                          onClick={() => resetTransform()}
                          className="p-2 rounded-xl hover:bg-black/5 transition-colors"
                          title="Reset Zoom">
                          <RotateCcw size={18} className="text-[#5C4D43]" />
                        </button>
                        <div className="w-px h-4 bg-black/10 mx-1" />
                        <button
                          onClick={() => setIsPanning(!isPanning)}
                          className={`p-2 rounded-xl transition-all ${isPanning ? "bg-[#78CDB0] text-white shadow-inner" : "hover:bg-black/5 text-[#5C4D43]"}`}
                          title={isPanning ? "Switch to Select" : "Switch to Pan"}>
                          {isPanning ? (
                            <Grab size={20} />
                          ) : (
                            <MousePointer2 size={20} />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-4 pointer-events-auto">
                <button
                  onClick={() => setIsAddFormVisible(!isAddFormVisible)}
                  className={`p-3 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm transition-all active:scale-95 group ${isAddFormVisible ? "bg-white/80 hover:bg-white" : "bg-[#78CDB0] text-white hover:bg-[#63B48E]"}`}
                  title={isAddFormVisible ? "Hide UI" : "Show UI"}>
                  {isAddFormVisible ? (
                    <LayoutPanelTop size={24} />
                  ) : (
                    <LayoutPanelLeft size={24} />
                  )}
                </button>
              </div>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: "100vw",
                height: "100vh",
              }}
              contentStyle={{
                width: boardWidth,
                height: boardHeight,
              }}>
              <div
                className="relative min-w-full min-h-full"
                style={{ width: boardWidth, height: boardHeight }}>
                <div className="absolute inset-0 z-10">
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task, index) => (
                      <Fragment key={task.id}>
                        <TaskNote
                          task={task}
                          index={index}
                          bringToFront={bringToFront}
                          handleDragEnd={handleDragEnd}
                          toggleTask={toggleTask}
                          deleteTask={deleteTask}
                          updateTask={updateTask}
                          isEditing={editingNoteId === task.id}
                          setIsEditing={(isEditing) =>
                            setEditingNoteId(isEditing ? task.id : null)
                          }
                        />
                      </Fragment>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      <AnimatePresence>
        {isAddFormVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-[100] pb-5 flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full flex justify-center">
              <AddTaskForm
                newTaskTitle={newTaskTitle}
                newTaskDesc={newTaskDesc}
                newTaskYoutubeUrl={newTaskYoutubeUrl}
                youtubeUrlError={youtubeUrlError}
                selectedNewTheme={selectedNewTheme}
                onTitleChange={setNewTaskTitle}
                onDescChange={setNewTaskDesc}
                onYoutubeUrlChange={handleYoutubeUrlChange}
                onThemeChange={setSelectedNewTheme}
                onSubmit={addTask}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
