import type { ThemeConfig } from "../../constants/themes";

type PinProps = {
  theme: ThemeConfig;
};

export function Pin({ theme }: PinProps) {
  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
      <div
        className={`w-6 h-6 rounded-full ${theme.pinHead} shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.15),_inset_3px_3px_6px_rgba(255,255,255,0.8),_0_5px_10px_rgba(0,0,0,0.1)] relative z-10 flex items-center justify-center`}>
        <div className="absolute top-1 left-1.5 w-2 h-2 bg-white/90 rounded-full blur-[0.5px]" />
      </div>
      <div className="w-1.5 h-4 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 rounded-b-sm -mt-1 relative z-0" />
      <div className="absolute top-6 left-3 w-5 h-1.5 bg-black/10 blur-[2px] rounded-full rotate-[40deg] origin-left" />
    </div>
  );
}
