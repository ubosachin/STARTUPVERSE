import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A"
        },
        secondary: "#0EA5E9",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        surface: "#F8FAFC",
        border: "#E2E8F0",
        ink: "#0F172A",
        muted: "#64748B"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
        card: "0 4px 20px rgba(15, 23, 42, 0.06)",
        line: "0 1px 0 rgba(15, 23, 42, 0.08)",
        glass: "0 8px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        glow: "0 0 30px rgba(37, 99, 235, 0.2), 0 4px 20px rgba(37, 99, 235, 0.1)",
        "glow-success": "0 0 20px rgba(34, 197, 94, 0.2)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"]
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-hero": "radial-gradient(ellipse 120% 80% at 50% -20%, #DBEAFE 0%, transparent 70%)",
        "gradient-blue": "linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)",
        "gradient-dark": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "gradient-card": "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.4)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(37, 99, 235, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(37, 99, 235, 0)" }
        }
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "slide-down": "slideDown 0.3s ease forwards",
        "scale-in": "scaleIn 0.3s ease forwards",
        float: "float 3s ease-in-out infinite",
        ticker: "ticker 20s linear infinite",
        shimmer: "shimmer 1.5s infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite"
      }
    }
  },
  plugins: [forms]
};

export default config;
