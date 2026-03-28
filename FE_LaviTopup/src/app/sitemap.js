export const dynamic = "force-dynamic";

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.io.vn";
    const apiUrl = process.env.INTERNAL_API_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/categories/acc`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
        },
    ];

    let gamePages = [];

    try {
        const topupResponse = await fetch(`${apiUrl}/api/games/by-type?type=TOPUP`, {
            cache: "no-store",
        });
        const topupGames = await topupResponse.json();

        gamePages = Array.isArray(topupGames)
            ? topupGames
                  .filter((game) => game.gamecode)
                  .map((game) => ({
                      url: `${baseUrl}/categories/topup/${game.gamecode}`,
                      lastModified: new Date(game.updated_at || Date.now()),
                      changeFrequency: "weekly",
                      priority: 0.8,
                  }))
            : [];
    } catch (error) {
        console.error("Lỗi tạo sitemap:", error);
    }

    return [...staticPages, ...gamePages];
}