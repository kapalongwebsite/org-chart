// Helvetica advance widths (1/1000 em) for the WinAnsi characters that jsPDF
// renders with its built-in standard fonts. The values are jsPDF's own
// metrics, so wrapped lines match how svg2pdf measures and centres the text.
// Characters outside this set have no glyph in the non-embedded PDF fonts.

const CODES = [];
for (let code = 0x20; code <= 0x7e; code += 1) CODES.push(code);
for (let code = 0xa0; code <= 0xff; code += 1) CODES.push(code);
CODES.push(0x20ac, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030, 0x160, 0x2039, 0x152, 0x17d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x17e, 0x178);

const WIDTHS = {
  normal: [280,280,350,550,550,890,660,190,330,330,390,580,280,330,280,280,550,550,550,550,550,550,550,550,550,550,280,280,580,580,580,550,1010,660,660,720,720,660,610,780,720,280,500,660,550,830,720,780,660,780,720,660,610,720,660,940,660,660,610,280,280,280,470,550,330,550,550,500,550,550,280,550,550,220,220,500,220,830,550,550,550,550,330,500,280,550,500,720,500,500,500,330,260,330,580,530,330,550,550,550,550,530,550,330,730,370,550,580,530,730,330,400,580,530,530,330,550,530,280,330,530,360,550,530,530,530,610,660,660,660,660,660,660,1000,720,660,660,660,660,280,280,280,280,530,720,780,780,780,780,780,530,780,720,720,720,720,530,530,610,550,550,550,550,550,550,890,500,550,550,550,550,280,280,280,280,530,550,550,550,550,550,550,580,610,550,550,550,550,530,530,500,530,220,550,330,1000,550,550,330,1000,530,330,530,530,220,220,330,330,350,550,1000,330,1000,530,330,530,530,660],
  bold: [280,330,470,550,550,890,720,240,330,330,390,580,280,330,280,280,550,550,550,550,550,550,550,550,550,550,330,330,580,580,580,610,970,720,720,720,720,660,610,780,720,280,550,720,610,830,720,780,660,780,720,660,610,720,660,940,660,660,610,330,280,330,580,550,330,550,610,550,610,550,330,610,610,280,280,550,280,890,610,610,610,610,390,550,330,610,550,780,550,550,500,390,280,390,580,560,330,550,550,550,550,560,550,330,730,370,550,580,560,730,330,400,580,560,560,330,610,550,280,330,560,360,550,560,560,560,610,720,720,720,720,720,720,1000,720,660,660,660,660,280,280,280,280,560,720,780,780,780,780,780,560,780,720,720,720,720,560,560,610,550,550,550,550,550,550,890,550,550,550,550,550,280,280,280,280,560,610,610,610,610,610,610,580,610,610,610,610,610,560,560,550,560,280,550,500,1000,550,550,330,1000,560,330,560,560,280,280,500,500,350,550,1000,330,1000,560,330,560,560,660],
};

const INDEX = new Map(CODES.map((code, index) => [code, index]));
const FALLBACK_WIDTH = 560;

export function isPrintableCharacter(char) {
  return INDEX.has(char.codePointAt(0));
}

/* Characters the standard PDF fonts cannot draw (each reported once). */
export function unsupportedCharacters(text) {
  const found = new Set();
  for (const char of String(text ?? '')) {
    if (!INDEX.has(char.codePointAt(0))) found.add(char);
  }
  return [...found];
}

/* Width of text in the same unit as fontSize. */
export function measureText(text, fontSize, weight = 'normal') {
  const table = weight === 'bold' || Number(weight) >= 600 ? WIDTHS.bold : WIDTHS.normal;
  let units = 0;
  for (const char of String(text ?? '')) {
    const index = INDEX.get(char.codePointAt(0));
    units += index === undefined ? FALLBACK_WIDTH : table[index];
  }
  return (units / 1000) * fontSize;
}
