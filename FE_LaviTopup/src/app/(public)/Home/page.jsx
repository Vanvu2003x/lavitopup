import HomeClient from "./components/HomeClient";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.io.vn";

export const metadata = {
    title: "Trang chủ phụ",
    description: "Đường dẫn phụ của trang chủ LaviTopup. Nội dung chính được chuẩn hóa về trang chủ gốc.",
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: "/",
    },
    robots: {
        index: false,
        follow: true,
    },
};

const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LaviTopup",
    alternateName: ["Lavi Topup"],
    url: siteUrl,
    description: "Topup và tài khoản game với giao diện rõ ràng, thao tác nhanh và hỗ trợ trực tiếp.",
};

const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LaviTopup",
    url: siteUrl,
    logo: `${siteUrl}/banner/logo.jpg`,
    sameAs: ["https://www.facebook.com/messages/e2ee/t/1484722313227044"],
};

export default function HomePage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
            <HomeClient games={[]} />
        </>
    );
}
