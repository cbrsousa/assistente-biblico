import { GoogleGenAI, Modality } from "@google/genai";
import type { Message, ChatMode, Source } from '../types';

let ai: GoogleGenAI | null = null;

/**
 * Initializes and retrieves the GoogleGenAI instance.
 * Uses lazy initialization to ensure the API key is available.
 * @returns {GoogleGenAI} The initialized GoogleGenAI instance.
 * @throws {Error} If the API key is not configured or initialization fails.
 */
const getAi = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Erro: A chave da API do Gemini não está configurada. O administrador precisa definir a variável de ambiente API_KEY no servidor.");
    }
    
    try {
        const newAiInstance = new GoogleGenAI({ apiKey });
        ai = newAiInstance;
        return ai;
    } catch (error) {
        console.error("Falha ao inicializar o GoogleGenAI com a chave de API fornecida:", error);
        throw new Error("Falha ao inicializar a API do Gemini. Verifique se a chave de API é válida.");
    }
};


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
  imageUrl?: string;
}

export const generateResponse = async (
  prompt: string,
  mode: ChatMode,
  history: Message[],
  onStreamUpdate?: (chunk: string) => void
): Promise<GeminiResponse> => {
  const ai = getAi();

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
    },
    imageGeneration: {
        name: 'gemini-2.5-flash-image',
        config: { responseModalities: [Modality.IMAGE] }
    }
  };

  const { name: modelName, config } = modelConfig[mode];

  const generationConfig = {
    ...config,
    systemInstruction: SYSTEM_INSTRUCTION,
  };

  if (mode === 'imageGeneration') {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: generationConfig,
    });

    let text = '';
    let imageUrl = '';

    const parts = response.candidates?.[0]?.content?.parts;

    if (parts) {
      for (const part of parts) {
        if (part.text) {
          text += part.text;
        } else if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    // If after checking all parts we still don't have an image, the request failed.
    if (!imageUrl) {
      console.error("Image generation failed or did not return an image. API Response:", JSON.stringify(response, null, 2));
      throw new Error("Não foi possível gerar a imagem. A sua solicitação pode ter sido bloqueada por motivos de segurança ou a resposta não continha uma imagem. Por favor, tente uma descrição diferente.");
    }

    return { text: text || "Aqui está a imagem que você pediu.", imageUrl };
  }


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

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("A API não retornou dados de áudio.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Erro ao gerar a fala:", error);
    if (error instanceof Error) {
        throw new Error(`Falha na síntese de voz: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido durante a síntese de voz.");
  }
};