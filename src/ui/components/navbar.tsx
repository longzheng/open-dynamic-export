import { Link } from '@heroui/link';
import {
    Navbar as NextUINavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
} from '@heroui/navbar';
import { clsx } from 'clsx';
import { useMatchRoute } from '@tanstack/react-router';

import { siteConfig } from '@/config/site';
import { Logo } from '@/components/icons';

export const Navbar = () => {
    const matchRoute = useMatchRoute();

    return (
        <NextUINavbar isBordered maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="max-w-fit gap-3">
                    <Link
                        className="flex items-center justify-start gap-1"
                        color="foreground"
                        href="/"
                    >
                        <Logo />
                    </Link>
                </NavbarBrand>
                <div className="ml-2 hidden justify-start gap-4 sm:flex">
                    {siteConfig.navItems.map((item) => {
                        const isActive =
                            item.type === 'route' &&
                            !!matchRoute({ to: item.href });

                        return (
                            <NavbarItem key={item.href} isActive={isActive}>
                                <Link
                                    isExternal={item.type === 'link'}
                                    className={clsx(
                                        isActive ? null : 'opacity-70',
                                    )}
                                    color="foreground"
                                    href={item.href}
                                >
                                    {item.label}
                                </Link>
                            </NavbarItem>
                        );
                    })}
                </div>
            </NavbarContent>

            <NavbarContent className="basis-1 pl-4 sm:hidden" justify="end">
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarMenu className="dark">
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navItems.map((item, index) => {
                        const isActive =
                            item.type === 'route' &&
                            !!matchRoute({ to: item.href });

                        return (
                            <NavbarMenuItem key={`${item.label}-${index}`}>
                                <Link
                                    isExternal={item.type === 'link'}
                                    className={clsx(
                                        isActive ? null : 'opacity-70',
                                    )}
                                    color={'foreground'}
                                    href={item.href}
                                    size="lg"
                                >
                                    {item.label}
                                </Link>
                            </NavbarMenuItem>
                        );
                    })}
                </div>
            </NavbarMenu>
        </NextUINavbar>
    );
};
