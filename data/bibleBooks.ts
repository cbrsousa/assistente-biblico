export const oldTestamentChronological: string[] = [
  'Jó',
  'Gênesis',
  'Êxodo',
  'Levítico',
  'Números',
  'Deuteronômio',
  'Josué',
  'Juízes',
  'Rute',
  '1 Samuel',
  '2 Samuel',
  'Salmos',
  'Cantares de Salomão',
  'Provérbios',
  'Eclesiastes',
  '1 Reis',
  '2 Reis',
  'Jonas',
  'Oseias',
  'Amós',
  'Joel',
  'Miqueias',
  'Isaías',
  'Naum',
  'Sofonias',
  'Habacuque',
  'Jeremias',
  'Lamentações',
  'Ezequiel',
  'Obadias',
  'Daniel',
  'Esdras',
  'Ageu',
  'Zacarias',
  'Ester',
  'Neemias',
  '1 Crônicas',
  '2 Crônicas',
  'Malaquias',
];

export const newTestamentChronological: string[] = [
  'Tiago',
  'Gálatas',
  'Marcos',
  'Mateus',
  '1 Tessalonicenses',
  '2 Tessalonicenses',
  '1 Coríntios',
  '2 Coríntios',
  'Romanos',
  'Lucas',
  'Atos',
  'Efésios',
  'Filipenses',
  'Colossenses',
  'Filemom',
  '1 Timóteo',
  'Tito',
  '1 Pedro',
  '2 Timóteo',
  '2 Pedro',
  'Hebreus',
  'Judas',
  'João',
  '1 João',
  '2 João',
  '3 João',
  'Apocalipse',
];

export const bibleBookChapters: { [book: string]: number } = {
    // Antigo Testamento
    'Gênesis': 50, 'Êxodo': 40, 'Levítico': 27, 'Números': 36, 'Deuteronômio': 34,
    'Josué': 24, 'Juízes': 21, 'Rute': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Reis': 22,
    '2 Reis': 25, '1 Crônicas': 29, '2 Crônicas': 36, 'Esdras': 10, 'Neemias': 13,
    'Ester': 10, 'Jó': 42, 'Salmos': 150, 'Provérbios': 31, 'Eclesiastes': 12,
    'Cantares de Salomão': 8, 'Isaías': 66, 'Jeremias': 52, 'Lamentações': 5,
    'Ezequiel': 48, 'Daniel': 12, 'Oseias': 14, 'Joel': 3, 'Amós': 9, 'Obadias': 1,
    'Jonas': 4, 'Miqueias': 7, 'Naum': 3, 'Habacuque': 3, 'Sofonias': 3, 'Ageu': 2,
    'Zacarias': 14, 'Malaquias': 4,
    // Novo Testamento
    'Mateus': 28, 'Marcos': 16, 'Lucas': 24, 'João': 21, 'Atos': 28, 'Romanos': 16,
    '1 Coríntios': 16, '2 Coríntios': 13, 'Gálatas': 6, 'Efésios': 6, 'Filipenses': 4,
    'Colossenses': 4, '1 Tessalonicenses': 5, '2 Tessalonicenses': 3, '1 Timóteo': 6,
    '2 Timóteo': 4, 'Tito': 3, 'Filemom': 1, 'Hebreus': 13, 'Tiago': 5, '1 Pedro': 5,
    '2 Pedro': 3, '1 João': 5, '2 João': 1, '3 João': 1, 'Judas': 1, 'Apocalipse': 22,
};

// Generate a list of book names for regex matching, including common names without numbers.
const baseBookNames = Object.keys(bibleBookChapters).map(k => k.replace(/^[1-3]\s/, ''));

const allBookNamesAndAliases = [
    ...baseBookNames,
    'Salmo', // for Salmos
    'Cânticos', // for Cantares de Salomão
    'Cantares', // for Cantares de Salomão
];

// Remove duplicates and sort by length descending to ensure longer names
// (e.g., "Cantares de Salomão") are matched before shorter ones ("Cantares").
// This prevents the regex from prematurely matching a shorter prefix.
export const bibleBookRegexList = [...new Set(allBookNamesAndAliases)]
    .sort((a, b) => b.length - a.length);
