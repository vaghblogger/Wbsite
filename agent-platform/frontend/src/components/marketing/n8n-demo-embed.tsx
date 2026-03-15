"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { N8N_DEMO_WORKFLOW } from "@/data/n8n-demo-workflow";

const WEBCOMPONENTS_LOADER =
  "https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.0.0/webcomponents-loader.js";
const LIT_POLYFILL =
  "https://www.unpkg.com/lit@2.0.0-rc.2/polyfill-support.js";
const N8N_DEMO_BUNDLE =
  "https://cdn.jsdelivr.net/npm/@n8n_io/n8n-demo-component/n8n-demo.bundled.js";

function loadScript(src: string, opts?: { module?: boolean }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    if (opts?.module) s.type = "module";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

const WORKFLOW_JSON = JSON.stringify(N8N_DEMO_WORKFLOW);

export function N8nDemoEmbed() {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadScript(WEBCOMPONENTS_LOADER);
        if (cancelled) return;
        await loadScript(LIT_POLYFILL);
        if (cancelled) return;
        await loadScript(N8N_DEMO_BUNDLE, { module: true });
        if (cancelled) return;
        await customElements.whenDefined("n8n-demo");
        if (cancelled) return;
        setReady(true);
      } catch (e) {
        console.warn("n8n-demo load failed:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scaleToFit = useCallback(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const demo = inner.querySelector("n8n-demo") as HTMLElement | null;
    if (!demo) return;

    const root = demo.shadowRoot;
    const svg = root?.querySelector("svg") ?? root?.querySelector("canvas");
    const contentEl = svg ?? demo;

    const bbox = contentEl.getBoundingClientRect();
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    if (bbox.width < 10 || bbox.height < 10) return;

    const scale = Math.min(cw / bbox.width, ch / bbox.height) * 0.95;
    const scaledW = bbox.width * scale;
    const scaledH = bbox.height * scale;
    const tx = (cw - scaledW) / 2 - (bbox.left - container.getBoundingClientRect().left) * scale;
    const ty = (ch - scaledH) / 2 - (bbox.top - container.getBoundingClientRect().top) * scale;

    inner.style.transformOrigin = "0 0";
    inner.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }, []);

  useEffect(() => {
    if (!ready) return;

    const delays = [200, 500, 1000, 2000, 3000];
    const timers = delays.map((d) => setTimeout(scaleToFit, d));

    const container = containerRef.current;
    const ro = container ? new ResizeObserver(scaleToFit) : null;
    if (container && ro) ro.observe(container);

    return () => {
      timers.forEach(clearTimeout);
      ro?.disconnect();
    };
  }, [ready, scaleToFit]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/60 md:h-[700px]"
    >
      {ready ? (
        <div
          ref={innerRef}
          dangerouslySetInnerHTML={{
            __html: `<n8n-demo
              workflow='${WORKFLOW_JSON.replace(/'/g, "&#39;")}'
              frame="true"
            ></n8n-demo>`,
          }}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Loading workflow…
        </div>
      )}
    </div>
  );
}
