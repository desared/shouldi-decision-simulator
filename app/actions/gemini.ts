"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    type GeminiSurveyResponse,
    type GeminiOutcomeResponse,
    type SurveyQuestion,
    type SurveyOutcome
} from "@/lib/gemini-service";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

// Simple retry helper
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Only retry on rate limit errors (429)
            if (!errorMessage.includes("429") && !errorMessage.includes("Resource exhausted")) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

const getLanguageInstruction = (locale: string) =>
    locale === "de" ? "\n\nIMPORTANT: All questions, options, titles, descriptions, recommendations, and summaries MUST be written in German (Deutsch)." : "";

const getSurveyPrompt = (questionCount: number) => `You are a life decision advisor. Given a user's "Should I...?" question, generate exactly ${questionCount} thoughtful survey questions to help assess their situation.

Each question should:
- Be highly specific and directly relevant to the user's exact question
- Be introspective and help the user reflect on their unique situation
- Have 4 answer options ranging from negative to positive sentiment
- Cover different aspects: emotional readiness, financial impact, timing, support system, risks, and opportunities

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": [
        {"value": "strongly_negative", "label": "Option 1"},
        {"value": "negative", "label": "Option 2"},
        {"value": "positive", "label": "Option 3"},
        {"value": "strongly_positive", "label": "Option 4"}
      ]
    }
  ]
}`;

const getOutcomePrompt = (bestCaseOnly: boolean) => bestCaseOnly
  ? `You are a life decision advisor. Based on the user's question and their survey responses, provide the most likely positive outcome and a recommendation.

Analyze the responses and provide:
1. 1 best-case outcome
2. A confidence level
3. A specific confidence probability interval (e.g., "75-85%")
4. A brief recommendation
5. An overall summary

Give a full, detailed answer.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "outcomes": [
    {
      "title": "Outcome title",
      "description": "Detailed description of this outcome scenario. Be specific and explain why.",
      "confidence": "high|medium|low",
      "confidenceInterval": "XX-YY%",
      "recommendation": "What to do if this outcome applies"
    }
  ],
  "summary": "Overall recommendation based on all responses"
}`
  : `You are a life decision advisor. Based on the user's question and their survey responses, provide thoughtful outcomes and recommendations.

Analyze the responses and provide:
1. 3 possible outcomes (best case, likely case, worst case)
2. A confidence level for each outcome
3. A specific confidence probability interval (e.g., "75-85%") for each outcome.
4. A brief recommendation for each
5. An overall summary

Do not summarize the outcomes too much, give full, detailed answers.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "outcomes": [
    {
      "title": "Outcome title",
      "description": "Detailed description of this outcome scenario. Be specific and explain why.",
      "confidence": "high|medium|low",
      "confidenceInterval": "XX-YY%",
      "recommendation": "What to do if this outcome applies"
    }
  ],
  "summary": "Overall recommendation based on all responses"
}`;

export async function generateSurveyQuestionsAction(
    userQuestion: string,
    questionCount: number = 4,
    locale: string = "en"
): Promise<GeminiSurveyResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const prompt = `${getSurveyPrompt(questionCount)}${getLanguageInstruction(locale)}

User's question: "${userQuestion}"

Generate ${questionCount} relevant survey questions for this specific decision.`;

        const parsed = await withRetry(async () => {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up the response
            const cleanedText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            return JSON.parse(cleanedText) as GeminiSurveyResponse;
        });

        return parsed;
    } catch (error) {
        console.error("Error generating survey questions (Server Action):", error);
        // Return fallback questions
        const fallbackEn = [
            {
                id: "q1",
                question: "How do you feel about your current situation?",
                options: [
                    { value: "strongly_negative", label: "Very unhappy" },
                    { value: "negative", label: "Somewhat unhappy" },
                    { value: "positive", label: "Okay" },
                    { value: "strongly_positive", label: "Very happy" },
                ],
            },
            {
                id: "q2",
                question: "Have you thoroughly researched your options?",
                options: [
                    { value: "strongly_negative", label: "Not at all" },
                    { value: "negative", label: "A little bit" },
                    { value: "positive", label: "Quite a bit" },
                    { value: "strongly_positive", label: "Extensively" },
                ],
            },
            {
                id: "q3",
                question: "How urgent is this decision for you?",
                options: [
                    { value: "strongly_negative", label: "Not urgent at all" },
                    { value: "negative", label: "Can wait a while" },
                    { value: "positive", label: "Fairly urgent" },
                    { value: "strongly_positive", label: "Very urgent" },
                ],
            },
            {
                id: "q4",
                question: "Do you have support from people you trust?",
                options: [
                    { value: "strongly_negative", label: "No support" },
                    { value: "negative", label: "Little support" },
                    { value: "positive", label: "Some support" },
                    { value: "strongly_positive", label: "Strong support" },
                ],
            },
        ];
        const fallbackDe = [
            {
                id: "q1",
                question: "Wie fühlen Sie sich in Ihrer aktuellen Situation?",
                options: [
                    { value: "strongly_negative", label: "Sehr unzufrieden" },
                    { value: "negative", label: "Etwas unzufrieden" },
                    { value: "positive", label: "In Ordnung" },
                    { value: "strongly_positive", label: "Sehr zufrieden" },
                ],
            },
            {
                id: "q2",
                question: "Haben Sie Ihre Optionen gründlich recherchiert?",
                options: [
                    { value: "strongly_negative", label: "Überhaupt nicht" },
                    { value: "negative", label: "Ein wenig" },
                    { value: "positive", label: "Ziemlich viel" },
                    { value: "strongly_positive", label: "Umfassend" },
                ],
            },
            {
                id: "q3",
                question: "Wie dringend ist diese Entscheidung für Sie?",
                options: [
                    { value: "strongly_negative", label: "Gar nicht dringend" },
                    { value: "negative", label: "Kann noch warten" },
                    { value: "positive", label: "Ziemlich dringend" },
                    { value: "strongly_positive", label: "Sehr dringend" },
                ],
            },
            {
                id: "q4",
                question: "Haben Sie Unterstützung von vertrauenswürdigen Personen?",
                options: [
                    { value: "strongly_negative", label: "Keine Unterstützung" },
                    { value: "negative", label: "Wenig Unterstützung" },
                    { value: "positive", label: "Etwas Unterstützung" },
                    { value: "strongly_positive", label: "Starke Unterstützung" },
                ],
            },
        ];
        return {
            questions: (locale === "de" ? fallbackDe : fallbackEn).slice(0, questionCount)
        };
    }
}

