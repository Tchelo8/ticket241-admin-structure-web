/**
 * Thème de l'espace organisateur : Papier (défaut), Encre (sombre), Noir & Blanc.
 * Posé sur <html data-theme="…"> et gardé dans le navigateur. index.html l'applique avant le
 * premier affichage pour éviter un flash de l'autre thème.
 */
import { useEffect, useState } from "react";

export type Theme = "paper" | "ink" | "mono";

export const THEMES: { id: Theme; label: string }[] = [
  { id: "paper", label: "Papier" },
  { id: "ink", label: "Encre" },
  { id: "mono", label: "N&B" },
];

const STORAGE_KEY = "t241.admin.theme";

export const getTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "paper" || saved === "ink" || saved === "mono") return saved;
  } catch {
    /* stockage indisponible : thème par défaut */
  }
  return "paper";
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* stockage indisponible : le thème vaut pour cette visite */
  }
};

/** Thème courant et changement de thème (persisté). */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getTheme);
  useEffect(() => applyTheme(theme), [theme]);
  return { theme, setTheme };
};
