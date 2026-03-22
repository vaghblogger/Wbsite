"use client";

import { createPortal } from "react-dom";
import { useCallback, useRef, useState, type ReactNode } from "react";

type WorkflowNodeHintProps = {
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * Fixed-position hover card (portal) so hints are not clipped by the React Flow viewport.
 */
export function WorkflowNodeHint({ title, description, children }: WorkflowNodeHintProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0, placeBelow: false });

  const updatePosition = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 96;
    const placeBelow = r.top < margin;
    setCoords({
      left: r.left + r.width / 2,
      top: placeBelow ? r.bottom : r.top,
      placeBelow,
    });
  }, []);

  const onEnter = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const onLeave = useCallback(() => setOpen(false), []);

  return (
    <>
      <div
        ref={wrapRef}
        className="relative"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {children}
      </div>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[10000] w-[min(17.5rem,calc(100vw-2rem))] max-w-[17.5rem] select-none"
            style={{
              left: coords.left,
              top: coords.top,
              transform: coords.placeBelow
                ? "translate(-50%, 10px)"
                : "translate(-50%, calc(-100% - 10px))",
            }}
            role="tooltip"
          >
            <div className="rounded-xl border border-violet-500/20 bg-zinc-950/95 px-3.5 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl ring-1 ring-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-violet-300/90">
                {title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-300/95">{description}</p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
