import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Design system colors from design-system.md
      colors: {
        // Light theme surfaces
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",

        // Borders
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",

        // Text
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",

        // Brand
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },

        // Status
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",

        // File categories
        category: {
          video: { light: "#8B5CF6", dark: "#A78BFA" },
          image: { light: "#EC4899", dark: "#F472B6" },
          audio: { light: "#F97316", dark: "#FB923C" },
          document: { light: "#3B82F6", dark: "#60A5FA" },
          archive: { light: "#EAB308", dark: "#FACC15" },
          application: { light: "#10B981", dark: "#34D399" },
          code: { light: "#06B6D4", dark: "#22D3EE" },
          system: { light: "#6366F1", dark: "#818CF8" },
          folder: { light: "#78716C", dark: "#A8A29E" },
          other: { light: "#9CA3AF", dark: "#9CA3AF" },
        },
      },

      // Typography
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      fontSize: {
        h1: ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        h4: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["11px", { lineHeight: "1.4", fontWeight: "400" }],
      },

      // Spacing from design system
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },

      // Border radius from design system
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },

      // Shadows from design system
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.07)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.10)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
      },

      // Animations from design system
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 250ms ease-out",
        "slide-down": "slideDown 250ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },

      // Transition timing functions
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        enter: "cubic-bezier(0, 0, 0.2, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      },

      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "300ms",
        slowest: "400ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
