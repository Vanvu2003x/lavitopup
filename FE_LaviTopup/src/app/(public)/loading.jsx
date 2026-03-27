"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Loading() {
    return (
        <section className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8 font-sans">
            <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    {/* Hero Section Skeleton */}
                    <div className="w-full h-[400px] rounded-3xl overflow-hidden relative">
                        <Skeleton height="100%" className="absolute inset-0" />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content Skeleton */}
                        <div className="flex-1 space-y-8">
                            {/* Filter Bar */}
                            <div className="flex items-center gap-4">
                                <Skeleton width={100} height={40} borderRadius={12} />
                                <Skeleton width={100} height={40} borderRadius={12} />
                                <Skeleton width={100} height={40} borderRadius={12} />
                            </div>

                            {/* Game Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {Array(8)
                                    .fill(0)
                                    .map((_, i) => (
                                        <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden">
                                            <Skeleton height="100%" />
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                            <Skeleton height={200} borderRadius={24} />
                            <Skeleton height={300} borderRadius={24} />
                        </div>
                    </div>
                </div>
            </SkeletonTheme>
        </section>
    );
}
