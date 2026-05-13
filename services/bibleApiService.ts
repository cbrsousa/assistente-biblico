
/**
 * bibleApiService.ts
 * Servico para interacao com APIs biblicas gratuitas.
 */

// URL base para a API Bible-api.com (Gratuita, sem chave, versao Almeida)
const BIBLE_API_URL = 'https://bible-api.com/';

// URL base para A Biblia Digital (Requer token)
const A_BIBLIA_DIGITAL_URL = 'https://www.abibliadigital.com.br/api/';

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
    const response = await fetch(`${BIBLE_API_URL}${encodeURIComponent(reference)}?translation=almeida`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.verses) {
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

/**
 * Exemplo de busca na A Biblia Digital (Requer token no .env)
 * Para usar: VITE_BIBLE_TOKEN=seu_token_aqui
 */
export const fetchVerseFromABibliaDigital = async (version: string, book: string, chapter: number, verse?: number): Promise<any> => {
  const token = import.meta.env.VITE_BIBLE_TOKEN;
  if (!token) {
    console.warn('Token da A Biblia Digital nao configurado.');
    return null;
  }

  const endpoint = verse 
    ? `${A_BIBLIA_DIGITAL_URL}verses/${version}/${book}/${chapter}/${verse}`
    : `${A_BIBLIA_DIGITAL_URL}verses/${version}/${book}/${chapter}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar na A Biblia Digital:', error);
    return null;
  }
};
