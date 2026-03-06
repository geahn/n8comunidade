/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Bairro App Design Palette
                primary: {
                    DEFAULT: "#1E88E5",
                    light: "#64B5F6",
                    dark: "#1565C0",
                    soft: "#E3F2FD",
                },
                accent: {
                    DEFAULT: "#1E88E5", // Matching reference primary blue
                    light: "#64B5F6",
                    dark: "#1565C0",
                    soft: "#F8F9FA",
                },
                warning: {
                    DEFAULT: "#FBC02D",
                    soft: "#FFF9C4",
                },
                danger: {
                    DEFAULT: "#D32F2F",
                    soft: "#FFEBEE",
                },
                neutral: {
                    950: "#020617",
                    900: "#0f172a",
                    800: "#1e293b",
                    700: "#334155",
                    600: "#475569",
                    500: "#717182", // Muted text from reference
                    400: "#94a3b8",
                    300: "#cbd5e1",
                    200: "#e2e8f0",
                    100: "#f1f5f9",
                    50: "#f8fafc",
                },
                background: "#f8fafc", // Reference background
                surface: "#ffffff",
                glass: "rgba(255, 255, 255, 0.7)",
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
                '4xl': '40px',
            },
            spacing: {
                '18': '72px',
            }
        },
    },
    plugins: [],
}
