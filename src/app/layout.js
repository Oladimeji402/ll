import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: siteConfig.metaTitle,
  description: siteConfig.metaDescription,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[var(--color-bg)]">
        {children}
      </body>
    </html>
  );
}
