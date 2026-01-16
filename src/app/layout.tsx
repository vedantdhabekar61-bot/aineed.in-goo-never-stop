import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tool Directory",
  description: "Find the perfect AI tools for your specific problems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    background: '#0f172a',
                    surface: '#1e293b',
                    primary: '#6366f1',
                    secondary: '#a855f7',
                  },
                  animation: {
                    'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }
                },
              },
            };
          `,
          }}
        />
        <style>{`
          body {
            background-color: #0f172a;
            color: #f8fafc;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #0f172a; }
          ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #475569; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}