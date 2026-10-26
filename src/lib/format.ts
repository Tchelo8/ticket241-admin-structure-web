/**
 * Formats d'affichage du design v2 : séparateur de milliers et « FCFA » précédés
 * d'une espace insécable (« 15 000 FCFA »), dates courtes en français.
 */
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const NBSP = " ";

/** 15000 → « 15 000 » (espaces insécables) */
export const nombre = (n: number | null | undefined) =>
  Math.round(Number(n) || 0)
    .toLocaleString("fr-FR")
    .replace(/[  \s]/g, NBSP);

/** 15000 → « 15 000 FCFA » */
export const fcfa = (n: number | null | undefined) => `${nombre(n)}${NBSP}FCFA`;

/** Montant compact : « 1,2 M FCFA » au-delà du million */
export const fcfaCompact = (n: number | null | undefined) => {
  const v = Number(n) || 0;
  return v >= 1e6 ? `${(v / 1e6).toFixed(1).replace(".", ",")}${NBSP}M${NBSP}FCFA` : fcfa(v);
};

const date = (d?: string | Date | null) => {
  if (!d) return null;
  const v = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(v.getTime()) ? null : v;
};

/** « Ven. 31 oct. · 21:00 » */
export const dateCourte = (d?: string | Date | null) => {
  const v = date(d);
  if (!v) return "—";
  const jour = format(v, "EEE d MMM", { locale: fr });
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)} · ${format(v, "HH:mm")}`;
};

/** « Vendredi 31 octobre 2026 · 21:00 » */
export const dateLongue = (d?: string | Date | null, avecHeure = true) => {
  const v = date(d);
  if (!v) return "—";
  const jour = format(v, "EEEE d MMMM yyyy", { locale: fr });
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)}${avecHeure ? ` · ${format(v, "HH:mm")}` : ""}`;
};

/** Jour et mois pour la vignette de date : { jour: "31", mois: "oct." } */
export const jourMois = (d?: string | Date | null) => {
  const v = date(d);
  return v ? { jour: format(v, "dd"), mois: format(v, "MMM", { locale: fr }) } : { jour: "—", mois: "" };
};

/** Pourcentage entier borné à [0, 100] */
export const pourcentage = (part: number, total: number) =>
  total > 0 ? Math.min(100, Math.max(0, Math.round((part / total) * 100))) : 0;
