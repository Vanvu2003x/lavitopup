import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";

const beVietnam = Be_Vietnam_Pro({
    weight: ["400", "500", "600", "700", "800"],
    subsets: ["latin", "vietnamese"],
    variable: "--font-be-vietnam",
    display: "swap",
});

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.vn"),
    title: {
        default: "LaviTopup - Nạp game và mua tài khoản giao diện mới",
        template: "%s | LaviTopup",
    },
    description:
        "LaviTopup cung cấp trải nghiệm nạp game và mua tài khoản với giao diện mới hoàn toàn, ưu tiên tiếng Việt rõ ràng và thao tác nhanh.",
    keywords: [
        "lavitopup",
        "nạp game",
        "shop acc",
        "mua tài khoản game",
        "nạp game tự động",
        "giao diện nạp game mới",
    ],
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
        url: process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.vn",
        siteName: "LaviTopup",
        title: "LaviTopup - Nạp game và mua tài khoản giao diện mới",
        description:
            "Giao diện mới hoàn toàn cho hệ thống nạp game và mua tài khoản, thiết kế lại để đẹp hơn và dễ dùng hơn.",
        images: [
            {
                url: "/banner/4e4234e67024d97d7eff34daf88b8448.png",
                width: 1536,
                height: 864,
                alt: "LaviTopup",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "LaviTopup - Nạp game và mua tài khoản giao diện mới",
        description: "Bản lột xác hoàn toàn cho hệ thống nạp game và mua tài khoản.",
        images: ["/banner/4e4234e67024d97d7eff34daf88b8448.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.vn",
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
