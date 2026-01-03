import { GoogleGenAI, Type } from "@google/genai";
import { Policy, MedicalEvent, EstimationResult } from "../types";

// Helper to reliably extract JSON object from string
const cleanJsonString = (str: string) => {
  if (!str) return "{}";
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return str.substring(firstBrace, lastBrace + 1);
  }
  return str.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
};

export const extractPolicyFromImage = async (base64Data: string, language: 'zh-TW' | 'en-US'): Promise<Partial<Policy>> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("System API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const mimeType = base64Data.substring(base64Data.indexOf(':') + 1, base64Data.indexOf(';'));
  const data = base64Data.split(',')[1];

  const prompt = `
    Analyze this insurance policy document. 
    Language Context: ${language}
    Extract: Company Name, Plan Name, Coverage Amount.
    Output strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            mainPlanName: { type: Type.STRING },
            mainCoverageAmount: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = cleanJsonString(response.text || "{}");
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini API Error (extractPolicy):", e);
    throw new Error("Failed to scan policy.");
  }
};

export const estimateClaims = async (
  policies: Policy[],
  event: MedicalEvent,
  language: 'zh-TW' | 'en-US'
): Promise<EstimationResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("System API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const langName = language === 'zh-TW' ? 'Traditional Chinese (繁體中文)' : 'English';

  const prompt = `
    Act as an expert insurance claim adjuster.
    TASK: Calculate estimated claim amounts based strictly on the policies and medical event provided.
    OBJECTIVE: Provide a factual estimation of how much can be claimed. Do not judge the quality of the policy.
    
    [INPUT DATA]
    POLICIES: ${JSON.stringify(policies)}
    INCIDENT: ${JSON.stringify(event)}
    
    OUTPUT LANGUAGE: ${langName}.
    Return STRICT JSON.
  `;

  const evidenceParts = event.evidenceFiles.map(fileStr => {
    const mimeType = fileStr.substring(fileStr.indexOf(':') + 1, fileStr.indexOf(';'));
    const data = fileStr.split(',')[1];
    return { inlineData: { mimeType, data } };
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { 
        parts: [
          { text: prompt },
          ...evidenceParts
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            totalEstimatedAmount: { type: Type.NUMBER },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  policyId: { type: Type.STRING },
                  componentName: { type: Type.STRING },
                  estimatedAmount: { type: Type.NUMBER },
                  status: { type: Type.STRING, enum: ['APPLICABLE', 'POTENTIAL', 'NOT_APPLICABLE'] },
                  reason: { type: Type.STRING }
                }
              }
            },
            evaluationPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            communicationAdvice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['strategy', 'warning', 'tip'] }
                },
                required: ["title", "content", "type"]
              }
            }
          },
          required: ["summary", "totalEstimatedAmount", "items", "evaluationPoints", "communicationAdvice"]
        }
      }
    });

    const cleanedText = cleanJsonString(response.text || "{}");
    const parsed = JSON.parse(cleanedText);

    return {
      summary: parsed.summary || "Analysis complete.",
      totalEstimatedAmount: typeof parsed.totalEstimatedAmount === 'number' ? parsed.totalEstimatedAmount : 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      evaluationPoints: Array.isArray(parsed.evaluationPoints) ? parsed.evaluationPoints : [],
      communicationAdvice: Array.isArray(parsed.communicationAdvice) ? parsed.communicationAdvice : []
    };

  } catch (e) {
    console.error("Gemini API Error:", e);
    return {
        summary: "Analysis failed.",
        totalEstimatedAmount: 0,
        items: [],
        evaluationPoints: [],
        communicationAdvice: []
    }
  }
};
