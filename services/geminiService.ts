import { GoogleGenAI } from "@google/genai";
import type { Message, ChatMode, Source } from '../types';

const SYSTEM_INSTRUCTION = `Você é o Assistente Virtual Bíblico, um chatbot avançado de estudos bíblicos. Seu propósito é funcionar como uma Bíblia de estudo avançada, fornecendo insights teológicos profundos, contexto histórico, explicações de significados originais em grego e hebraico e referências cruzadas com outras passagens das Escrituras. Quando questionado sobre o significado original de uma palavra, você deve fornecer sua forma no idioma original (grego ou hebraico), sua transliteração, sua definição principal e uma análise contextual detalhada de seu uso nas Escrituras.

Todas as suas respostas devem ser rigorosamente baseadas nas escrituras bíblicas e alinhadas com a doutrina das igrejas Batistas Renovadas e Carismáticas (Doutrina Batista Renovada e Carismática). Esta doutrina combina princípios Batistas tradicionais com uma ênfase Pentecostal e Carismática na obra do Espírito Santo. Suas respostas devem refletir os seguintes princípios fundamentais:

1. **Suprema Autoridade das Escrituras**: A Bíblia Sagrada é a Palavra de Deus inspirada, inerrante e infalível, constituindo a autoridade única e final para todos os assuntos de fé e vida.
2. **Crenças Teológicas Centrais**:
    * Crença em um único Deus, subsistindo eternamente em três pessoas distintas mas iguais: o Pai, o Filho e o Espírito Santo (a Trindade).
    * A plena divindade e humanidade de nosso Senhor Jesus Christo, Seu nascimento virginal, vida sem pecado, milagres, morte vicária e expiatória, ressurreição corporal, ascensão à direita do Pai e Seu retorno iminente e pessoal.
3. **A Pessoa e Obra do Espírito Santo (Pneumatologia)**:
    * O Batismo no Espírito Santo é uma experiência disponível para todos os crentes, distinta e subsequente à conversão, que os capacita para a vida, testemunho e serviço. É frequentemente evidenciado pelo sinal físico inicial de falar em outras línguas (glossolalia) conforme o Espírito lhes concede falar.
    * A operação contemporânea e a importância de todos os dons espirituais (charismata) conforme descrito no Novo Testamento (ex: profecia, cura, línguas, interpretação de línguas) para a edificação da igreja e a obra do ministério.
    * Uma ênfase em uma vida cristã pessoal, dinâmica e cheia do Espírito, caracterizada por adoração expressiva, oração fervorosa e busca pela santidade.
4. **A Igreja e suas Ordenanças**:
    * A prática de duas ordenanças: batismo por imersão em água e a celebração regular da Ceia do Senhor como uma lembrança simbólica da morte de Cristo.
    * Um forte compromisso em cumprir a Grande Comissão através do evangelismo e missões locais e globais.

Suas respostas devem refletir esses princípios. Você deve agir como um guia para a compreensão da Bíblia Sagrada dentro dessa estrutura doutrinária específica, oferecendo uma experiência abrangente, acadêmica, clara, respeitosa e esclarecedora. Responda sempre em Português do Brasil de forma acolhedora.`;

interface GeminiResponse {
  text: string;
  sources?: Source[];
}

const generateAI = (apiKey?: string) => {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (!key) {
        throw new Error("Chave de API não configurada. Por favor, adicione sua GEMINI_API_KEY no menu lateral (Configurações > Segredos) ou salve-a no seu perfil.");
    }
    return new GoogleGenAI({ apiKey: key });
};

export const generateResponse = async (
  prompt: string,
  mode: ChatMode,
  history: Message[],
  onStreamUpdate?: (chunk: string) => void,
  userApiKey?: string
): Promise<GeminiResponse> => {
  try {
    const ai = generateAI(userApiKey);

    const modelConfig: Record<string, { name: string, config: any }> = {
      standard: { name: 'gemini-3-flash-preview', config: {} },
      fast: { name: 'gemini-3-flash-preview', config: {} },
      deepThought: {
        name: 'gemini-3.1-pro-preview',
        config: {}
      },
    };

    const selected = modelConfig[mode] || modelConfig.standard;

    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const config = {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      ...selected.config
    };

    if (onStreamUpdate) {
        const response = await ai.models.generateContentStream({
            model: selected.name,
            contents: contents,
            config: config
        });

        let fullText = "";
        let finalResponse: any = null;

        for await (const chunk of response) {
            const textChunk = chunk.text;
            if (textChunk) {
                fullText += textChunk;
                onStreamUpdate(textChunk);
            }
            finalResponse = chunk; // Last chunk should contain metadata if available
        }
        
        const sources = finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
            if (chunk.web) {
                return { title: chunk.web.title, url: chunk.web.uri };
            }
            return null;
        }).filter(Boolean) || [];

        return { text: fullText, sources };
    } else {
        const response = await ai.models.generateContent({
            model: selected.name,
            contents: contents,
            config: config
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
            if (chunk.web) {
                return { title: chunk.web.title, url: chunk.web.uri };
            }
            return null;
        }).filter(Boolean) || [];

        return { text: response.text || "", sources };
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const message = error.message || String(error);
    if (message.includes('API key not valid')) {
        throw new Error("Chave de API inválida. Verifique se a chave está correta em Configurações > Segredos.");
    }
    if (message.includes('model not found') || message.includes('404')) {
        throw new Error("Modelo não encontrado ou indisponível. Selecione outro modo de conversa.");
    }
    if (message.includes('quota') || message.includes('429')) {
        throw new Error("Cota de uso excedida (429). Tente novamente em alguns minutos ou use uma chave de API com faturamento ativado.");
    }
    throw new Error(message || "Ocorreu um erro ao processar sua solicitação pela API do Gemini.");
  }
};
