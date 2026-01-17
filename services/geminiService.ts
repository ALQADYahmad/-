
import { GoogleGenAI, Type } from "@google/genai";
import { VehicleRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * تحليل ذكي سريع جداً للبيانات العامة
 */
export const getAIAnalysis = async (records: VehicleRecord[], query: string) => {
  try {
    const context = JSON.stringify(records.slice(0, 50).map(r => ({
      owner: r.ownerName,
      plate: r.plateNumber,
      status: r.status,
      type: r.vehicleType
    })));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: `بناءً على سجلات المرور التالية: ${context}. أجب على السؤال التالي باختصار شديد: ${query}` }]
      },
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "لم أتمكن من استخراج إجابة دقيقة.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "عذراً، حدث خطأ في الاتصال بنظام التحليل الذكي.";
  }
};

/**
 * استخراج بيانات البيان الجمركي
 */
export const analyzeCustomsStatement = async (images: string[]) => {
  try {
    const parts = images.map(img => {
      const base64Data = img.includes(',') ? img.split(',')[1] : img;
      return {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...parts,
          { text: "EXTRACT DATA AS JSON ONLY. Fields: statementNumber, plateNumber, ownerName, importerName, date, entity, brand, model, chassisNumber, engineNumber, manufactureYear, color, weight, fuelType, fullText." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statementNumber: { type: Type.STRING },
            plateNumber: { type: Type.STRING },
            ownerName: { type: Type.STRING },
            importerName: { type: Type.STRING },
            date: { type: Type.STRING },
            entity: { type: Type.STRING },
            brand: { type: Type.STRING },
            model: { type: Type.STRING },
            chassisNumber: { type: Type.STRING },
            engineNumber: { type: Type.STRING },
            manufactureYear: { type: Type.STRING },
            color: { type: Type.STRING },
            weight: { type: Type.STRING },
            fuelType: { type: Type.STRING },
            fullText: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Multi-Image OCR Error:", error);
    return { fullText: "خطأ في معالجة الوثيقة" };
  }
};

/**
 * تحليل الهوية الوطنية للمالك (تطوير خاص لليمن بناءً على النموذج المرفق)
 */
export const analyzeNationalIdCard = async (base64Image: string) => {
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: `EXTRACT YEMENI ID DATA AS JSON. 
            SPECIAL INSTRUCTIONS:
            1. 'idIssuePlace' (مكان الإصدار): Look at the TOP LEFT corner of the card, usually above the text 'بطاقة شخصية'.
            2. 'idType' (نوع الهوية): Identify the document type (e.g., 'بطاقة شخصية').
            3. 'name' (الاسم الكامل): Extract the full name.
            4. 'idNumber' (الرقم الوطني): Extract the 10-digit national number.
            5. 'dob' (تاريخ الميلاد): Extract the date in YYYY/MM/DD format.
            6. 'province' (المحافظة) and 'directorate' (المديرية): Extract from the bottom section (e.g., تعز - شرعب السلام).
            7. 'bloodType' (فصيلة الدم): Extract if present (e.g., O-).
            RETURN JSON ONLY.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            idNumber: { type: Type.STRING },
            idType: { type: Type.STRING },
            dob: { type: Type.STRING },
            province: { type: Type.STRING },
            directorate: { type: Type.STRING },
            idIssuePlace: { type: Type.STRING },
            bloodType: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) { 
    console.error("ID Analysis Error:", error);
    return {}; 
  }
};

/**
 * تحليل هوية الشاهد/المعرف واستنتاج صلة القرابة
 */
export const analyzeWitnessIdCard = async (base64Image: string, ownerName: string = "") => {
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: `EXTRACT WITNESS DATA. 
            1. Extract 'name' and 'idNumber'.
            2. Compare extracted witness name with owner name: "${ownerName}".
            3. Based on name overlap (father's name, grandfather's name, family name), determine 'relation'.
            4. Relation MUST be one of: (أب، أخ، ابن عم، ابن أخ، جد، عم).
            5. IF NO RELATION is found through name similarity, set 'relation' to 'معرف'.
            RETURN JSON ONLY with keys: name, idNumber, relation.` }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            idNumber: { type: Type.STRING },
            relation: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { 
    console.error("Witness AI Error:", error);
    return { relation: 'معرف' }; 
  }
};
