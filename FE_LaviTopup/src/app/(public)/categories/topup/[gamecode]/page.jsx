import { getAllPackageByGameCode } from "@/services/toup_package.service";
import { getGameByGameCode, getGames } from "@/services/games.service";
import { getImageSrc } from "@/utils/imageHelper";
import TopUpClient from "./components/TopUpClient";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lavitopup.io.vn";

export async function generateMetadata(props) {
    const params = await props.params;
    const gamecode = params.gamecode;

    try {
        const game = await getGameByGameCode(gamecode);

        if (game) {
            const gameName = game.custom_name || game.name;
            const shareImage = getImageSrc(game.poster || game.thumbnail);
            const iconImage = getImageSrc(game.thumbnail);
            const canonicalUrl = `${siteUrl}/categories/topup/${gamecode}`;

            return {
                title: `Nạp ${gameName}`,
                description: `Nạp ${gameName} tại LaviTopup với giao diện rõ ràng, thao tác nhanh và hỗ trợ trực tiếp khi cần.`,
                keywords: [`nạp ${gameName}`, `topup ${gameName}`, `${gameName} LaviTopup`, "LaviTopup"],
                openGraph: {
                    title: `Nạp ${gameName} | LaviTopup`,
                    description: `Nạp ${gameName} tại LaviTopup với thao tác nhanh, giao diện dễ dùng và hỗ trợ trực tiếp.`,
                    url: canonicalUrl,
                    images: [shareImage],
                    type: "website",
                    locale: "vi_VN",
                },
                twitter: {
                    card: "summary_large_image",
                    title: `Nạp ${gameName} | LaviTopup`,
                    description: `Nạp ${gameName} tại LaviTopup với thao tác nhanh và giao diện dễ dùng.`,
                    images: [shareImage],
                },
                icons: {
                    icon: iconImage,
                    shortcut: iconImage,
                    apple: iconImage,
                },
                alternates: {
                    canonical: canonicalUrl,
                },
            };
        }
    } catch (error) {
        console.error("Error generating metadata:", error);
    }

    return {
        title: "Topup game",
        description: "Trang topup game của LaviTopup với giao diện rõ ràng và thao tác nhanh.",
        alternates: {
            canonical: `${siteUrl}/categories/topup/${gamecode}`,
        },
    };
}

export default async function GameTopUpPage(props) {
    const params = await props.params;
    const gamecode = params.gamecode;
    let game = null;
    let listPkg = [];
    let allTopUpGames = [];

    try {
        const [packagesData, gameData, allGamesData] = await Promise.all([
            getAllPackageByGameCode(gamecode),
            getGameByGameCode(gamecode),
            getGames(),
        ]);

        listPkg = packagesData || [];
        game = gameData || null;
        allTopUpGames = Array.isArray(allGamesData) ? allGamesData : [];
    } catch (error) {
        console.error("Error fetching data:", error);
    }

    const jsonLd = game
        ? {
              "@context": "https://schema.org",
              "@type": "Service",
              name: `Nạp ${game.custom_name || game.name}`,
              description: `Dịch vụ nạp ${game.custom_name || game.name} tại LaviTopup với thao tác nhanh và hỗ trợ trực tiếp.`,
              provider: {
                  "@type": "Organization",
                  name: "LaviTopup",
                  url: siteUrl,
              },
              areaServed: "VN",
              image: getImageSrc(game.poster || game.thumbnail),
              url: `${siteUrl}/categories/topup/${gamecode}`,
          }
        : null;

    return (
        <>
            {jsonLd ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            ) : null}
            <TopUpClient game={game} listPkg={listPkg} allTopUpGames={allTopUpGames} />
        </>
    );
}