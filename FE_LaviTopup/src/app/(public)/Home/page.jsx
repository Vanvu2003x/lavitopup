import HomeClient from "./components/HomeClient";

export const metadata = {
    title: "LaviTopup - Nạp game nhanh",
    description:
        "Nạp game nhanh chóng với giao diện rõ ràng, dễ dùng. Chọn game, nhập thông tin và thanh toán chỉ trong vài bước.",
    keywords: [
        "lavitopup",
        "nạp game",
        "nạp game tiện lợi",
        "nạp game nhanh",
        "topup game",
        "mua tài khoản game",
    ],
    authors: [{ name: "LaviTopup" }],
    creator: "LaviTopup",
    publisher: "LaviTopup",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.vn"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "LaviTopup - Nạp game nhanh",
        description: "Chọn game, nhập thông tin và thanh toán trên giao diện rõ ràng, dễ dùng.",
        url: "/",
        siteName: "LaviTopup",
        images: [
            {
                url: "/banner/4e4234e67024d97d7eff34daf88b8448.png",
                width: 1536,
                height: 864,
                alt: "LaviTopup - Nạp game nhanh",
                type: "image/png",
            },
        ],
        locale: "vi_VN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "LaviTopup - Nạp game nhanh",
        description: "Trang chủ nạp game rõ ràng, dễ tìm game và dễ thao tác.",
        images: ["/banner/4e4234e67024d97d7eff34daf88b8448.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LaviTopup",
    alternateName: ["Lavi Topup"],
    url: process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.vn",
    description: "Trang nạp game rõ ràng, dễ tìm game, dễ thao tác và dễ liên hệ hỗ trợ.",
};

const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LaviTopup",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.vn",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.vn"}/imgs/removed_bg.png`,
    sameAs: [],
};

export default function HomePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
            />
            <HomeClient games={[]} />
        </>
    );
}
