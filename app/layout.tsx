import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Game of Life',
  description: "Conway's Game of Life - Interactive cellular automaton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// edge case: might need to add metadata later
