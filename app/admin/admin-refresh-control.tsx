"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

export default function AdminRefreshControl() {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const triggered = useRef(false);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    window.location.reload();
  }

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (window.scrollY <= 0 && event.touches.length === 1 && event.touches[0].clientY < 120) {
        startY.current = event.touches[0].clientY;
        triggered.current = false;
      } else {
        startY.current = null;
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (startY.current === null || triggered.current || window.scrollY > 0 || event.touches.length !== 1) return;
      if (event.touches[0].clientY - startY.current > 110) {
        triggered.current = true;
        refresh();
      }
    };
    const onTouchEnd = () => { startY.current = null; };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [refreshing]);

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={refreshing}
      aria-label="Atualizar página administrativa"
      title="Atualizar página"
      className="fixed z-[9999] bottom-5 right-4 md:bottom-6 md:right-6 flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-black/10 transition hover:bg-orange-600 active:scale-95 disabled:opacity-70"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
      <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
    </button>
  );
}
