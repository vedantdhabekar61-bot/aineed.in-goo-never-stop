import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "aineed.in - Find the AI you need",
  description: "Describe your workflow bottleneck, and our AI engine will match you with the perfect tools to solve it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4113034727076146"
          crossOrigin="anonymous"
        ></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                  },
                  colors: {
                    primary: '#5D5CDE', // Purple/Indigo from screenshot
                    secondary: '#1F1F1F', // Dark text
                  },
                  boxShadow: {
                    'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                    'glow': '0 0 20px rgba(93, 92, 222, 0.3)',
                  }
                },
              },
            };
          `,
          }}
        />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          body {
            background-color: #ffffff;
            color: #1F1F1F;
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          
          /* Custom selection color */
          ::selection {
            background-color: #5D5CDE;
            color: white;
          }
        `}</style>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}