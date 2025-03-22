"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Define types for structured data
interface StructuredAnalysis {
  credibilityScore: number | null;
  audienceAuthenticity: {
    score: number | null;
    analysis: string;
  };
  contentQuality: {
    score: number | null;
    analysis: string;
  };
  brandAlignmentPotential: {
    score: number | null;
    analysis: string;
  };
  engagementMetrics: {
    score: number | null;
    analysis: string;
  };
  overallAnalysis: string;
}

interface AnalysisHistoryItem {
  id: string;
  name: string;
  platform: string;
  credibilityScore: number | null;
  audienceAuthenticityScore: number | null;
  contentQualityScore: number | null;
  brandAlignmentScore: number | null;
  engagementScore: number | null;
  niche?: string;
  audience?: string;
}

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [platform, setPlatform] = useState<string>("All Platforms");
  const [error, setError] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<StructuredAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const searchParams = useSearchParams();

  // Handle URL parameters for deep linking
  useEffect(() => {
    const nameParam = searchParams.get('name');
    const platformParam = searchParams.get('platform');

    if (nameParam) {
      setQuery(nameParam);
      if (platformParam) {
        setPlatform(platformParam);
      }

      // Automatically analyze the influencer from URL params
      const timer = setTimeout(() => {
        fetchAIResponse();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Fetch analysis history on component mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/rankings');
        if (response.ok) {
          const data = await response.json();
          setAnalysisHistory(data.results || []);
        }
      } catch (error) {
        console.error("Failed to fetch analysis history:", error);
      }
    }

    fetchHistory();
  }, []);

  const fetchAIResponse = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");
    setAnalysisData(null);

    const prompt = `Analyze the social media influencer "${query}" across major platforms like Instagram, YouTube, TikTok, and Twitter. 
    If you don't have specific information about this influencer, please state that clearly and provide general information about what makes influencers credible in their niche.
    
    For influencers you do have information about, please provide:
    1. Credibility score (1-10)
    2. Audience authenticity assessment
    3. Content quality evaluation
    4. Brand alignment potential
    5. Engagement metrics analysis
    
    Also estimate their niche category, primary platform, and audience size based on your analysis.`;

    try {
      // First try to get structured data
      const structuredRes = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, structured: true }),
      });

      if (!structuredRes.ok) {
        throw new Error(`API request failed with status: ${structuredRes.status}`);
      }

      const data = await structuredRes.json();

      if (data.error) {
        setError(`${data.error.message}`);
        return;
      }

      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          const parsedData = JSON.parse(content);
          setAnalysisData(parsedData);

          // Always attempt to save, even if parsing fails
          console.log("Saving analysis to rankings:", { query, parsedData });
          await saveAnalysisToRankings(parsedData);

        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          // Create a basic analysis object to save
          const basicAnalysis: StructuredAnalysis = {
            credibilityScore: null,
            audienceAuthenticity: { score: null, analysis: '' },
            contentQuality: { score: null, analysis: '' },
            brandAlignmentPotential: { score: null, analysis: '' },
            engagementMetrics: { score: null, analysis: '' },
            overallAnalysis: content
          };

          setAnalysisData(basicAnalysis);
          console.log("Saving basic analysis:", { query, basicAnalysis });
          await saveAnalysisToRankings(basicAnalysis);
        }
      } else {
        setError("No analysis results were returned");
      }
    } catch (error) {
      console.error("Frontend error:", error);
      setError(`Connection error: ${error instanceof Error ? error.message : "Failed to reach our analysis service"}`);
    } finally {
      setLoading(false);
    }
  };

  // Save analysis data to rankings API
  const saveAnalysisToRankings = async (analysisData: StructuredAnalysis) => {
    try {
      // Determine the most likely platform if set to "All Platforms"
      let detectedPlatform = platform;
      if (detectedPlatform === "All Platforms") {
        const platformMatches = analysisData.overallAnalysis.match(/(YouTube|Instagram|TikTok|Twitter)/gi);
        if (platformMatches && platformMatches.length > 0) {
          // Use the most frequently mentioned platform
          const platformCounts: Record<string, number> = {};
          platformMatches.forEach(p => {
            const normalized = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
            platformCounts[normalized] = (platformCounts[normalized] || 0) + 1;
          });

          detectedPlatform = Object.entries(platformCounts)
            .sort((a, b) => b[1] - a[1])[0][0];

          console.log("Detected platform:", detectedPlatform);
        } else {
          // If we can't detect, use a default based on query content or just pick YouTube
          detectedPlatform = "YouTube";
        }
      }

      console.log("Using platform for ranking:", detectedPlatform);

      // Ensure all scores are numbers or null
      const validateScore = (score: any): number | null => {
        if (score === null || score === undefined) return null;
        const num = Number(score);
        return !isNaN(num) ? Math.min(10, Math.max(0, num)) : null;
      };

      const rankingData = {
        name: query,
        platform: detectedPlatform,
        credibilityScore: validateScore(analysisData.credibilityScore),
        audienceAuthenticityScore: validateScore(analysisData.audienceAuthenticity?.score),
        contentQualityScore: validateScore(analysisData.contentQuality?.score),
        brandAlignmentScore: validateScore(analysisData.brandAlignmentPotential?.score),
        engagementScore: validateScore(analysisData.engagementMetrics?.score),
        overallAnalysis: analysisData.overallAnalysis || "No detailed analysis available",
        niche: extractNiche(analysisData.overallAnalysis),
        audience: extractAudience(analysisData.overallAnalysis)
      };

      console.log('Saving to rankings API:', rankingData);

      const response = await fetch('/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankingData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save analysis to rankings:', errorText);
        return;
      }

      const data = await response.json();
      console.log('Successfully saved to rankings:', data);

      // Refresh our local analysis history
      fetchAnalysisHistory();
    } catch (error) {
      console.error('Error saving analysis:', error);
      // Try to fetch rankings anyway in case it did save
      await fetchAnalysisHistory();
    }
  };

  // Add a function to refresh history
  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch('/api/rankings');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched analysis history:', data);
        setAnalysisHistory(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
    }
  };

  // Helper function to extract niche from analysis text
  const extractNiche = (text: string): string => {
    const nichePatterns = [
      /niche:?\s*([^.,:;\n]+)/i,
      /category:?\s*([^.,:;\n]+)/i,
      /content\s*(?:type|category):?\s*([^.,:;\n]+)/i,
      /primarily\s*(?:in|focuses\s*on):?\s*([^.,:;\n]+)/i
    ];

    for (const pattern of nichePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Default niches based on platform
    const platformNiches: Record<string, string> = {
      'Instagram': 'Lifestyle',
      'YouTube': 'Entertainment',
      'TikTok': 'Entertainment',
      'Twitter': 'Commentary'
    };

    return platformNiches[platform] || 'General';
  };

  // Helper function to extract audience size from analysis text
  const extractAudience = (text: string): string => {
    const audiencePatterns = [
      /([0-9.]+\s*[mk])\s*followers/i,
      /followers:?\s*([0-9.]+\s*[mk])/i,
      /audience\s*(?:size|of):?\s*([0-9.]+\s*[mk])/i,
      /subscriber[s]?\s*(?:base|count):?\s*([0-9.]+\s*[mk])/i
    ];

    for (const pattern of audiencePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().toUpperCase();
      }
    }

    return 'Unknown';
  };

  // Helper to display suggested influencers
  const suggestedInfluencers = [
    { name: "MrBeast", platform: "YouTube" },
    { name: "Charli D'Amelio", platform: "TikTok" },
    { name: "Cristiano Ronaldo", platform: "Instagram" },
    { name: "Lilly Singh", platform: "YouTube" },
    { name: "Bhuvan Bam", platform: "YouTube" }
  ];

  const searchInfluencer = (name: string, platform: string) => {
    setQuery(name);
    // Platform selection is removed, so we don't need to update it
    // Allow a small delay for state updates
    setTimeout(() => {
      fetchAIResponse();
    }, 100);
  };

  // Component for displaying a score card with animations
  const ScoreCard = ({ title, score, description, icon }: {
    title: string,
    score: number | null,
    description: string,
    icon: React.ReactNode
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        whileHover={{ y: -5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800 flex items-center">
            {icon}
            {title}
          </h3>
          <motion.div
            className="w-16 h-16"
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {score !== null ? (
              <CircularProgressbar
                value={score * 10}
                text={`${Number(score).toFixed(score % 1 === 0 ? 0 : 1)}`}
                strokeWidth={12}
                styles={buildStyles({
                  textSize: '30px',
                  pathColor: score >= 8 ? '#10B981' : score >= 6 ? '#3B82F6' : '#F59E0B',
                  textColor: '#1F2937',
                  trailColor: '#E5E7EB',
                  pathTransitionDuration: 0.5,
                })}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full text-gray-400 text-sm">
                N/A
              </div>
            )}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100"
        >
          <p className="text-sm text-gray-600">{description}</p>
        </motion.div>
      </motion.div>
    );
  };

  // Icons for each metric
  const audienceIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );

  const contentIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  );

  const brandIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
    </svg>
  );

  const engagementIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen py-8 px-4"
    >
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          InfluencerIQ
        </h1>
        <p className="text-gray-600 mt-2">AI-Powered Influencer Analysis & Credibility Assessment</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Search section with improved styling */}
        <motion.div
          className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Analyze Any Influencer
          </h2>

          <div className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter influencer name or handle..."
                className="border border-blue-300 p-3 pl-10 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-gray-800 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAIResponse()}
              />
              {query && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchAIResponse}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-md transition-all duration-200 font-medium shadow-md transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block h-5 w-5 border-2 border-t-transparent border-white rounded-full mr-2"
                  ></motion.span>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Analyze Influencer
                </span>
              )}
            </motion.button>
          </div>

          {/* Suggested influencers section with improved styling */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-4"
          >
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Try popular influencers:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedInfluencers.map((influencer, index) => (
                <motion.button
                  key={influencer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, backgroundColor: "#EFF6FF" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => searchInfluencer(influencer.name, influencer.platform)}
                  className="px-3 py-2 bg-white rounded-full text-sm text-blue-700 transition-colors border border-blue-200 shadow-sm hover:shadow flex items-center"
                >
                  <span className="w-2 h-2 rounded-full mr-2 bg-blue-500"></span>
                  {influencer.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="inline-block rounded-full h-16 w-16"
              >
                <div className="h-full w-full border-4 border-t-blue-600 border-r-blue-400 border-b-blue-300 border-l-blue-200 rounded-full"></div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-gray-600 font-medium"
              >
                Analyzing influencer data...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500 mt-2"
              >
                Evaluating credibility, audience and content metrics
              </motion.p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 border-t border-gray-100"
            >
              <div className="border rounded-lg p-5 bg-red-50 text-red-700 border-red-100">
                <h2 className="text-lg font-semibold mb-2">Analysis Error</h2>
                <p className="font-medium">{error}</p>
                <div className="mt-3">
                  <p className="text-sm font-medium">Troubleshooting tips:</p>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    <li>Try searching for another popular influencer</li>
                    <li>Check your internet connection</li>
                    <li>The service might be temporarily unavailable</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced analysis results section with animations */}
          {analysisData && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 border-t border-gray-100 bg-gradient-to-b from-white to-blue-50"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-xl font-bold text-gray-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analysis Results for </span>
                  <span className="text-blue-600 ml-1">{query}</span>
                </motion.h2>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRawResponse(!showRawResponse)}
                  className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  {showRawResponse ? "Show Dashboard" : "Show Raw Data"}
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {!showRawResponse ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Dashboard view */}
                    <motion.div
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg mb-6 border border-blue-200 shadow-lg"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center mb-4 gap-4">
                        <div className="w-28 h-28 relative mx-auto md:mx-0 font-bold">
                          <motion.div
                            className="absolute inset-0 bg-blue-100 rounded-full"
                            animate={{
                              boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.5)", "0 0 0 10px rgba(59, 130, 246, 0)"]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "loop"
                            }}
                          />
                          {analysisData?.credibilityScore !== null &&
                            analysisData?.credibilityScore !== undefined &&
                            !isNaN(Number(analysisData.credibilityScore)) ? (
                            <CircularProgressbar
                              value={Number(analysisData.credibilityScore) * 10}
                              text={`${Number(analysisData.credibilityScore).toFixed(analysisData.credibilityScore && analysisData.credibilityScore % 1 === 0 ? 0 : 1)}`}
                              strokeWidth={8}
                              styles={buildStyles({
                                textSize: '24px',
                                textColor: '#1F2937',
                                pathColor: '#3B82F6',
                                trailColor: 'rgba(229, 231, 235, 0.5)',
                                pathTransitionDuration: 1,
                              })}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-full text-gray-600">
                              <span className="text-lg font-semibold">N/A</span>
                              <span className="text-xs">No score</span>
                            </div>
                          )}
                          {/* Fallback text for score - will display even if the circular bar doesn't render properly */}
                          {analysisData?.credibilityScore !== null &&
                            analysisData?.credibilityScore !== undefined &&
                            !isNaN(Number(analysisData.credibilityScore)) && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-gray-800 font-bold text-lg z-10">{Number(analysisData.credibilityScore).toFixed(analysisData.credibilityScore && analysisData.credibilityScore % 1 === 0 ? 0 : 1)}</span>
                              </div>
                            )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Overall Credibility Score</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Based on content quality, audience engagement and authenticity
                          </div>
                          {/* Additional display of the score as text for better visibility */}
                          {analysisData?.credibilityScore !== null &&
                            analysisData?.credibilityScore !== undefined &&
                            !isNaN(Number(analysisData.credibilityScore)) && (
                              <div className="mt-2 bg-blue-50 px-3 py-1.5 rounded-md inline-block">
                                <span className="font-bold text-blue-800 text-base">{Number(analysisData.credibilityScore).toFixed(analysisData.credibilityScore && analysisData.credibilityScore % 1 === 0 ? 0 : 1)}</span>
                                <span className="text-xs text-blue-600 ml-1.5">/ 10</span>
                              </div>
                            )}
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-4 rounded-lg border border-blue-100 text-gray-800 leading-relaxed shadow-inner"
                      >
                        <p className="font-medium text-sm border-l-4 border-blue-500 pl-3 italic">{analysisData.overallAnalysis}</p>
                      </motion.div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ScoreCard
                        title="Audience Authenticity"
                        score={analysisData.audienceAuthenticity?.score || null}
                        description={analysisData.audienceAuthenticity?.analysis || "No data available"}
                        icon={audienceIcon}
                      />
                      <ScoreCard
                        title="Content Quality"
                        score={analysisData.contentQuality?.score || null}
                        description={analysisData.contentQuality?.analysis || "No data available"}
                        icon={contentIcon}
                      />
                      <ScoreCard
                        title="Brand Alignment"
                        score={analysisData.brandAlignmentPotential?.score || null}
                        description={analysisData.brandAlignmentPotential?.analysis || "No data available"}
                        icon={brandIcon}
                      />
                      <ScoreCard
                        title="Engagement Metrics"
                        score={analysisData.engagementMetrics?.score || null}
                        description={analysisData.engagementMetrics?.analysis || "No data available"}
                        icon={engagementIcon}
                      />
                    </div>
                  </motion.div>
                ) : (
                  // Raw data view styling improved
                  <motion.div
                    key="rawdata"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200 shadow-inner"
                  >
                    <h3 className="font-mono text-sm mb-3 text-gray-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Raw Analysis Data:
                    </h3>
                    <motion.pre
                      className="whitespace-pre-wrap bg-white p-4 rounded border text-sm overflow-auto max-h-96 shadow-sm font-mono text-gray-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {response}
                    </motion.pre>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 pt-4 border-t border-gray-100"
              >
                <div className="flex flex-wrap items-center justify-between">
                  <p className="text-sm text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Analysis completed on {new Date().toLocaleString()}
                  </p>

                  <Link href="/rankings" className="mt-2 sm:mt-0">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      View Influencer Rankings
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}

          {analysisHistory.length > 0 && !analysisData && !loading && !error && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 border-t border-gray-100"
            >
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Recently Analyzed Influencers
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {analysisHistory.slice(0, 5).map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{item.name}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.platform === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                            item.platform === 'TikTok' ? 'bg-purple-100 text-purple-800' :
                              item.platform === 'YouTube' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {item.platform}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {item.credibilityScore ? (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, delay: 0.2 + index * 0.05 }}
                              className={`px-2 py-1 rounded text-xs font-medium ${item.credibilityScore >= 8 ? 'bg-green-100 text-green-800' :
                                item.credibilityScore >= 6 ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {item.credibilityScore.toFixed(1)}
                            </motion.span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => searchInfluencer(item.name, item.platform)}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                            </svg>
                            Analyze
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}