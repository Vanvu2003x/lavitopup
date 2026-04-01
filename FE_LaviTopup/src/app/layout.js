import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";

const beVietnam = Be_Vietnam_Pro({
    weight: ["400", "500", "600", "700", "800"],
    subsets: ["latin", "vietnamese"],
    variable: "--font-be-vietnam",
    display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.io.vn";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "LaviTopup | Topup và tài khoản game",
        template: "%s | LaviTopup",
    },
    description: "LaviTopup cung cấp topup và tài khoản game với giao diện rõ ràng, thao tác nhanh và hỗ trợ trực tiếp khi cần.",
    keywords: ["LaviTopup", "topup game", "nạp game", "tài khoản game", "mua tài khoản game", "shop acc"],
    authors: [{ name: "LaviTopup" }],
    creator: "LaviTopup",
    publisher: "LaviTopup",
    icons: {
        icon: "/imgs/removed_bg.png",
        shortcut: "/imgs/removed_bg.png",
        apple: "/imgs/removed_bg.png",
    },
    openGraph: {
        type: "website",
        locale: "vi_VN",
        url: siteUrl,
        siteName: "LaviTopup",
        title: "LaviTopup | Topup và tài khoản game",
        description: "Topup nhanh, giao diện dễ dùng và hỗ trợ trực tiếp cho các nhu cầu mua tài khoản game tại LaviTopup.",
        images: [
            {
                url: "/banner/logo.png",
                width: 1536,
                height: 864,
                alt: "LaviTopup",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "LaviTopup | Topup và tài khoản game",
        description: "Topup nhanh, giao diện dễ dùng và hỗ trợ trực tiếp cho các nhu cầu mua tài khoản game tại LaviTopup.",
        images: ["/banner/logo.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: siteUrl,
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#07142d",
};

export default function RootLayout({ children }) {
    return (
        <html lang="vi">
            <body className={beVietnam.variable}>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
