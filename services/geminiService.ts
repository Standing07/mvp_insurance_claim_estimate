
import { GoogleGenAI, Type } from "@google/genai";
import { Policy, MedicalEvent, EstimationResult, Rider } from "../types";

export const extractPolicyFromImage = async (base64Image: string): Promise<Partial<Policy>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this insurance policy document image. 
    Extract:
    1. Insurance Company Name (e.g. 國泰人壽)
    2. Main Plan Name (The specific commercial name of the policy, e.g., 真安順手術醫療終身保險)
    3. Main Coverage Amount (numeric value only)
    
    Return the result in JSON format matching the Policy structure.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
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

  return JSON.parse(response.text || "{}");
};

export const estimateClaims = async (
  policies: Policy[],
  event: MedicalEvent
): Promise<EstimationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a professional insurance claim consultant in Taiwan.
    Analyze the following case against the provided policies.
    
    POLICIES: ${JSON.stringify(policies)}
    MEDICAL INCIDENT: ${JSON.stringify(event)}
    
    NOTE ON FINANCIALS:
    - 'totalExpense' is the Amount of Self-payment (Receipt total).
    - 'retainedAmount' is the Deductible/Self-retention amount if applicable.
    
    NOTE ON POLICIES:
    - Policy names are provided as specific commercial names (e.g., "國泰人壽真安順..."). 
    - You must INFER the coverage type (Life, Medical, Accident, etc.) based on the Chinese commercial name of the policy and riders.

    REQUIRED ANALYSIS:
    1. Infer coverage scope from policy names.
    2. Calculate estimated claimable amounts based on Taiwan's standard insurance logic for these plan names.
    3. Deduct 'retainedAmount' if the specific policy type requires it.
    4. Provide specific advice.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { 
      parts: [
        { text: prompt },
        ...event.evidenceFiles.map(b => ({ inlineData: { mimeType: "image/jpeg", data: b.split(',')[1] } }))
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
                status: { type: Type.STRING },
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

  return JSON.parse(response.text || "{}") as EstimationResult;
};
