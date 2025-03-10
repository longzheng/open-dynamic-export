import { NextUIProvider } from '@nextui-org/system';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { IntlProvider } from 'react-intl';

import { Navbar } from '@/components/navbar';

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: RootRoute,
});

function RootRoute() {
    const router = useRouter();

    return (
        <QueryClientProvider client={queryClient}>
            <NextUIProvider
                navigate={(to) => void router.navigate({ to })}
                useHref={(to) => router.buildLocation({ to }).href}
            >
                <IntlProvider locale={navigator.language}>
                    <div className="relative flex min-h-screen flex-col bg-background pb-32 text-foreground dark">
                        <Navbar />
                        <main className="container mx-auto max-w-7xl grow px-6 pt-4">
                            <Outlet />
                            <TanStackRouterDevtools />
                        </main>
                    </div>
                </IntlProvider>
            </NextUIProvider>
        </QueryClientProvider>
    );
}
