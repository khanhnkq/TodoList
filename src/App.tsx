import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, Palette } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

const THEMES = {
  mint: {
    bg: 'bg-[#E8F5F1]',
    text: 'text-[#4A7C68]',
    pinHead: 'bg-gradient-to-br from-[#A6E4D0] to-[#78CDB0]',
    swatch: 'bg-[#A6E4D0]',
  },
  cream: {
    bg: 'bg-[#FFF9E6]',
    text: 'text-[#8A6B22]',
    pinHead: 'bg-gradient-to-br from-[#FCE08B] to-[#F5C242]',
    swatch: 'bg-[#FCE08B]',
  },
  pink: {
    bg: 'bg-[#FDF0F3]',
    text: 'text-[#9E5B6A]',
    pinHead: 'bg-gradient-to-br from-[#F4C2C2] to-[#E5989B]',
    swatch: 'bg-[#F4C2C2]',
  },
  blue: {
    bg: 'bg-[#EBF4F8]',
    text: 'text-[#4A7B8C]',
    pinHead: 'bg-gradient-to-br from-[#A3D5E0] to-[#7AB8C8]',
    swatch: 'bg-[#A3D5E0]',
  },
  lavender: {
    bg: 'bg-[#F4EBF7]',
    text: 'text-[#7A5C8C]',
    pinHead: 'bg-gradient-to-br from-[#D8B4E2] to-[#B882C6]',
    swatch: 'bg-[#D8B4E2]',
  },
  peach: {
    bg: 'bg-[#FFF0E6]',
    text: 'text-[#8C5A4A]',
    pinHead: 'bg-gradient-to-br from-[#FFCBA4] to-[#F4A460]',
    swatch: 'bg-[#FFCBA4]',
  }
};

type ThemeKey = keyof typeof THEMES;

const BOARD_THEMES = {
  grass: {
    bg: '#63B48E',
    pattern: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 15 L25 30 L5 30 Z' fill='%2352A37D' transform='rotate(15 15 22)'/%3E%3Cpath d='M85 65 L95 80 L75 80 Z' fill='%2352A37D' transform='rotate(-25 85 72)'/%3E%3Cpath d='M50 100 L60 115 L40 115 Z' fill='%2352A37D' transform='rotate(45 50 107)'/%3E%3C/svg%3E")`,
    name: 'Grass'
  },
  sand: {
    bg: '#E8D5A5',
    pattern: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23D4C08D'/%3E%3Ccircle cx='80' cy='60' r='1.5' fill='%23D4C08D'/%3E%3Ccircle cx='40' cy='100' r='2.5' fill='%23D4C08D'/%3E%3C/svg%3E")`,
    name: 'Sand'
  },
  wood: {
    bg: '#A67B5B',
    pattern: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0, 50 10 T 100 10' fill='none' stroke='%238B6346' stroke-width='1' opacity='0.5'/%3E%3C/svg%3E")`,
    name: 'Wood'
  },
  night: {
    bg: '#2C3E50',
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='%2334495E'/%3E%3C/svg%3E")`,
    name: 'Night'
  }
};

type BoardThemeKey = keyof typeof BOARD_THEMES;

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  colorTheme: ThemeKey;
  x: number;
  y: number;
  zIndex: number;
  rotation: number;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const Pin = ({ theme }: { theme: any }) => (
  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
    {/* Pin Head */}
    <div className={`w-6 h-6 rounded-full ${theme.pinHead} shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.15),_inset_3px_3px_6px_rgba(255,255,255,0.8),_0_5px_10px_rgba(0,0,0,0.1)] relative z-10 flex items-center justify-center`}>
      {/* Highlight */}
      <div className="absolute top-1 left-1.5 w-2 h-2 bg-white/90 rounded-full blur-[0.5px]" />
    </div>
    {/* Needle */}
    <div className="w-1.5 h-4 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 rounded-b-sm -mt-1 relative z-0" />
    {/* Shadow */}
    <div className="absolute top-6 left-3 w-5 h-1.5 bg-black/10 blur-[2px] rounded-full rotate-[40deg] origin-left" />
  </div>
);

