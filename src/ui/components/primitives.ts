import { tv } from 'tailwind-variants';

export const title = tv({
    base: 'font-semibold my-4',
    variants: {
        size: {
            sm: 'text-2xl',
            md: 'text-4xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});
