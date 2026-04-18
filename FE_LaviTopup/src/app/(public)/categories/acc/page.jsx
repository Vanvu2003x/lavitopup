import AccClient from "./Components/AccClient";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.io.vn";

export const metadata = {
    title: "Tài khoản game",
    description:
        "Khám phá danh sách tài khoản game tại LaviTopup với bộ lọc rõ ràng, giá hiển thị minh bạch và thao tác xem nhanh.",
    alternates: {
        canonical: `${siteUrl}/categories/acc`,
    },
    openGraph: {
        title: "Tài khoản game | LaviTopup",
        description:
            "Danh sách tài khoản game tại LaviTopup với bộ lọc rõ ràng, giá hiển thị minh bạch và thao tác xem nhanh.",
        url: `${siteUrl}/categories/acc`,
        siteName: "LaviTopup",
    images: ["/banner/logo.jpg"],
        locale: "vi_VN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Tài khoản game | LaviTopup",
        description:
            "Danh sách tài khoản game tại LaviTopup với bộ lọc rõ ràng, giá hiển thị minh bạch và thao tác xem nhanh.",
    images: ["/banner/logo.jpg"],
    },
};

export default async function AccPage(props) {
    const searchParams = await props.searchParams;
    return <AccClient gamecode={searchParams?.gamecode} />;
}
