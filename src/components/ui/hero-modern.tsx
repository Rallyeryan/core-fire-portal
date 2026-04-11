import React, { useEffect, useMemo, useRef, useState } from "react";

const STYLE_ID = "hero3-animations";

const getRootTheme = () => {
  if (typeof document === "undefined") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }

  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.getAttribute("data-theme") === "dark" || root.dataset?.theme === "dark") return "dark";
  if (root.classList.contains("light")) return "light";

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
};

const useThemeSync = () => {
  const [theme, setTheme] = useState(() => getRootTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;

    const sync = () => {
      const next = getRootTheme();
      setTheme((prev: string) => (prev === next ? prev : next));
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const media =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const onMedia = () => sync();
    media?.addEventListener("change", onMedia);

    const onStorage = (event: StorageEvent) => {
      if (event.key === "hero-theme" || event.key === "bento-theme") sync();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }

    return () => {
      observer.disconnect();
      media?.removeEventListener("change", onMedia);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);

  return [theme, setTheme] as const;
};

const DeckGlyph = ({ theme = "dark" }: { theme?: string }) => {
  const stroke = theme === "dark" ? "#f5f5f5" : "#111111";
  const fill = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(17,17,17,0.08)";

  return (
    <svg viewBox="0 0 120 120" className="h-16 w-16" aria-hidden>
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        className="motion-safe:animate-[hero3-orbit_8.5s_linear_infinite] motion-reduce:animate-none"
        style={{ strokeDasharray: "18 14" }}
      />
      <rect
        x="34"
        y="34"
        width="52"
        height="52"
        rx="14"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
        className="motion-safe:animate-[hero3-grid_5.4s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      <circle cx="60" cy="60" r="7" fill={stroke} />
      <path
        d="M60 30v10M60 80v10M30 60h10M80 60h10"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        className="motion-safe:animate-[hero3-pulse_6s_ease-in-out_infinite] motion-reduce:animate-none"
      />
    </svg>
  );
};

export function HeroOrbitDeck() {
  const [theme, setTheme] = useThemeSync();
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
      @keyframes hero3-intro {
        0% { opacity: 0; transform: translate3d(0, 64px, 0) scale(0.98); filter: blur(12px); }
        60% { filter: blur(0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
      }
      @keyframes hero3-card {
        0% { opacity: 0; transform: translate3d(0, 32px, 0) scale(0.95); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }
      @keyframes hero3-orbit {
        0% { stroke-dashoffset: 0; transform: rotate(0deg); }
        100% { stroke-dashoffset: -64; transform: rotate(360deg); }
      }
      @keyframes hero3-grid {
        0%, 100% { transform: rotate(-2deg); opacity: 0.7; }
        50% { transform: rotate(2deg); opacity: 1; }
      }
      @keyframes hero3-pulse {
        0%, 100% { stroke-dasharray: 0 200; opacity: 0.2; }
        45%, 60% { stroke-dasharray: 200 0; opacity: 1; }
      }
      @keyframes hero3-glow {
        0%, 100% { opacity: 0.45; transform: translate3d(0,0,0); }
        50% { opacity: 0.9; transform: translate3d(0,-8px,0); }
      }
      @keyframes hero3-drift {
        0%, 100% { transform: translate3d(0,0,0) rotate(-3deg); }
        50% { transform: translate3d(0,-12px,0) rotate(3deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") {
      setVisible(true);
      return;
    }

    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const palette = useMemo(
    () =>
      theme === "dark"
        ? {
            surface: "bg-black text-white",
            subtle: "text-white/60",
            border: "border-white/12",
            card: "bg-white/6",
            accent: "bg-white/12",
            glow: "rgba(255,255,255,0.14)",
          }
        : {
            surface: "bg-white text-neutral-950",
            subtle: "text-neutral-600",
            border: "border-neutral-200/80",
            card: "bg-neutral-100/80",
            accent: "bg-neutral-100",
            glow: "rgba(17,17,17,0.08)",
          },
    [theme]
  );

  const metrics = [
    { label: "Average ramp", value: "11d" },
    { label: "Cycles synced", value: "08" },
    { label: "Satisfaction", value: "96%" },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-hidden ${palette.surface}`}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? "hero3-intro 1.2s cubic-bezier(.16,1,.3,1) both" : "none",
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="flex items-center gap-4 mb-8">
          <DeckGlyph theme={theme} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] opacity-60">
              FD&A Project Manager
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">
              Fire Detection & Alarm
            </h1>
            <p className="text-sm opacity-60 mt-1">
              BS5839-1:2025 Specification & Job Management System
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md">
          {metrics.map((metric) => (
            <div key={metric.label} className={`rounded-xl border ${palette.border} ${palette.card} p-4 text-center`}>
              <p className="text-[10px] uppercase tracking-wider opacity-50">{metric.label}</p>
              <p className="text-2xl font-bold font-heading mt-1">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroOrbitDeck;
