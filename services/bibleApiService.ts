/**
 * bibleApiService.ts
 * Servico para interacao com APIs biblicas gratuitas.
 */

// URL base para a API Bible-api.com (Gratuita, sem chave, versao Almeida)
const BIBLE_API_URL = 'https://bible-api.com/';

/**
 * Interface para representar um versiculo retornado pela API.
 */
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Busca um versiculo ou passagem usando a Bible-api.com (Sem necessidade de Token)
 * Versao default: almeida (Portugues)
 */
export const fetchVerseFromBibleApi = async (reference: string): Promise<BibleVerse[] | null> => {
  try {
    // Tenta primeiro com Almeida (Ferreira Almeida)
    let response = await fetch(`${BIBLE_API_URL}${encodeURIComponent(reference)}?translation=almeida`);
    
    // Se falhar ou nao encontrar, tenta sem especificar versao
    if (!response.ok) {
       response = await fetch(`${BIBLE_API_URL}${encodeURIComponent(reference)}`);
    }

    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.verses && data.verses.length > 0) {
      return data.verses.map((v: any) => ({
        book: data.reference.split(' ')[0],
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim(),
      }));
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar na Bible API:', error);
    return null;
  }
};
