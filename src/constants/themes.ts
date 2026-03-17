export const THEMES = {
  mint: {
    bg: "bg-[#E8F5F1]",
    text: "text-[#4A7C68]",
    pinHead: "bg-gradient-to-br from-[#A6E4D0] to-[#78CDB0]",
    swatch: "bg-[#A6E4D0]",
  },
  cream: {
    bg: "bg-[#FFF9E6]",
    text: "text-[#8A6B22]",
    pinHead: "bg-gradient-to-br from-[#FCE08B] to-[#F5C242]",
    swatch: "bg-[#FCE08B]",
  },
  pink: {
    bg: "bg-[#FDF0F3]",
    text: "text-[#9E5B6A]",
    pinHead: "bg-gradient-to-br from-[#F4C2C2] to-[#E5989B]",
    swatch: "bg-[#F4C2C2]",
  },
  blue: {
    bg: "bg-[#EBF4F8]",
    text: "text-[#4A7B8C]",
    pinHead: "bg-gradient-to-br from-[#A3D5E0] to-[#7AB8C8]",
    swatch: "bg-[#A3D5E0]",
  },
  lavender: {
    bg: "bg-[#F4EBF7]",
    text: "text-[#7A5C8C]",
    pinHead: "bg-gradient-to-br from-[#D8B4E2] to-[#B882C6]",
    swatch: "bg-[#D8B4E2]",
  },
  peach: {
    bg: "bg-[#FFF0E6]",
    text: "text-[#8C5A4A]",
    pinHead: "bg-gradient-to-br from-[#FFCBA4] to-[#F4A460]",
    swatch: "bg-[#FFCBA4]",
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export type ThemeConfig = (typeof THEMES)[ThemeKey];

export const BOARD_THEMES = {
  grass: {
    bg: "#63B48E",
    pattern:
      "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 15 L25 30 L5 30 Z' fill='%2352A37D' transform='rotate(15 15 22)'/%3E%3Cpath d='M85 65 L95 80 L75 80 Z' fill='%2352A37D' transform='rotate(-25 85 72)'/%3E%3Cpath d='M50 100 L60 115 L40 115 Z' fill='%2352A37D' transform='rotate(45 50 107)'/%3E%3C/svg%3E\")",
    name: "Grass",
  },
  sand: {
    bg: "#E8D5A5",
    pattern:
      "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23D4C08D'/%3E%3Ccircle cx='80' cy='60' r='1.5' fill='%23D4C08D'/%3E%3Ccircle cx='40' cy='100' r='2.5' fill='%23D4C08D'/%3E%3C/svg%3E\")",
    name: "Sand",
  },
  wood: {
    bg: "#A67B5B",
    pattern:
      "url(\"data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0, 50 10 T 100 10' fill='none' stroke='%238B6346' stroke-width='1' opacity='0.5'/%3E%3C/svg%3E\")",
    name: "Wood",
  },
  night: {
    bg: "#2C3E50",
    pattern:
      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='%2334495E'/%3E%3C/svg%3E\")",
    name: "Night",
  },
} as const;

export type BoardThemeKey = keyof typeof BOARD_THEMES;
