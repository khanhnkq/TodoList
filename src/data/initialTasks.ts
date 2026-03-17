import type { Task } from "../types/task";

export const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Nook's Cranny Update",
    description: "Check today's turnip prices and premium items before noon!",
    completed: false,
    colorTheme: "cream",
    x: 100,
    y: 120,
    zIndex: 1,
    rotation: -2,
  },
  {
    id: "2",
    title: "Island Visiting",
    description:
      "Saharah and Gulliver are visiting today. Find them on the beaches.",
    completed: false,
    colorTheme: "mint",
    x: 450,
    y: 80,
    zIndex: 2,
    rotation: 3,
  },
  {
    id: "3",
    title: "Ongoing Events",
    description:
      "Sakura Event (April 1st - 10th) and Easter Event (April 1st - 12th) are active.",
    completed: false,
    colorTheme: "pink",
    x: 800,
    y: 150,
    zIndex: 3,
    rotation: -1,
  },
  {
    id: "4",
    title: "Daily Messages",
    description:
      "Reply to Alfance about the items they wanted. Send them over via mail.",
    completed: false,
    colorTheme: "blue",
    x: 150,
    y: 420,
    zIndex: 4,
    rotation: 2,
  },
  {
    id: "5",
    title: "Season Update",
    description:
      "Catch new fish and bugs for the museum. Check the critterpedia.",
    completed: false,
    colorTheme: "mint",
    x: 520,
    y: 380,
    zIndex: 5,
    rotation: -3,
  },
  {
    id: "6",
    title: "Turnip Analytics",
    description: "Record morning price: 62 Bells. Waiting for afternoon spike.",
    completed: false,
    colorTheme: "cream",
    x: 880,
    y: 450,
    zIndex: 6,
    rotation: 1,
  },
];
