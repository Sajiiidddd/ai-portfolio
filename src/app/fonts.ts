import { Pixelify_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const pixel = Pixelify_Sans({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-pixel", display: "swap" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
export const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
