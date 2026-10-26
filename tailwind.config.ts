import type { Config } from "tailwindcss";

/** Couleur d'un jeton déclaré en canaux RGB (--x-rgb) : accepte l'opacité Tailwind (bg-acc/10). */
const rgb = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

export default {
  // Les thèmes passent par <html data-theme="paper|ink|mono"> (voir src/lib/theme.ts)
  darkMode: ["class", '[data-theme="ink"]'],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        // Barre latérale en tiroir sous 980px (README)
        nav: "980px",
      },
      fontFamily: {
        // Source Serif 4 partout, aucune sans-serif
        sans: ['"Source Serif 4"', "Georgia", "serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
      },
      colors: {
        // Jetons du design v2
        bg: rgb("bg"),
        surf: rgb("surf"),
        side: rgb("side"),
        ink: rgb("ink"),
        ink2: rgb("ink2"),
        ink3: rgb("ink3"),
        acc: rgb("acc"),
        acc2: rgb("acc2"),
        "on-acc": rgb("on-acc"),
        accs: "var(--accs)",
        acc2s: "var(--acc2s)",
        line: "var(--line)",
        line2: "var(--line2)",

        // Noms shadcn/ui conservés, rebranchés sur les jetons
        border: "var(--line)",
        input: "var(--line2)",
        ring: rgb("acc"),
        background: rgb("bg"),
        foreground: rgb("ink"),
        primary: {
          DEFAULT: rgb("acc"),
          foreground: rgb("on-acc"),
        },
        secondary: {
          DEFAULT: rgb("surf"),
          foreground: rgb("ink"),
        },
        // Pas de rouge Tailwind : la destruction utilise le magenta
        destructive: {
          DEFAULT: rgb("acc2"),
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: rgb("surf"),
          foreground: rgb("ink2"),
        },
        // « accent » était déjà la couleur d'action de l'application : il devient le cyan
        accent: {
          DEFAULT: rgb("acc"),
          foreground: rgb("on-acc"),
        },
        popover: {
          DEFAULT: rgb("card"),
          foreground: rgb("ink"),
        },
        card: {
          DEFAULT: rgb("card"),
          foreground: rgb("ink"),
        },
        // Ni vert ni orange (README) : succès en cyan, avertissement en magenta
        success: {
          DEFAULT: rgb("acc"),
          foreground: rgb("on-acc"),
        },
        warning: {
          DEFAULT: rgb("acc2"),
          foreground: "#ffffff",
        },
        sidebar: {
          DEFAULT: rgb("side"),
          foreground: rgb("ink2"),
          primary: rgb("acc"),
          "primary-foreground": rgb("on-acc"),
          accent: rgb("card"),
          "accent-foreground": rgb("ink"),
          border: "var(--line)",
          ring: rgb("acc"),
          muted: rgb("ink3"),
        },
        chart: {
          "1": rgb("acc"),
          "2": rgb("acc2"),
          "3": rgb("ink2"),
          "4": rgb("ink3"),
          "5": rgb("surf"),
        },
      },
      borderRadius: {
        // 4px boutons/champs, 6px cartes, 8px fenêtres, 99px pastilles
        lg: "8px",
        md: "6px",
        sm: "4px",
        pill: "99px",
      },
      boxShadow: {
        sh: "var(--sh)",
        shm: "var(--shm)",
        shl: "var(--shl)",
        card: "var(--sh)",
        "card-hover": "var(--shm)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.28s ease-out",
        "slide-in": "slide-in 0.3s cubic-bezier(.2,.8,.2,1)",
        rise: "rise 0.45s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
