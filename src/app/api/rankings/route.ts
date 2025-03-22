import { NextResponse } from 'next/server';

// Define types
export interface InfluencerAnalysis {
    id: string;
    name: string;
    platform: string;
    timestamp: number;
    credibilityScore: number | null;
    audienceAuthenticityScore: number | null;
    contentQualityScore: number | null;
    brandAlignmentScore: number | null;
    engagementScore: number | null;
    overallAnalysis: string;
    niche?: string;
    audience?: string;
    firstAppearanceDate?: string;  // When first analyzed
    consistencyScore?: number;     // Score for consistent performance
    careerLength?: string;         // How long they've been influential
    trendsOverTime?: {
        dates: string[];
        scores: number[];
    };
}

// Initial seed data to ensure there's always something in the rankings
const initialAnalysisData: InfluencerAnalysis[] = [
    {
        id: 'mrbeast-youtube',
        name: 'MrBeast',
        platform: 'YouTube',
        timestamp: Date.now(),
        credibilityScore: 8.0,
        audienceAuthenticityScore: 9.0,
        contentQualityScore: 9.0,
        brandAlignmentScore: 7.0,
        engagementScore: 9.0,
        overallAnalysis: "MrBeast is a social media phenomenon, with a massive following across multiple platforms. His unique content style, generosity, and philanthropic efforts have earned him a highly engaged and authentic audience.",
        niche: 'Entertainment',
        audience: '100M+',
        firstAppearanceDate: new Date().toISOString(),
        consistencyScore: 8.5,
        careerLength: 'Established',
    },
    {
        id: 'charli-damelio-tiktok',
        name: "Charli D'Amelio",
        platform: 'TikTok',
        timestamp: Date.now() - 100000,
        credibilityScore: 7.0,
        audienceAuthenticityScore: 7.0,
        contentQualityScore: 7.0,
        brandAlignmentScore: 8.0,
        engagementScore: 8.0,
        overallAnalysis: "Charli D'Amelio is one of TikTok's biggest stars known for dance videos and engaging content. She has built a strong following primarily among Gen Z users.",
        niche: 'Dance',
        audience: '50M+',
        firstAppearanceDate: new Date(Date.now() - 1000000).toISOString(),
        consistencyScore: 7.5,
        careerLength: 'Rising Star',
    }
];

// Add local storage for server-side persistence between API calls
let analysisResults: InfluencerAnalysis[] = [...initialAnalysisData];

// Create a timestamp for checking stale data
const serverStartTime = Date.now();

