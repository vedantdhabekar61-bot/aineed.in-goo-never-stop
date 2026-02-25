
import React from "react";
import { Analytics } from "@vercel/analytics/next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "aineed.in - Find the exact AI you need",
  description: "Match your workflow bottlenecks with the perfect AI solutions using intelligent search.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: { primary: '#8B5CF6' },
                boxShadow: {
                  'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                  'glow': '0 10px 40px -10px rgba(139, 92, 246, 0.3)',
                  'soft': '0 20px 40px -10px rgba(0, 0, 0, 0.04)',
                  'card': '0 10px 30px -5px rgba(0, 0, 0, 0.03)',
                }
              }
            }
          };
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: var(--font-plus-jakarta), sans-serif; background-color: #FFFFFF; color: #1E293B; }
          .hero-glow { background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%); }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 10px; }
        ` }} />
      </head>
      <body className="antialiased selection:bg-primary selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
