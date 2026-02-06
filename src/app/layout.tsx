
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
              darkMode: 'class',
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                  },
                  colors: {
                    primary: '#8B5CF6',
                    surface: '#FFFFFF',
                    card: '#FFFFFF',
                    border: '#F1F5F9',
                  },
                  boxShadow: {
                    'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
                    'glow': '0 10px 40px -10px rgba(139, 92, 246, 0.15)',
                    'soft': '0 20px 40px -10px rgba(0, 0, 0, 0.04)',
                    'card': '0 10px 30px -5px rgba(0, 0, 0, 0.03)',
                  }
                },
              },
            };
          `,
          }}
        />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          body {
            background-color: #FFFFFF;
            color: #1E293B;
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
          }
          
          ::selection {
            background-color: #8B5CF6;
            color: white;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #8B5CF6;
          }
          
          .hero-glow {
            background: radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
          }
        `}</style>
      </head>
      <body className="antialiased selection:bg-primary selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
