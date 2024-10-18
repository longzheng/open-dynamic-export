import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Open Dynamic Export',
    description: 'Free open-source inverter curtailment',
    appearance: 'force-dark',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/logo.svg',

        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide' },
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Introduction', link: '/introduction' },
                    { text: 'Getting started', link: '/getting-started' },
                    { text: 'Configuration', link: '/configuration' },
                    { text: 'Supported devices', link: '/supported-devices' },
                ],
            },
            {
                text: 'CSIP-AUS',
                items: [
                    { text: 'Queensland', link: '/csip-qld' },
                    { text: 'Other states', link: '/csip-other' },
                ],
            },
        ],

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/longzheng/open-dynamic-export',
            },
        ],
    },
});
