import { type Config } from 'tailwindcss';

import { heroui } from "@heroui/theme";

import { type ReadingLocation } from '@/components/reading';

export const readingColors: Record<ReadingLocation, string> = {
    site: '#A5EEFD',
    der: '#ac79ea',
    load: '#ea7979',
};

export default {
    content: [
        './index.html',
        './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'pulse-glow': 'pulse-glow 1s ease-out',
            },
            keyframes: {
                'pulse-glow': {
                    '0%': { transform: 'scale(1)', opacity: '0.8' },
                    '100%': { transform: 'scale(3)', opacity: '0' },
                },
            },
        },
    },
    darkMode: 'class',
    plugins: [
        heroui({
            themes: {
                'reading-site': {
                    extend: 'dark',
                    colors: {
                        primary: readingColors.site,
                    },
                },
                'reading-der': {
                    extend: 'dark',
                    colors: {
                        primary: readingColors.der,
                    },
                },
                'reading-load': {
                    extend: 'dark',
                    colors: {
                        primary: readingColors.load,
                    },
                },
            },
        }),
    ],
} satisfies Config;
