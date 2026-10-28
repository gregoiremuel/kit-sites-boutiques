/* Les jeux de polices proposés. Choisi dans contenu.theme.polices. Fichiers dans public/fonts. */
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
  etabli: {
    description: 'Titres à empattements carrés très marqués (Zilla Slab), texte net (Work Sans). Ébéniste, menuisier, forgeron, atelier d’art.',
    titres: '"Zilla Slab",Georgia,serif',
    texte: '"Work Sans","Helvetica Neue",Arial,sans-serif',
    fichiers: [['Zilla Slab', 500, 'zilla-slab-latin-500-normal.woff2'], ['Zilla Slab', 700, 'zilla-slab-latin-700-normal.woff2'], ['Work Sans', 400, 'work-sans-latin-400-normal.woff2'], ['Work Sans', 600, 'work-sans-latin-600-normal.woff2']],
  },
  chantier: {
    description: 'Titres condensés et massifs (Barlow Condensed), texte lisible (Barlow). Plombier, électricien, serrurier, dépannage.',
    titres: '"Barlow Condensed","Arial Narrow",Arial,sans-serif',
    texte: '"Barlow","Helvetica Neue",Arial,sans-serif',
    fichiers: [['Barlow Condensed', 600, 'barlow-condensed-latin-600-normal.woff2'], ['Barlow Condensed', 700, 'barlow-condensed-latin-700-normal.woff2'], ['Barlow', 400, 'barlow-latin-400-normal.woff2'], ['Barlow', 600, 'barlow-latin-600-normal.woff2']],
  },
  table: {
    description: 'Titres à empattements doux et larges (Young Serif), texte rond (Figtree). Restaurant, bistrot, traiteur.',
    titres: '"Young Serif",Georgia,serif',
    texte: '"Figtree","Helvetica Neue",Arial,sans-serif',
    fichiers: [['Young Serif', 400, 'young-serif-latin-400-normal.woff2'], ['Figtree', 400, 'figtree-latin-400-normal.woff2'], ['Figtree', 600, 'figtree-latin-600-normal.woff2']],
  },
  serre: {
    description: 'Titres à empattements souples (Fraunces), texte rond (Nunito Sans). Fleuriste, pépiniériste, primeur.',
    titres: '"Fraunces",Georgia,serif',
    texte: '"Nunito Sans","Helvetica Neue",Arial,sans-serif',
    fichiers: [['Fraunces', 500, 'fraunces-latin-500-normal.woff2'], ['Fraunces', 600, 'fraunces-latin-600-normal.woff2'], ['Nunito Sans', 400, 'nunito-sans-latin-400-normal.woff2'], ['Nunito Sans', 600, 'nunito-sans-latin-600-normal.woff2']],
  },
};

/* CSS des polices : url(f) donne l'adresse d'un fichier ("/fonts/x.woff2" ou "data:…"). */
export function cssPolices(nom, url) {
  const P = POLICES[nom] || POLICES.classique;
  const faces = P.fichiers.map(([f, w, fichier]) => `@font-face{font-family:"${f}";font-style:normal;font-weight:${w};font-display:swap;src:url(${url(fichier)}) format("woff2")}`).join('\n');
  return `${faces}\n:root{--titres:${P.titres};--texte:${P.texte}}`;
}
