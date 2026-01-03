/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Aqua / Teal (Brand Identity)
                primary: {
                    DEFAULT: '#2FA4A9', // Main Brand Color
                    light: '#5BC2C6',
                    dark: '#237D81',
                    50: '#F0FDFA',
                    100: '#CCFBF1',
                    500: '#2FA4A9',
                    600: '#237D81',
                    700: '#1A6165',
                },

                // Secondary - Slate / Cool Gray (Text & UI Elements)
                secondary: {
                    DEFAULT: '#64748B',
                    light: '#94A3B8',
                    dark: '#475569',
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    900: '#0F172A',
                },

                // Accent - Solar Amber (Highlights, Calls to Action)
                accent: {
                    DEFAULT: '#F59E0B',
                    light: '#FBBF24',
                    dark: '#D97706',
                },

                // Backgrounds
                bg: {
                    DEFAULT: '#F0F4F8', // Main app background (Cool Blue-Gray)
                    paper: '#FFFFFF',   // Card background
                    subtle: '#E2E8F0',  // Sidebar/Header variants
                },

                // Functional
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                info: '#3B82F6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
                'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 12px 24px -4px rgba(0,0,0,0.08)',
                'floating': '0 20px 40px -8px rgba(0,0,0,0.12)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
        },
    },
    plugins: [],
}
