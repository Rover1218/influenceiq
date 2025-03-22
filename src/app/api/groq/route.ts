// Define types for error handling
interface ApiError {
    status?: number;
    statusText?: string;
    body?: string;
    message?: string;
}

// Add validation and data integrity checks
async function validateAnalysisResults(data: any): Promise<boolean> {
    // Check for suspicious patterns in the analysis
    // Compare with historical data for anomalies
    // Verify against multiple data sources
    // ...implementation here
    return true; // If valid
}

export async function POST(req: Request) {
    try {
        const { prompt, structured = false } = await req.json();

        if (!prompt || typeof prompt !== 'string') {
            return Response.json({ error: { message: "A valid prompt is required" } }, { status: 400 });
        }

        // Structure the prompt to get machine-readable data if requested
        let enhancedPrompt = prompt;
        if (structured) {
            enhancedPrompt = `${prompt}

Please provide your response in the following JSON format:
{
  "credibilityScore": (number between 1-10),
  "audienceAuthenticity": {
    "score": (number between 1-10),
    "analysis": "(text summary)"
  },
  "contentQuality": {
    "score": (number between 1-10),
    "analysis": "(text summary)"
  },
  "brandAlignmentPotential": {
    "score": (number between 1-10),
    "analysis": "(text summary)"
  },
  "engagementMetrics": {
    "score": (number between 1-10),
    "analysis": "(text summary)"
  },
  "overallAnalysis": "(detailed text summary)"
}

If you don't have specific information about this influencer, set scores to null and provide general information in the analysis fields.`;
        }

        // List of available Groq models to try
        const models = ["llama3-70b-8192", "llama2-70b-4096", "mixtral-8x7b-32768"];
        let lastError: ApiError | null = null;

        // Try each model in sequence until one works
        for (const model of models) {
            try {
                console.log(`Attempting request with model: ${model}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: structured ?
                                    "You are an expert influencer marketing analyst. Provide detailed analysis and always respond in valid JSON format when requested." :
                                    "You are an expert influencer marketing analyst. Provide detailed analysis."
                            },
                            { role: "user", content: enhancedPrompt }
                        ],
                        temperature: 0.5,
                        max_tokens: 1500,
                        response_format: structured ? { type: "json_object" } : undefined
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Groq API error with model ${model}:`, errorText);
                    lastError = {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText
                    };
                    // Continue to the next model
                    continue;
                }

                const data = await response.json();

                // Add validation before saving results
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    const parsedData = structured ? JSON.parse(content) : content;

                    // Validate the parsed data
                    const isValid = await validateAnalysisResults(parsedData);
                    if (!isValid) {
                        return Response.json({
                            error: { message: "Analysis validation failed - suspect data detected" }
                        }, { status: 400 });
                    }

                    // Continue with processing...
                }

                return Response.json(data);
            } catch (modelError) {
                console.error(`Error with model ${model}:`, modelError);
                if (modelError instanceof Error) {
                    lastError = { message: modelError.message };
                } else {
                    lastError = { message: 'Unknown error occurred' };
                }
                // Continue to the next model
            }
        }

        // If we get here, all models failed
        console.error("All Groq API models failed. Last error:", lastError);

        // Return fallback response instead of error
        return Response.json({
            choices: [{
                message: {
                    content: structured ?
                        JSON.stringify({
                            credibilityScore: null,
                            audienceAuthenticity: { score: null, analysis: "Data currently unavailable due to technical issues." },
                            contentQuality: { score: null, analysis: "Data currently unavailable due to technical issues." },
                            brandAlignmentPotential: { score: null, analysis: "Data currently unavailable due to technical issues." },
                            engagementMetrics: { score: null, analysis: "Data currently unavailable due to technical issues." },
                            overallAnalysis: "I'm sorry, I couldn't analyze this influencer at the moment. Our service is experiencing technical difficulties. Please try again later."
                        }) :
                        "I'm sorry, I couldn't analyze this influencer at the moment. Our analysis service is experiencing technical difficulties. Please try again later or search for another influencer."
                }
            }]
        });
    } catch (error) {
        console.error("Request processing error:", error);
        return Response.json({
            error: { message: "Failed to process request. Please try again." }
        }, { status: 400 });
    }
}