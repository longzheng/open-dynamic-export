import type * as React from 'react';

import { type IconSvgProps } from '@/types';

export const Logo: React.FC<IconSvgProps> = ({
    size = 36,
    height,
    ...props
}) => (
    <svg
        fill="none"
        height={size || height}
        viewBox="0 0 128 128"
        width={size || height}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M89.4 8L25 73.8L75.4 54.2L89.4 8Z" fill="#42F35D" />
        <path d="M37.6 120L102 54.2L51.6 73.8L37.6 120Z" fill="#10D9DC" />
        <path
            d="M25 73.8L75.4 54.2H102L51.6 73.8H25Z"
            fill="url(#paint0_linear_29_8)"
        />
        <defs>
            <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_29_8"
                x1="71.8506"
                x2="76.2828"
                y1="54.2"
                y2="64"
            >
                <stop stopColor="#28DB55" />
                <stop offset="1" stopColor="#0FBBBE" />
            </linearGradient>
        </defs>
    </svg>
);
