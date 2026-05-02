import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ToastProvider from "./ToastProvider";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CourtMate - Tìm kiếm sân thể thao dễ dàng",
  description: "CourtMate giúp bạn tìm kiếm và đặt sân thể thao gần bạn một cách nhanh chóng và tiện lợi. Tìm sân bóng đá, cầu lông, bóng rổ, tennis và nhiều môn thể thao khác chỉ với vài cú nhấp chuột.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <NavBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
