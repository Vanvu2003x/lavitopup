import React from "react";

const GameListSkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                    {/* Image Skeleton */}
                    <div className="aspect-[3/4] w-full bg-slate-700/50 rounded-2xl animate-pulse" />

                    {/* Title Skeleton */}
                    <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse" />

                    {/* Price/Tags Skeleton */}
                    <div className="flex gap-2">
                        <div className="h-3 w-1/3 bg-slate-700/50 rounded animate-pulse" />
                        <div className="h-3 w-1/3 bg-slate-700/50 rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GameListSkeleton;
