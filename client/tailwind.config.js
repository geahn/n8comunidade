/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // n8 Premium Palette
                primary: {
                    DEFAULT: "#1d4ed8",
                    light: "#60a5fa",
                    dark: "#1e3a8a",
                    soft: "#eff6ff",
                },
                accent: {
                    DEFAULT: "#10b981", // Success/Market Green
                    light: "#34d399",
                    dark: "#059669",
                    soft: "#ecfdf5",
                },
                warning: {
                    DEFAULT: "#f59e0b",
                    soft: "#fffbeb",
                },
                danger: {
                    DEFAULT: "#ef4444",
                    soft: "#fef2f2",
                },
                neutral: {
                    950: "#020617",
                    900: "#0f172a",
                    800: "#1e293b",
                    700: "#334155",
                    600: "#475569",
                    500: "#64748b",
                    400: "#94a3b8",
                    300: "#cbd5e1",
                    200: "#e2e8f0",
                    100: "#f1f5f9",
                    50: "#f8fafc",
                },
                background: "#f8fafc",
                surface: "#ffffff",
            },
            borderRadius: {
                '2xl': '24px',
                '3xl': '32px',
            },
            spacing: {
                '18': '72px',
            }
        },
    },
    plugins: [],
}
