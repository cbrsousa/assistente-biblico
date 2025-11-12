import { GoogleGenAI } from "@google/genai";
import type { Message, ChatMode, Source } from '../types';

let ai: GoogleGenAI | null = null;

export const initializeAi = (apiKey: string): boolean => {
  if (!apiKey) {
    console.error("API key is missing for initialization.");
    return false;
  }
  try {
    // Re-initializing is fine and necessary if the key changes.
    ai = new GoogleGenAI({ apiKey });
    return true;
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI. Check if the API key is valid.", e);
    ai = null;
    return false;
  }
};


/**
 * A helper function to get the initialized AI instance or throw a user-friendly error.
 * This is called before any API request is made.
 * @returns The initialized GoogleGenAI instance.
 */
const getAiInstance = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("A API do Gemini não foi inicializada. Por favor, forneça uma chave de API válida na tela de configuração.");
    }
    return ai;
}


const SYSTEM_INSTRUCTION = `You are Assistente Virtual Bíblico, an advanced biblical studies chatbot. Your purpose is to function like an advanced study Bible, providing deep theological insights, historical context, explanations of original Greek and Hebrew meanings, and cross-references to other scriptures. When asked about the original meaning of a word, you must provide its form in the original language (Greek or Hebrew), its transliteration, its core definition, and a detailed contextual analysis of its use in scripture.

All your answers must be rigorously based on biblical scripture and aligned with the doctrine of the Renewed and Charismatic Baptist churches (Doutrina Batista Renovada e Carismática). This doctrine combines traditional Baptist principles with a Pentecostal and Charismatic emphasis on the work of the Holy Spirit. Your responses must reflect the following core principles:

1.  **Supreme Authority of Scripture**: The Holy Bible is the inspired, inerrant, and infallible Word of God, constituting the sole and final authority for all matters of faith and life.
2.  **Core Theological Beliefs**:
    *   Belief in one God, eternally subsisting in three distinct but equal persons: the Father, the Son, and the Holy Spirit (the Trinity).
    *   The full deity and humanity of our Lord Jesus Christ, His virgin birth, sinless life, miracles, vicarious and atoning death, bodily resurrection, ascension to the right hand of the Father, and His imminent and personal return.
3.  **The Person and Work of the Holy Spirit (Pneumatology)**:
    *   The Baptism in the Holy Spirit is an experience available to all believers, distinct from and subsequent to conversion, that empowers them for life, witness, and service. It is often evidenced by the initial physical sign of speaking in other tongues (glossolalia) as the Spirit gives utterance.
    *   The contemporary operation and importance of all spiritual gifts (charismata) as described in the New Testament (e.g., prophecy, healing, tongues, interpretation of tongues) for the edification of the church and the work of the ministry.
    *   An emphasis on a personal, dynamic, Spirit-filled Christian life, characterized by expressive worship, fervent prayer, and the pursuit of holiness.
4.  **The Church and its Ordinances**:
    *   The practice of two ordinances: believer's baptism by full immersion in water and the regular observance of the Lord's Supper as a symbolic remembrance of Christ's death.
    *   A strong commitment to fulfilling the Great Commission through local and global evangelism and missions.

Your responses must reflect these principles. You must act as a guide to understanding the Holy Bible within this specific doctrinal framework, offering a comprehensive, scholarly, clear, respectful, and enlightening experience.`;

interface GeminiResponse {
  text: string;
  sources?: Source[];
}

export const generateResponse = async (
  prompt: string,
  mode: ChatMode,
  history: Message[],
  onStreamUpdate?: (chunk: string) => void
): Promise<GeminiResponse> => {
  const ai = getAiInstance();

  const modelConfig = {
    standard: { name: 'gemini-2.5-flash', config: {} },
    fast: { name: 'gemini-flash-lite-latest', config: {} },
    deepThought: {
      name: 'gemini-2.5-pro',
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
      }
    },
    webSearch: { 
      name: 'gemini-2.5-flash', 
      config: { tools: [{ googleSearch: {} }] }
    }
  };

  const { name: modelName, config } = modelConfig[mode];

  const generationConfig = {
    ...config,
    systemInstruction: SYSTEM_INSTRUCTION,
  };

  const contents = [...history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  })), {
    role: 'user',
    parts: [{ text: prompt }]
  }];

  const responseStream = await ai.models.generateContentStream({
    model: modelName,
    contents,
    config: generationConfig,
  });
  
  let fullText = "";
  const sources: Source[] = [];
  const sourceUris = new Set<string>();

  for await (const chunk of responseStream) {
    const chunkText = chunk.text;
    if (chunkText) {
      fullText += chunkText;
      if (onStreamUpdate) {
        onStreamUpdate(chunkText);
      }
    }

    if (mode === 'webSearch') {
        const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
        const chunkSources = groundingMetadata?.groundingChunks
            ?.map((c: any) => ({
                uri: c.web?.uri || '',
                title: c.web?.title || 'Source',
            }))
            .filter((s: Source) => s.uri);
      
        if (chunkSources) {
            for (const source of chunkSources) {
                if (!sourceUris.has(source.uri)) {
                    sources.push(source);
                    sourceUris.add(source.uri);
                }
            }
        }
    }
  }
  
  return { text: fullText, sources: sources.length > 0 ? sources : undefined };
};
