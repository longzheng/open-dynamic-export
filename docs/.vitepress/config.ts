import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

// https://vitepress.dev/reference/site-config
export default withMermaid(
    defineConfig({
        title: 'Open Dynamic Export',
        description:
            'Free open source local solar inverter export control/curtailment',
        appearance: 'force-dark',
        cleanUrls: true,
        ignoreDeadLinks: true,
        themeConfig: {
            // https://vitepress.dev/reference/default-theme-config
            logo: '/logo.svg',

            nav: [
                { text: 'Home', link: '/' },
                { text: 'User guide', link: '/guide/' },
            ],

            sidebar: [
                {
                    text: 'Getting started',
                    link: '/guide/',
                },
                {
                    text: 'Configuration',
                    items: [
                        {
                            text: 'Inverters',
                            link: '/configuration/inverters',
                        },
                        {
                            text: 'Inverter control',
                            link: '/configuration/inverter-control',
                        },
                        { text: 'Site meter', link: '/configuration/meter' },
                        { text: 'Limiters', link: '/configuration/limiters' },
                        { text: 'Publish', link: '/configuration/publish' },
                    ],
                },
                {
                    text: 'CSIP-AUS',
                    link: '/csip-aus/',
                },
            ],

            socialLinks: [
                {
                    icon: 'github',
                    link: 'https://github.com/longzheng/open-dynamic-export',
                },
            ],
        },
    }),
);
