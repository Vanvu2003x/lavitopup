import HomePage from "./Home/page";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.io.vn";

export const metadata = {
    title: "LaviTopup | Trang chủ",
    description: "LaviTopup cung cấp topup và tài khoản game với giao diện rõ ràng, dễ thao tác và hỗ trợ trực tiếp khi cần.",
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        title: "LaviTopup | Trang chủ",
        description: "LaviTopup cung cấp topup và tài khoản game với giao diện rõ ràng, dễ thao tác và hỗ trợ trực tiếp khi cần.",
        url: siteUrl,
        siteName: "LaviTopup",
    images: ["/banner/logo.jpg"],
        locale: "vi_VN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "LaviTopup | Trang chủ",
        description: "LaviTopup cung cấp topup và tài khoản game với giao diện rõ ràng, dễ thao tác và hỗ trợ trực tiếp khi cần.",
    images: ["/banner/logo.jpg"],
    },
};

export default function App() {
    return <HomePage />;
}
