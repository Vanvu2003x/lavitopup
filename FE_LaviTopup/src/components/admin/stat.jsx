export default function Stat({ title, info, className, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`${className} cursor-pointer w-full bg-[#1E293B]/50 backdrop-blur-xl border border-white/5 md:w-[300px] h-36 my-2 rounded-2xl p-6 transition-all hover:bg-white/5 flex flex-col justify-center shadow-lg`}
        >
            <div className="text-slate-400 font-medium text-sm mb-2 uppercase tracking-wide">{title}</div>
            <div className="text-4xl font-bold text-white font-mono">{info}</div>
        </div>
    )
}