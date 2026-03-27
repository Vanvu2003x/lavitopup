import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function AuthLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-[-12rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#53e5c6]/12 blur-[120px]" />
                <div className="absolute right-[-12rem] top-[14rem] h-[30rem] w-[30rem] rounded-full bg-[#ff8456]/14 blur-[140px]" />
                <div className="absolute bottom-[-14rem] left-[10%] h-[26rem] w-[26rem] rounded-full bg-[#6ab9ff]/12 blur-[120px]" />
                <div className="absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#53e5c6]/6 blur-[140px]" />
                <div className="grid-lines absolute inset-0 opacity-35" />
            </div>

            <Header />

            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <div className="w-full max-w-[1320px]">{children}</div>
            </main>

            <Footer />
        </div>
    );
}
