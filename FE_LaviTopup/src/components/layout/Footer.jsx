import Image from "next/image";
import Link from "next/link";
import { FaFacebookF } from "react-icons/fa";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer id="lien-he" className="relative mt-10 scroll-mt-28 overflow-hidden border-t border-white/10 bg-[#050f24]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-8rem] top-[-6rem] h-56 w-56 rounded-full bg-[#53e5c6]/10 blur-[120px]" />
                <div className="absolute bottom-[-7rem] right-[-8rem] h-64 w-64 rounded-full bg-[#ff8456]/12 blur-[120px]" />
            </div>

            <div className="relative mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
                <div>
                    <Link href="/" className="inline-flex items-center gap-3">
                        <Image src="/imgs/removed_bg.png" alt="LaviTopup" width={140} height={50} className="h-auto w-[110px] object-contain sm:w-[130px]" />
                    </Link>

                    <p className="mt-4 max-w-lg text-sm leading-7 text-[#9fb5da]">
                        Náº¡p game nhanh, thao tÃ¡c gá»n vÃ  dá»… theo dÃµi trÃªn cáº£ Ä‘iá»‡n thoáº¡i láº«n mÃ¡y tÃ­nh.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <a
                            href="https://www.facebook.com/messages/e2ee/t/1484722313227044"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-1"
                        >
                            <FaFacebookF className="text-[#ff8456]" />
                            Messenger
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-white">Äi nhanh</h3>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link href="/" className="block text-[#a9bddf] transition hover:text-white">
                            Trang chá»§
                        </Link>
                        <Link href="/#danh-muc-game" className="block text-[#a9bddf] transition hover:text-white">
                            Danh sÃ¡ch game
                        </Link>
                        <Link href="/account" className="block text-[#a9bddf] transition hover:text-white">
                            TÃ i khoáº£n
                        </Link>

                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-white">Há»— trá»£</h3>
                    <div id="ho-tro" className="surface-card mt-4 scroll-mt-28 rounded-[1.6rem] p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#53e5c6]">Há»— trá»£ 24/7</p>
                        <p className="mt-2 text-sm leading-6 text-[#9fb5da]">
                            Cáº§n kiá»ƒm tra Ä‘Æ¡n hÃ ng hoáº·c thÃ´ng tin náº¡p, báº¡n cÃ³ thá»ƒ liÃªn há»‡ ngay qua Messenger.
                        </p>
                        <a
                            href="https://www.facebook.com/messages/e2ee/t/1484722313227044"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex rounded-full bg-[#ff8456] px-4 py-2 text-sm font-bold text-[#08111f] transition hover:bg-[#ff976f]"
                        >
                            LiÃªn há»‡ ngay
                        </a>
                    </div>
                </div>
            </div>

            <div className="relative border-t border-white/10">
                <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-[#8fa7cf] sm:flex-row sm:px-6">
                    <p>
                        Â© {year} <span className="font-bold text-white">LaviTopup</span>. Náº¡p game nhanh vÃ  rÃµ rÃ ng hÆ¡n.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link href="#" className="transition hover:text-white">
                            Äiá»u khoáº£n
                        </Link>
                        <Link href="#" className="transition hover:text-white">
                            Báº£o máº­t
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