// Function to save rankings to sessionStorage
const saveRankingsToStorage = (data: InfluencerAnalysis[]) => {
    try {
        // Server-side check (Next.js API routes run on server)
        if (typeof window === 'undefined') return;

        sessionStorage.setItem('influencerRankings', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to sessionStorage:', error);
    }
};

// Function to load rankings from sessionStorage
const loadRankingsFromStorage = (): InfluencerAnalysis[] => {
    try {
        if (typeof window === 'undefined') return [...initialAnalysisData];

        const storedData = sessionStorage.getItem('influencerRankings');
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error('Error loading from sessionStorage:', error);
    }
    return [...initialAnalysisData];
};

// Add a function to calculate longevity metrics
function calculateLongevityMetrics(influencer: InfluencerAnalysis): Partial<InfluencerAnalysis> {
    // Calculate metrics based on historical data
    // This is a placeholder implementation
    const consistencyScore = influencer.credibilityScore ? influencer.credibilityScore * 0.9 : undefined;
    const firstAppearanceDate = influencer.firstAppearanceDate || new Date().toISOString();
    const careerLength = "New"; // Would be calculated from firstAppearanceDate

    return {
        consistencyScore,
        firstAppearanceDate,
        careerLength
    };
}

// GET handler to retrieve rankings
export async function GET(req: Request) {
    try {
        // Parse URL to get query parameters
        const url = new URL(req.url);
        const forceRefresh = url.searchParams.get('nocache') === 'true';

        console.log(`Rankings GET request, force refresh: ${forceRefresh}`);
        console.log(`Current data store has ${analysisResults.length} records`);

        // Sort by credibility score
        const sortedResults = [...analysisResults]
            .filter(result => result.credibilityScore !== null)
            .sort((a, b) => {
                const aScore = (a.credibilityScore || 0);
                const bScore = (b.credibilityScore || 0);
                return bScore - aScore;
            });

        console.log(`Rankings API: Returning ${sortedResults.length} results`);
        console.log("First few results:", sortedResults.slice(0, 3).map(r => r.name));

        return NextResponse.json({
            results: sortedResults,
            timestamp: Date.now(),
            serverUptime: Date.now() - serverStartTime
        });
    } catch (error) {
        console.error("Rankings GET error:", error);
        return NextResponse.json({
            error: 'Failed to retrieve rankings',
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

// POST handler to add new analysis
export async function POST(req: Request) {
    try {
        const analysisData = await req.json();
        console.log("Rankings API received POST data:", analysisData);

        if (!analysisData.name || !analysisData.platform) {
            console.error("Missing required fields in data:", analysisData);
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate ID based on name and platform
        const id = `${analysisData.name.toLowerCase().replace(/\s+/g, '-')}-${analysisData.platform.toLowerCase()}`;

        // Check if this influencer already exists
        const existingIndex = analysisResults.findIndex(result => result.id === id);

        const newAnalysis: InfluencerAnalysis = {
            id,
            name: analysisData.name,
            platform: analysisData.platform,
            timestamp: Date.now(),
            credibilityScore: analysisData.credibilityScore || null,
            audienceAuthenticityScore: analysisData.audienceAuthenticityScore || null,
            contentQualityScore: analysisData.contentQualityScore || null,
            brandAlignmentScore: analysisData.brandAlignmentScore || null,
            engagementScore: analysisData.engagementScore || null,
            overallAnalysis: analysisData.overallAnalysis || '',
            niche: analysisData.niche || 'General',
            audience: analysisData.audience || 'Unknown',
            firstAppearanceDate: existingIndex >= 0 ?
                analysisResults[existingIndex].firstAppearanceDate :
                new Date().toISOString(),
            consistencyScore: analysisData.consistencyScore || null,
            careerLength: analysisData.careerLength || '',
            trendsOverTime: analysisData.trendsOverTime || { dates: [], scores: [] }
        };

        if (existingIndex >= 0) {
            console.log(`Updating existing influencer: ${id}`);
            // Update existing record but preserve creation date
            analysisResults[existingIndex] = {
                ...analysisResults[existingIndex],
                ...newAnalysis,
                firstAppearanceDate: analysisResults[existingIndex].firstAppearanceDate
            };
        } else {
            console.log(`Adding new influencer: ${id}`);
            // Add new record
            analysisResults.push(newAnalysis);
        }

        // Try to persist the data across requests
        try {
            saveRankingsToStorage(analysisResults);
        } catch (e) {
            console.error("Failed to persist rankings:", e);
        }

        // Print current state for debugging
        console.log(`Current rankings count: ${analysisResults.length}`);
        console.log(`Current rankings:`, analysisResults.map(r => r.name));

        // Debug log to verify data was stored
        console.log(`Current rankings (${analysisResults.length} total):`,
            analysisResults.map(r => `${r.name} (${r.platform}): ${r.credibilityScore}`));

        // Return more detailed successful response
        return NextResponse.json({
            success: true,
            id,
            timestamp: Date.now(),
            message: existingIndex >= 0 ? 'Updated existing influencer' : 'Added new influencer',
            currentCount: analysisResults.length
        });
    } catch (error) {
        console.error("Rankings API error:", error);
        return NextResponse.json({
            error: `Failed to save analysis: ${error instanceof Error ? error.message : "Unknown error"}`
        }, { status: 500 });
    }
}
