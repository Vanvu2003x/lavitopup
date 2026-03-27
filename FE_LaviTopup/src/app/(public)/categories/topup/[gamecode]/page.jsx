import { getAllPackageByGameCode } from "@/services/toup_package.service";
import { getGameByGameCode, getGames } from "@/services/games.service";
import { getImageSrc } from "@/utils/imageHelper";
import TopUpClient from "./components/TopUpClient";

export async function generateMetadata(props) {
    const params = await props.params;
    const gamecode = params.gamecode;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://topup24h.vn";

    try {
        const game = await getGameByGameCode(gamecode);

        if (game) {
            const shareImage = getImageSrc(game.poster || game.thumbnail);
            const iconImage = getImageSrc(game.thumbnail);

            return {
                title: `Nap ${game.name} gia re | Topup24h`,
                description: `Nap ${game.name} uy tin tai Topup24h. Xu ly tu dong, ho tro 24/7 va giao dien thanh toan nhanh.`,
                keywords: [`nap ${game.name}`, `topup ${game.name}`, `nap game ${game.name}`, "topup24h"],
                openGraph: {
                    title: `Nap ${game.name} gia re | Topup24h`,
                    description: `Nap ${game.name} uy tin tai Topup24h, xu ly nhanh va on dinh.`,
                    images: [shareImage],
                    type: "website",
                    locale: "vi_VN",
                },
                twitter: {
                    card: "summary_large_image",
                    title: `Nap ${game.name} gia re`,
                    description: `Dich vu nap ${game.name} uy tin tai Topup24h.`,
                    images: [shareImage],
                },
                icons: {
                    icon: iconImage,
                    shortcut: iconImage,
                    apple: iconImage,
                },
                alternates: {
                    canonical: `${baseUrl}/categories/topup/${gamecode}`,
                },
            };
        }
    } catch (error) {
        console.error("Error generating metadata:", error);
    }

    return {
        title: "Nap game online | Topup24h",
        description: "Trung tam nap game online uy tin, xu ly nhanh va gia tot.",
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

    const jsonLd = game ? {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `Nap game ${game.name}`,
        "description": `Dich vu nap ${game.name} uy tin, xu ly tu dong 24/7.`,
        "provider": {
            "@type": "Organization",
            "name": "Topup24h",
            "url": process.env.NEXT_PUBLIC_APP_URL || "https://topup24h.vn",
        },
        "areaServed": "VN",
        "image": getImageSrc(game.poster || game.thumbnail),
    } : null;

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
