import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Public_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Bar } from "@/components/site/Bar";
import { Footer } from "@/components/site/Footer";
import { ScrollFX } from "@/components/site/ScrollFX";
import { ConsoleEgg } from "@/components/ui/ConsoleEgg";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Karan Shrivastava — Applied AI Engineer",
  description:
    "I build agents that check their own work. Production multi-agent systems at The Home Depot and AT&T — retrieval, tool use, and the validation layers that catch failures before a person has to.",
  openGraph: {
    title: "Karan Shrivastava — Applied AI Engineer",
    description:
      "Production multi-agent systems, and the validation layers that catch their failures before a person has to.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    /* The `js` class below is added before React hydrates, so the class
       list on <html> is expected to differ from the server render. */
    /* The font variables go on <html>, not <body>: globals.css composes
       them into --display/--body/--mono on :root, and a custom property
       set on body is not visible to :root — the whole stack would
       invalidate and fall back to Times. */
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Scroll reveals are an enhancement, never a requirement. The
            hidden state is scoped to .js, so if scripting never runs the
            page is simply visible rather than blank. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Bar />
        {children}
        <Footer />
        <ScrollFX />
        <ConsoleEgg />
      </body>
    </html>
  );
}
