export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.io.vn";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/agent/", "/api/", "/payment/", "/account/", "/auth/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}