import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "NEXUS Game Engine — Alpha 0.3",
 description: "A local-first browser game engine with 3D scenes, scripts, animation tools and an AI integration hub."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="es"><body>{children}</body></html>;
}
