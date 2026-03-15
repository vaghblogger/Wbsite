import { Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/90">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 p-1.5">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Vagh <span className="text-violet-400">Labs</span>
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            AI solutions that drive growth.
          </p>
        </div>
      </div>
    </footer>
  );
}
