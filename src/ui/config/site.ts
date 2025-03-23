import { type FileRouteTypes } from '@/routeTree.gen';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'Open Dynamic Export',
    navItems: [
        {
            type: 'route',
            label: 'Home',
            href: '/',
        },
        {
            type: 'route',
            label: 'Readings',
            href: '/readings',
        },
        {
            type: 'route',
            label: 'CSIP Limits',
            href: '/limits',
        },
        {
            type: 'link',
            label: 'API',
            href: '/api',
        },
    ] as const satisfies (
        | {
              type: 'route';
              label: string;
              href: FileRouteTypes['fullPaths'];
          }
        | {
              type: 'link';
              label: string;
              href: string;
          }
    )[],
};
