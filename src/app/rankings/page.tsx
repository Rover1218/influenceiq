"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { InfluencerAnalysis } from "../api/rankings/route";

export default function Rankings() {
    const [influencers, setInfluencers] = useState<InfluencerAnalysis[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
    const [dataHash, setDataHash] = useState<string>("");

    // Helper to generate a simple hash of the data
    const generateDataHash = (data: InfluencerAnalysis[]) => {
        return data.map(i => `${i.id}-${i.timestamp}`).join('|');
    };

    // Improved refresh function with better error handling
    const refreshRankings = async () => {
        setLoading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/rankings?t=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'pragma': 'no-cache',
                    'cache-control': 'no-cache'
                }
            });

            if (!response.ok) {
                setError("Failed to fetch rankings");
                return;
            }

            const data = await response.json();
            console.log('Rankings data fetched:', data);

            if (data && data.results && Array.isArray(data.results)) {
                // Only update if data has changed
                const newHash = generateDataHash(data.results);
                if (newHash !== dataHash) {
                    setDataHash(newHash);
                    setInfluencers(data.results);
                    setError(null);

                    if (data.results.length === 0) {
                        setError("No rankings found. Try analyzing an influencer first.");
                    }
                }
            } else {
                console.error("Invalid data format:", data);
                setError("Received invalid data format from server");
            }
        } catch (err) {
            console.error("Error fetching rankings:", err);
            setError("Failed to fetch rankings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        refreshRankings();

        // Poll every 5 seconds instead of 2
        const intervalId = setInterval(() => {
            // Only refresh if it's been more than 5 seconds since last update
            if (Date.now() - lastUpdateTime > 5000) {
                refreshRankings();
            }
        }, 5000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [lastUpdateTime, dataHash]);

    // Add fetch on focus to catch updates when tab becomes active
    useEffect(() => {
        const onFocus = () => refreshRankings();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    // Filter influencers by platform
    const filteredInfluencers = filter === "all"
        ? influencers
        : influencers.filter(inf => inf.platform.toLowerCase() === filter.toLowerCase());

    // Get list of unique platforms for filter
    const platforms = ["all", ...new Set(influencers.map(inf => inf.platform.toLowerCase()))];

    // Helper function to render credibility score badge
    const renderScoreBadge = (score: number | null) => {
        if (score === null) return <span className="text-gray-400">N/A</span>;

        let colorClass = "bg-yellow-100 text-yellow-800";
        if (score >= 8) colorClass = "bg-green-100 text-green-800";
        else if (score >= 6) colorClass = "bg-blue-100 text-blue-800";

        return (
            <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}
            >
                {score.toFixed(1)}
            </motion.span>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto pb-16"
        >
            <div className="mb-8">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gray-800"
                >
                    Top Influencer Rankings
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 mt-2"
                >
                    Our AI-powered analysis of the most credible influencers
                </motion.p>
            </div>

            {/* Filter controls with refresh button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 flex flex-wrap justify-between items-center"
            >
                <div className="flex flex-wrap items-center gap-3 mb-2 sm:mb-0">
                    <span className="text-sm font-medium text-gray-700">Filter by platform:</span>
                    <div className="flex flex-wrap gap-2">
                        {platforms.map((platform, index) => (
                            <motion.button
                                key={platform}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                onClick={() => setFilter(platform)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === platform
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {platform === "all" ? "All Platforms" : platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Add refresh button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={refreshRankings}
                    disabled={loading}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Rankings
                </motion.button>
            </motion.div>

            {loading ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"
                    ></motion.div>
                    <p className="mt-4 text-gray-600">Loading influencer rankings...</p>
                </motion.div>
            ) : error ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100"
                >
                    <p>{error}</p>
                </motion.div>
            ) : filteredInfluencers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-100"
                >
                    <p>No influencer rankings are available yet. Analyze some influencers to see them appear here!</p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Rank", "Influencer", "Platform", "Niche", "Credibility", "Audience", "Actions"].map((header, index) => (
                                        <motion.th
                                            key={header}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header}
                                        </motion.th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredInfluencers.map((influencer, index) => (
                                    <motion.tr
                                        key={influencer.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        className="hover:bg-blue-50 transition-colors"
                                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.6)" }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                                    {influencer.name.charAt(0)}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{influencer.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${influencer.platform === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                                                influencer.platform === 'TikTok' ? 'bg-purple-100 text-purple-800' :
                                                    influencer.platform === 'YouTube' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {influencer.platform}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{influencer.niche}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {renderScoreBadge(influencer.credibilityScore)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{influencer.audience}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link href={`/?name=${encodeURIComponent(influencer.name)}&platform=${encodeURIComponent(influencer.platform)}`}>
                                                <motion.span
                                                    className="inline-flex items-center px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                    View
                                                </motion.span>
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-gray-500 mt-6"
            >
                Rankings are updated in real-time based on our AI analysis of engagement metrics, content quality, and audience authenticity.
            </motion.p>
        </motion.div>
    );
}
