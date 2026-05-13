import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { Message, ChatMode, Source } from '../types';

let ai: GoogleGenAI | null = null;

export const initializeAi = (apiKey: string): boolean => {
  if (!apiKey) {
    console.error("Chave de API ausente para inicialização.");
    return false;
  }
  try {
    // Re-initializing is fine and necessary if the key changes.
    ai = new GoogleGenAI({ apiKey });
    return true;
  } catch (e) {
    console.error("Falha ao inicializar GoogleGenAI. Verifique se a chave de API é válida.", e);
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
        throw new Error("A API do Gemini não foi inicializada. Por favor, forneça uma chave de API válida nas configurações ou ambiente.");
    }
    return ai;
}


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

export const generateResponse = async (
  prompt: string,
  mode: ChatMode,
  history: Message[],
  onStreamUpdate?: (chunk: string) => void
): Promise<GeminiResponse> => {
  const ai = getAiInstance();

  const modelConfig = {
    standard: { name: 'gemini-3-flash-preview', config: {} },
    fast: { name: 'gemini-3.1-flash-lite', config: {} },
    deepThought: {
      name: 'gemini-3-flash-preview',
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      }
    },
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

  }
  
  return { text: fullText, sources: sources.length > 0 ? sources : undefined };
};