export async function generateOutcomesAction(
    userQuestion: string,
    answers: Record<string, { question: string; answer: string }>,
    bestCaseOnly: boolean = false,
    locale: string = "en"
): Promise<GeminiOutcomeResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const answersText = Object.entries(answers)
            .map(([, { question, answer }]) => `Q: ${question}\nA: ${answer}`)
            .join("\n\n");

        const prompt = `${getOutcomePrompt(bestCaseOnly)}${getLanguageInstruction(locale)}

User's original question: "${userQuestion}"

Survey responses:
${answersText}

Analyze these responses and provide outcomes.`;

        const parsed = await withRetry(async () => {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up the response
            const cleanedText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            return JSON.parse(cleanedText) as GeminiOutcomeResponse;
        });

        return parsed;
    } catch (error) {
        console.error("Error generating outcomes (Server Action):", error);
        // Return fallback outcomes
        if (locale === "de") {
            return {
                outcomes: [
                    {
                        title: "Positives Ergebnis",
                        description:
                            "Basierend auf Ihren Antworten könnte diese Veränderung zu positiven Ergebnissen führen.",
                        confidence: "medium",
                        confidenceInterval: "60-75%",
                        recommendation:
                            "Erwägen Sie, mit sorgfältiger Planung und Vorbereitung voranzuschreiten.",
                    },
                    {
                        title: "Neutrales Ergebnis",
                        description:
                            "Die Situation wird sich möglicherweise in keiner Richtung wesentlich verändern.",
                        confidence: "medium",
                        confidenceInterval: "40-60%",
                        recommendation:
                            "Nehmen Sie sich mehr Zeit, um Ihre Optionen zu bewerten, bevor Sie sich entscheiden.",
                    },
                    {
                        title: "Vorsichtiges Ergebnis",
                        description:
                            "Es könnten Herausforderungen bevorstehen, die Aufmerksamkeit erfordern.",
                        confidence: "low",
                        confidenceInterval: "20-40%",
                        recommendation:
                            "Gehen Sie mögliche Hindernisse an, bevor Sie eine endgültige Entscheidung treffen.",
                    },
                ],
                summary:
                    "Basierend auf Ihren Antworten empfehlen wir, sich Zeit zu nehmen, um alle Faktoren sorgfältig abzuwägen, bevor Sie Ihre Entscheidung treffen.",
            };
        }
        return {
            outcomes: [
                {
                    title: "Positive Outcome",
                    description:
                        "Based on your responses, making this change could lead to positive results.",
                    confidence: "medium",
                    confidenceInterval: "60-75%",
                    recommendation:
                        "Consider moving forward with careful planning and preparation.",
                },
                {
                    title: "Neutral Outcome",
                    description:
                        "The situation may not change significantly either way.",
                    confidence: "medium",
                    confidenceInterval: "40-60%",
                    recommendation:
                        "Take more time to evaluate your options before deciding.",
                },
                {
                    title: "Cautious Outcome",
                    description:
                        "There may be challenges ahead that require attention.",
                    confidence: "low",
                    confidenceInterval: "20-40%",
                    recommendation:
                        "Address potential obstacles before making a final decision.",
                },
            ],
            summary:
                "Based on your responses, we recommend taking time to carefully consider all factors before making your decision.",
        };
    }
}
