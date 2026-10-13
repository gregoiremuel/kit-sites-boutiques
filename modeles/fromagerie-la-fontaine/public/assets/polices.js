/* Les trois jeux de polices proposés. Choisi dans contenu.theme.polices. Fichiers dans public/fonts. */
export const POLICES = {
  classique: {
    description: 'Titres à empattements chaleureux (Vollkorn), texte net (Source Sans 3). Fromager, caviste, épicerie fine, librairie.',
    titres: '"Vollkorn",Georgia,"Times New Roman",serif',
    texte: '"Source Sans 3","Helvetica Neue",Arial,sans-serif',
    fichiers: [['Vollkorn', 500, 'vollkorn-latin-500-normal.woff2'], ['Vollkorn', 600, 'vollkorn-latin-600-normal.woff2'], ['Source Sans 3', 400, 'source-sans-3-latin-400-normal.woff2'], ['Source Sans 3', 600, 'source-sans-3-latin-600-normal.woff2']],
  },
  atelier: {
    description: 'Titres à empattements carrés, robustes (Bitter), texte net (Source Sans 3). Boulanger, cordonnier, encadreur, quincaillerie.',
    titres: '"Bitter",Georgia,serif',
    texte: '"Source Sans 3","Helvetica Neue",Arial,sans-serif',
    fichiers: [['Bitter', 500, 'bitter-latin-500-normal.woff2'], ['Bitter', 600, 'bitter-latin-600-normal.woff2'], ['Source Sans 3', 400, 'source-sans-3-latin-400-normal.woff2'], ['Source Sans 3', 600, 'source-sans-3-latin-600-normal.woff2']],
  },
  net: {
    description: 'Une seule famille sans empattements, sobre (Libre Franklin). Pressing, retoucherie, barbier, institut.',
    titres: '"Libre Franklin","Helvetica Neue",Arial,sans-serif',
    texte: '"Libre Franklin","Helvetica Neue",Arial,sans-serif',
    fichiers: [['Libre Franklin', 400, 'libre-franklin-latin-400-normal.woff2'], ['Libre Franklin', 600, 'libre-franklin-latin-600-normal.woff2']],
  },
};

/* CSS des polices : url(f) donne l'adresse d'un fichier ("/fonts/x.woff2" ou "data:…"). */
export function cssPolices(nom, url) {
  const P = POLICES[nom] || POLICES.classique;
  const faces = P.fichiers.map(([f, w, fichier]) => `@font-face{font-family:"${f}";font-style:normal;font-weight:${w};font-display:swap;src:url(${url(fichier)}) format("woff2")}`).join('\n');
  return `${faces}\n:root{--titres:${P.titres};--texte:${P.texte}}`;
}
