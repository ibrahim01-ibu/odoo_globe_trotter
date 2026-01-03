/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Midnight Blue (navbar, primary buttons, active states)
                primary: '#0F2A44',
                'primary-light': '#1a3a5c',
                'primary-dark': '#091c2e',

                // Secondary - Slate Blue (secondary buttons, links, section headers)
                secondary: '#3B5B8A',
                'secondary-light': '#4a6d9e',
                'secondary-dark': '#2d4a73',

                // Accent - Teal Green (add activity, success, publish)
                accent: '#2FA4A9',
                'accent-light': '#3bb8bd',
                'accent-dark': '#258a8e',

                // Backgrounds
                bg: '#F7F9FC',
                card: '#FFFFFF',

                // Text
                'text-primary': '#1E293B',
                'text-secondary': '#64748B',
                'text-muted': '#94A3B8',

                // Semantic
                warning: '#F59E0B',
                danger: '#EF4444',
                success: '#22C55E',

                // City tinting for calendar (translucent)
                'city-1': 'rgba(59, 91, 138, 0.15)',
                'city-2': 'rgba(47, 164, 169, 0.15)',
                'city-3': 'rgba(15, 42, 68, 0.12)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
