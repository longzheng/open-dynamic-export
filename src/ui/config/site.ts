import { type FileRouteTypes } from '@/routeTree.gen';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'Open Dynamic Export',
    navItems: [
        {
            label: 'Home',
            href: '/',
        },
        {
            label: 'Readings',
            href: '/readings',
        },
        {
            label: 'Limits',
            href: '/limits',
        },
    ] as const satisfies { label: string; href: FileRouteTypes['fullPaths'] }[],
};
