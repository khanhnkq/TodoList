import { Fragment, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, type PanInfo } from "motion/react";
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

    return {
      tasks,
      boardTheme,
      selectedNewTheme,
      maxZIndex: deriveMaxZIndex(tasks, storedMaxZIndex),
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persistedState: PersistedBoardState = {
      tasks,
      boardTheme,
      selectedNewTheme,
      maxZIndex: deriveMaxZIndex(tasks, maxZIndex),
    };

    try {
      window.localStorage.setItem(
        BOARD_STORAGE_KEY,
        JSON.stringify(persistedState),
      );
    } catch {
      // Ignore storage errors and keep the app usable.
    }
  }, [tasks, boardTheme, selectedNewTheme, maxZIndex]);

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
    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return {
          ...task,
          x: Math.max(0, task.x + info.offset.x),
          y: Math.max(0, task.y + info.offset.y),
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

  return (
    <div
      className="w-screen h-screen overflow-auto font-sans transition-colors duration-500"
      style={{
        backgroundColor: BOARD_THEMES[boardTheme].bg,
        backgroundImage: BOARD_THEMES[boardTheme].pattern,
      }}>
      <div
        className="relative min-w-full min-h-full transition-all duration-300"
        style={{ width: boardWidth, height: boardHeight }}>
        <div className="absolute top-8 left-8 z-30 pointer-events-none flex justify-between items-start w-[calc(100%-4rem)]">
          <BoardThemeSwitcher
            boardTheme={boardTheme}
            onThemeChange={setBoardTheme}
          />
        </div>

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
                />
              </Fragment>
            ))}
          </AnimatePresence>
        </div>
      </div>

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
  );
}
