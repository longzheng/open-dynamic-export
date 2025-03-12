import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/control')({
    component: Control,
});

function Control() {
    return <div className="p-2">Hello from About!</div>;
}
