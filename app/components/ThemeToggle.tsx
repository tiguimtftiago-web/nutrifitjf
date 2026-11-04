"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "nutrifit_theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // O tema continua funcionando nesta visita mesmo se o armazenamento estiver indisponível.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f7f8f4" : "#080a07");
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={theme === "light"}
      title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="nf-theme-toggle fixed bottom-5 left-4 z-[95] inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-extrabold shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 active:translate-y-0 sm:bottom-6 sm:left-6 sm:min-h-12 sm:px-4 sm:text-sm"
    >
      {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
    </button>
  );
}
