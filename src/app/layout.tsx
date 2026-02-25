import React from "react";
import { Analytics } from "@vercel/analytics/next";

// Removed Metadata type annotation to fix: Module '"next"' has no exported member 'Metadata'.
// Next.js correctly infers the type for the conventional 'metadata' export in App Router.
export const metadata = {
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
                    'glow': '0 10px 40px -10px rgba(139, 92, 246, 0.3)',
                    'soft': '0 20px 40px -10px rgba(0, 0, 0, 0.04)',
                    'card': '0 10px 30px -5px rgba(0, 0, 0, 0.03)',
                    'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                  },
                  backgroundImage: {
                    'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                  }
                },
              },
            };
          `,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          body {
            background-color: #FFFFFF;
            color: #1E293B;
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            scroll-behavior: smooth;
          }
          
          ::selection {
            background-color: #8B5CF6;
            color: white;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #8B5CF6;
          }
          
          .hero-glow {
            background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%);
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        ` }} />
      </head>
      <body className="antialiased selection:bg-primary selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}