import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Layout classes
    "min-h-screen",
    "bg-white",
    "bg-gray-100",
    "font-vectora",
    "ml-20",
    "p-8",
    "max-w-7xl",
    "mx-auto",
    // Grid classes
    "grid",
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "md:grid-cols-2",
    "md:grid-cols-3",
    "gap-6",
    "gap-8",
    // Spacing classes
    "mb-2",
    "mb-4",
    "mb-6",
    "mb-8",
    "mt-1",
    "mt-2",
    "p-4",
    "p-6",
    "py-2",
    "py-4",
    "px-4",
    "pl-5",
    // Text classes
    "text-sm",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-xs",
    "font-bold",
    "text-black",
    "text-white",
    "text-gray-600",
    "text-cyan-400",
    // Layout classes
    "flex",
    "items-center",
    "justify-between",
    "justify-center",
    "justify-start",
    "space-y-0",
    "space-y-4",
    "w-full",
    "w-20",
    "w-64",
    "h-14",
    "h-screen",
    // Border and styling
    "rounded-lg",
    "shadow-sm",
    "border-b",
    "border-gray-200",
    "pb-4",
    // Positioning
    "fixed",
    "left-0",
    "top-0",
    "z-10",
    // Transitions
    "transition-all",
    "transition-opacity",
    "duration-300",
    "ease-in-out",
    // Hover states
    "hover:underline",
    // Sizing
    "min-w-6",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "#E9EDF2",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        active: "#05E0E9",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        modal: "12px",
      },
      fontFamily: {
        vectora: ["Vectora LT Std", "Arial", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
