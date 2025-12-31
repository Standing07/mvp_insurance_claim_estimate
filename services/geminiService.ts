
import { GoogleGenAI, Type } from "@google/genai";
import { Policy, MedicalEvent, EstimationResult } from "../types";

// Helper to reliably extract JSON object from string
const cleanJsonString = (str: string): string => {
  if (!str) return "{}";
  // Try to find the first '{' and last '}'
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return str.substring(firstBrace, lastBrace + 1);
  }
  // Fallback regex cleanup
  return str.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
};

const getApiKey = () => {
  // Try multiple ways to get the key
  // @ts-ignore
  let key = process.env.API_KEY;
  
  // @ts-ignore
  if (!key && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    key = import.meta.env.VITE_API_KEY;
  }

  return key;
};

export const extractPolicyFromImage = async (base64Data: string, language: 'zh-TW' | 'en-US'): Promise<Partial<Policy>> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("API Key is missing in extractPolicyFromImage");
    throw new Error("System API Key is missing. Please check your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const mimeType = base64Data.substring(base64Data.indexOf(':') + 1, base64Data.indexOf(';'));
  const data = base64Data.split(',')[1];

  const prompt = `
    Analyze this insurance policy document. 
    Language Context: ${language}
    
    Extract:
    1. Insurance Company Name
    2. Main Plan Name (The specific commercial name)
    3. Main Coverage Amount (numeric value only)
    
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
    throw new Error("Failed to scan policy. Check console for details.");
  }
};

export const estimateClaims = async (
  policies: Policy[],
  event: MedicalEvent,
  language: 'zh-TW' | 'en-US'
): Promise<EstimationResult> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("API Key is missing in estimateClaims");
    throw new Error("System API Key is missing. Please check your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const langName = language === 'zh-TW' ? 'Traditional Chinese (繁體中文)' : 'English';

  const prompt = `
    You are an expert insurance claim adjuster.
    
    TASK: Calculate estimated claim amounts based on the Policies and Medical Incident provided below.
    OUTPUT LANGUAGE: ${langName}. ALL fields (summary, reason, advice content) MUST be in ${langName}.
    
    [INPUT DATA]
    POLICIES: ${JSON.stringify(policies)}
    INCIDENT: ${JSON.stringify(event)}
    
    [CALCULATION RULES]
    1. Match the 'incident_type' and 'surgery/treatment' to the policy coverage.
    2. For 'Daily Hospitalization Benefit': Amount = Days * Daily Rate.
    3. For 'Surgery Benefit': Estimate percentage based on surgery name.
    4. For 'Reimbursement' (實支實付): 
       - If totalExpense > limit, Amount = limit.
       - If totalExpense <= limit, Amount = totalExpense.
       - Deduct 'retainedAmount' if applicable.
    
    [OUTPUT INSTRUCTION]
    - Return STRICT JSON format.
    - NO markdown backticks.
    - 'estimatedAmount' MUST be a Number.
    - 'status' must be: 'APPLICABLE', 'POTENTIAL', or 'NOT_APPLICABLE'.
    - 'componentName' should be the policy name or coverage name in ${langName}.
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

    // Ensure strict type safety and defaults
    return {
      summary: parsed.summary || (language === 'zh-TW' ? "AI 分析完成，請參考下方明細。" : "Analysis complete."),
      totalEstimatedAmount: typeof parsed.totalEstimatedAmount === 'number' ? parsed.totalEstimatedAmount : 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      evaluationPoints: Array.isArray(parsed.evaluationPoints) ? parsed.evaluationPoints : [],
      communicationAdvice: Array.isArray(parsed.communicationAdvice) ? parsed.communicationAdvice : []
    };

  } catch (e: any) {
    console.error("Gemini API Error (estimateClaims):", e);
    // Return a more user-friendly error
    if (e.message && e.message.includes('API key')) {
      throw new Error("Invalid API Key. Please check settings.");
    }
    // Fallback result for empty/failed parsing to keep UI alive
    return {
        summary: language === 'zh-TW' ? "AI 分析過程發生異常，無法產生完整報告。" : "AI Analysis failed to generate a full report.",
        totalEstimatedAmount: 0,
        items: [],
        evaluationPoints: [language === 'zh-TW' ? "請檢查輸入資料是否完整。" : "Please check your input data."],
        communicationAdvice: []
    }
  }
};
