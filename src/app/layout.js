import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

// Stand-in for SweetSansPro (a commercial face, not distributable via
// Google Fonts) — Work Sans is a close-metric free alternative for the
// nav/body copy. Swap for the licensed font file once available.
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
});

export const metadata = {
  title: siteConfig.metaTitle,
  description: siteConfig.metaDescription,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${playfair.variable} ${workSans.variable}`}
    >
      <body className="flex min-h-full flex-col bg-[var(--color-bg)] font-sans">
        {children}
      </body>
    </html>
  );
}