const NoteContent = ({ task, index, theme, toggleTask, deleteTask, updateTask }: { task: Task, index: number, theme: any, toggleTask: (id: string) => void, deleteTask: (id: string) => void, updateTask: (id: string, updates: Partial<Task>) => void }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);

  useEffect(() => {
    setEditTitle(task.title);
    setEditDesc(task.description);
  }, [task.title, task.description]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (editTitle.trim() !== task.title) {
      const newTitle = editTitle.trim() || 'Untitled';
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
    <div className={`${theme.bg} rounded-[1.5rem] p-8 min-h-[200px] flex flex-col relative`}>
      {/* Number */}
      <div className="mb-4 pointer-events-none">
        <span className={`${theme.text} font-handwriting text-4xl font-bold opacity-80`}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6 z-10">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowPalette(!showPalette); }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="p-2.5 bg-[#FDFBF7]/80 hover:bg-[#FDFBF7] rounded-full text-[#8C7A6B] transition-all shadow-sm hover:shadow hover:scale-110 cursor-pointer"
            title="Change color"
          >
            <Palette size={18} />
          </button>
          
          <AnimatePresence>
            {showPalette && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg p-2 flex gap-2 border border-black/5"
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                {(Object.keys(THEMES) as ThemeKey[]).map(t => (
                  <button
                    key={t}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTask(task.id, { colorTheme: t });
                      setShowPalette(false);
                    }}
                    className={`w-6 h-6 rounded-full ${THEMES[t].swatch} shadow-sm hover:scale-110 transition-transform ${task.colorTheme === t ? 'ring-2 ring-offset-1 ring-black/20' : ''}`}
                    title={t}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="p-2.5 bg-[#FDFBF7]/80 hover:bg-[#FDFBF7] rounded-full text-[#8C7A6B] transition-all shadow-sm hover:shadow hover:scale-110 cursor-pointer"
          title={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          <Check size={18} className={task.completed ? "text-[#78CDB0]" : ""} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="p-2.5 bg-[#FDFBF7]/80 hover:bg-[#FDFBF7] rounded-full text-[#E5989B] transition-all shadow-sm hover:shadow hover:scale-110 cursor-pointer"
          title="Delete task"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      {isEditingTitle ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSave();
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className={`text-2xl font-bold text-[#5C4D43] mb-3 leading-tight bg-white/50 rounded px-2 -ml-2 outline-none focus:ring-2 focus:ring-[#78CDB0]/40 w-full ${task.completed ? 'line-through opacity-50' : ''}`}
        />
      ) : (
        <h3 
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className={`text-2xl font-bold text-[#5C4D43] mb-3 leading-tight cursor-text hover:bg-white/40 rounded px-2 -ml-2 transition-colors ${task.completed ? 'line-through opacity-50' : ''}`}
          title="Double click to edit"
        >
          {task.title}
        </h3>
      )}
      
      {isEditingDesc ? (
        <textarea
          autoFocus
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onBlur={handleDescSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleDescSave();
            }
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className={`text-base font-medium text-[#8C7A6B] leading-relaxed flex-grow bg-white/50 rounded px-2 -ml-2 outline-none focus:ring-2 focus:ring-[#78CDB0]/40 w-full resize-none ${task.completed ? 'line-through opacity-50' : ''}`}
          rows={4}
        />
      ) : (
        <p 
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditingDesc(true); }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className={`text-base font-medium text-[#8C7A6B] leading-relaxed flex-grow cursor-text hover:bg-white/40 rounded px-2 -ml-2 transition-colors min-h-[3rem] ${task.completed ? 'line-through opacity-50' : ''}`}
          title="Double click to edit"
        >
          {task.description || "Double click to add description..."}
        </p>
      )}
    </div>
  );
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Nook\'s Cranny Update',
      description: 'Check today\'s turnip prices and premium items before noon!',
      completed: false,
      colorTheme: 'cream',
      x: 100, y: 120, zIndex: 1, rotation: -2
    },
    {
      id: '2',
      title: 'Island Visiting',
      description: 'Saharah and Gulliver are visiting today. Find them on the beaches.',
      completed: false,
      colorTheme: 'mint',
      x: 450, y: 80, zIndex: 2, rotation: 3
    },
    {
      id: '3',
      title: 'Ongoing Events',
      description: 'Sakura Event (April 1st - 10th) and Easter Event (April 1st - 12th) are active.',
      completed: false,
      colorTheme: 'pink',
      x: 800, y: 150, zIndex: 3, rotation: -1
    },
    {
      id: '4',
      title: 'Daily Messages',
      description: 'Reply to Alfance about the items they wanted. Send them over via mail.',
      completed: false,
      colorTheme: 'blue',
      x: 150, y: 420, zIndex: 4, rotation: 2
    },
    {
      id: '5',
      title: 'Season Update',
      description: 'Catch new fish and bugs for the museum. Check the critterpedia.',
      completed: false,
      colorTheme: 'mint',
      x: 520, y: 380, zIndex: 5, rotation: -3
    },
    {
      id: '6',
      title: 'Turnip Analytics',
      description: 'Record morning price: 62 Bells. Waiting for afternoon spike.',
      completed: false,
      colorTheme: 'cream',
      x: 880, y: 450, zIndex: 6, rotation: 1
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedNewTheme, setSelectedNewTheme] = useState<ThemeKey>('mint');
  const [boardTheme, setBoardTheme] = useState<BoardThemeKey>('grass');
  const [maxZIndex, setMaxZIndex] = useState(10);

  const boardRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  const handleBoardMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.task-note') || target.closest('.interactive-element')) {
      return;
    }
    e.preventDefault(); // Prevent text selection while panning
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    if (boardRef.current) {
      setScrollStart({ left: boardRef.current.scrollLeft, top: boardRef.current.scrollTop });
    }
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !boardRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    boardRef.current.scrollLeft = scrollStart.left - dx;
    boardRef.current.scrollTop = scrollStart.top - dy;
  };

  const handleBoardMouseUp = () => {
    setIsPanning(false);
  };

  const bringToFront = (id: string) => {
    setMaxZIndex(prev => prev + 1);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, zIndex: maxZIndex + 1 } : t));
  };

  const handleDragEnd = (id: string, info: PanInfo) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          x: Math.max(0, t.x + info.offset.x), 
          y: Math.max(0, t.y + info.offset.y) 
        };
      }
      return t;
    }));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 - 160 : 200;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 200;

    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle,
      description: newTaskDesc,
      completed: false,
      colorTheme: selectedNewTheme,
      x: centerX + (Math.random() * 60 - 30),
      y: centerY + (Math.random() * 60 - 30),
      zIndex: maxZIndex + 1,
      rotation: Math.random() * 6 - 3,
    };

    setMaxZIndex(prev => prev + 1);
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const boardWidth = Math.max(typeof window !== 'undefined' ? window.innerWidth : 1000, ...tasks.map(t => t.x + 350));
  const boardHeight = Math.max(typeof window !== 'undefined' ? window.innerHeight : 1000, ...tasks.map(t => t.y + 350));

  return (
    <div 
      ref={boardRef}
      onMouseDown={handleBoardMouseDown}
      onMouseMove={handleBoardMouseMove}
      onMouseUp={handleBoardMouseUp}
      onMouseLeave={handleBoardMouseUp}
      className={`w-screen h-screen overflow-auto font-sans transition-colors duration-500 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        backgroundColor: BOARD_THEMES[boardTheme].bg,
        backgroundImage: BOARD_THEMES[boardTheme].pattern,
      }}
    >
      <div 
        className="relative min-w-full min-h-full transition-all duration-300"
        style={{ width: boardWidth, height: boardHeight }}
      >
        {/* Header */}
        <div className="absolute top-8 left-8 z-10 pointer-events-none flex justify-between items-start w-[calc(100%-4rem)]">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-sm">Island Tasks</h1>
            <p className="text-lg text-white/90 font-medium drop-shadow-sm">Drag and drop your daily chores.</p>
          </div>
          
          <div className="pointer-events-auto flex gap-2 bg-white/20 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/30">
            {(Object.keys(BOARD_THEMES) as BoardThemeKey[]).map(t => (
              <button
                key={t}
                onClick={() => setBoardTheme(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${boardTheme === t ? 'bg-white text-[#5C4D43] shadow-sm' : 'text-white hover:bg-white/20'}`}
              >
                {BOARD_THEMES[t].name}
              </button>
            ))}
          </div>
        </div>

        {/* Board Area */}
        <div className="absolute inset-0 z-10">
          <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => {
            const theme = THEMES[task.colorTheme];
            
            return (
              <motion.div 
                key={task.id} 
                drag
                dragConstraints={{ left: 0, top: 0 }}
                dragMomentum={false}
                onMouseDown={() => bringToFront(task.id)}
                onDragEnd={(e, info) => handleDragEnd(task.id, info)}
                initial={{ opacity: 0, scale: 0.8, x: task.x, y: task.y, rotate: task.rotation }}
                animate={{ opacity: 1, scale: 1, x: task.x, y: task.y, rotate: task.rotation }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ position: 'absolute', zIndex: task.zIndex }}
                className="w-80 cursor-grab active:cursor-grabbing group task-note"
              >
                <Pin theme={theme} />

                {/* The Note Card */}
                <div className={`bg-[#FDFBF7] rounded-[2rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.15)] p-2.5 relative overflow-hidden transition-all duration-300 ${task.completed ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                  <NoteContent 
                    task={task} 
                    index={index} 
                    theme={theme} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask} 
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      </div>

      {/* Add Task Form - Floating at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-3xl">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={addTask} 
          className="bg-[#FDFBF7]/95 backdrop-blur-xl p-4 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-white/60 flex flex-col sm:flex-row gap-3 items-stretch interactive-element"
        >
          <div className="flex-grow flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 mb-1">
              {(Object.keys(THEMES) as ThemeKey[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedNewTheme(t)}
                  className={`w-6 h-6 rounded-full ${THEMES[t].swatch} shadow-sm hover:scale-110 transition-transform ${selectedNewTheme === t ? 'ring-2 ring-offset-2 ring-[#78CDB0]' : ''}`}
                  title={`Select ${t} theme`}
                />
              ))}
            </div>
            <input
              type="text"
              placeholder="What's the next step?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-[#F0EBE1] border-transparent focus:bg-white focus:border-[#78CDB0]/30 focus:ring-4 focus:ring-[#78CDB0]/20 transition-all text-lg font-bold text-[#5C4D43] outline-none placeholder:text-[#A89F91]"
              required
            />
            <input
              type="text"
              placeholder="Add some details (optional)..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              className="w-full px-5 py-2.5 rounded-2xl bg-[#F0EBE1] border-transparent focus:bg-white focus:border-[#78CDB0]/30 focus:ring-4 focus:ring-[#78CDB0]/20 transition-all outline-none font-medium text-[#8C7A6B] placeholder:text-[#A89F91] text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-[#78CDB0] text-[#3A6B58] px-8 py-2 rounded-2xl font-bold hover:bg-[#63B48E] hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#78CDB0]/30"
          >
            <Plus size={20} />
            Add Note
          </button>
        </motion.form>
      </div>
    </div>
  );
}
