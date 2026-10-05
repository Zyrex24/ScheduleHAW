import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/Components/app/Providers";
import { Shell } from "@/Components/app/Shell";

export const metadata: Metadata = {
  title: "ScheduleHAW — plan your degree",
  description:
    "Local academic progress, deterministic semester planning and exact HAW Hamburg Information Engineering timetables.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
