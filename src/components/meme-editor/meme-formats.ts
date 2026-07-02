import type { Element, TextEl } from "./types";
import { nid } from "./constants";

// Catalogue curé de formats de mèmes CULTES et reconnaissables.
// Chaque zone porte un "role" = ce que l'IA doit y écrire selon la mécanique
// comique du format (humorRule). Les rects sont en % de l'image (0-100), donc
// exacts quelle que soit la taille réelle chargée.

export type ZoneStyle = "caption" | "label" | "dark";
// caption : gros texte Impact MAJUSCULES blanc + contour noir (sur photo)
// label   : texte noir sans contour (sur zone claire : Drake, boutons, pancartes)
// dark    : texte blanc + contour, plus petit (étiquette sur photo chargée)

export type ZoneSize = "sm" | "md" | "lg";

export type MemeZone = {
  id: string;
  label: string; // libellé court pour l'UI
  role: string; // instruction pour l'IA : quoi écrire ici
  rect: { x: number; y: number; w: number; h: number };
  style: ZoneStyle;
  size?: ZoneSize;
  align?: "left" | "center" | "right";
};

export type MemeFormat = {
  id: string;
  name: string;
  imageUrl: string;
  humorRule: string; // la mécanique comique, envoyée à l'IA
  zones: MemeZone[];
  tags: string[];
  example?: Record<string, string>; // exemple de remplissage (few-shot)
};

const img = (id: string) => `https://i.imgflip.com/${id}.jpg`;

export const MEME_FORMATS: MemeFormat[] = [
  {
    id: "drake",
    name: "Drake (Non / Oui)",
    imageUrl: img("30b1gx"),
    humorRule: "Deux panneaux. En haut Drake REFUSE avec dédain (option nulle/ringarde), en bas il APPROUVE (option préférée/maligne). Le contraste doit être drôle et surprenant.",
    zones: [
      { id: "reject", label: "Rejette (haut)", role: "Ce que le sujet REJETTE avec dédain (l'option nulle ou évidente)", rect: { x: 51, y: 6, w: 46, h: 38 }, style: "label", size: "md", align: "center" },
      { id: "prefer", label: "Préfère (bas)", role: "Ce que le sujet PRÉFÈRE (l'option maligne, paresseuse ou absurde)", rect: { x: 51, y: 54, w: 46, h: 38 }, style: "label", size: "md", align: "center" },
    ],
    tags: ["choix", "préférence", "opinion"],
    example: { reject: "Réviser une semaine avant", prefer: "Tout réviser la veille à 3h" },
  },
  {
    id: "two-buttons",
    name: "Deux boutons",
    imageUrl: img("1g8my4"),
    humorRule: "Un personnage transpire devant deux boutons = deux choix contradictoires ou également tentants qu'il n'arrive pas à départager. L'humour vient de la difficulté absurde du dilemme.",
    zones: [
      { id: "button1", label: "Bouton 1", role: "Premier choix tentant", rect: { x: 4, y: 4, w: 44, h: 12 }, style: "label", size: "sm", align: "center" },
      { id: "button2", label: "Bouton 2", role: "Deuxième choix contradictoire, aussi tentant", rect: { x: 36, y: 15, w: 46, h: 12 }, style: "label", size: "sm", align: "center" },
    ],
    tags: ["dilemme", "choix", "hésitation"],
    example: { button1: "Dormir 8h", button2: "Finir la série cette nuit" },
  },
  {
    id: "distracted-boyfriend",
    name: "Le copain distrait",
    imageUrl: img("1ur9b0"),
    humorRule: "Un homme (le sujet) délaisse sa copine pour reluquer une autre femme (la tentation). Trois étiquettes posées sur les personnes.",
    zones: [
      { id: "boyfriend", label: "Le mec", role: "Le sujet (celui qui se laisse distraire)", rect: { x: 50, y: 70, w: 24, h: 10 }, style: "dark", size: "sm", align: "center" },
      { id: "girlfriend", label: "La copine", role: "Ce qu'il DEVRAIT choisir (délaissé, raisonnable)", rect: { x: 76, y: 40, w: 22, h: 10 }, style: "dark", size: "sm", align: "center" },
      { id: "other", label: "La tentation", role: "La tentation qui le détourne", rect: { x: 10, y: 58, w: 26, h: 10 }, style: "dark", size: "sm", align: "center" },
    ],
    tags: ["tentation", "distraction", "préférence"],
    example: { boyfriend: "Moi", girlfriend: "Mon projet à rendre", other: "Une nouvelle idée de projet" },
  },
  {
    id: "expanding-brain",
    name: "Cerveau qui grandit",
    imageUrl: img("1jwhww"),
    humorRule: "Quatre niveaux de bas en haut : l'idée devient de plus en plus 'évoluée', mais de façon ironique/absurde (le dernier niveau est le plus ridicule ou faussement génial). Escalade comique.",
    zones: [
      { id: "l1", label: "Niveau 1", role: "Approche basique/normale", rect: { x: 2, y: 3, w: 47, h: 19 }, style: "label", size: "sm", align: "center" },
      { id: "l2", label: "Niveau 2", role: "Un cran au-dessus", rect: { x: 2, y: 28, w: 47, h: 19 }, style: "label", size: "sm", align: "center" },
      { id: "l3", label: "Niveau 3", role: "Encore plus 'malin'", rect: { x: 2, y: 53, w: 47, h: 19 }, style: "label", size: "sm", align: "center" },
      { id: "l4", label: "Niveau 4", role: "Le niveau galaxy-brain, absurde ou faussement génial", rect: { x: 2, y: 78, w: 47, h: 19 }, style: "label", size: "sm", align: "center" },
    ],
    tags: ["escalade", "évolution", "absurde"],
    example: { l1: "Boire de l'eau", l2: "Boire de l'eau filtrée", l3: "Boire de l'eau de source", l4: "Absorber l'humidité de l'air par la pensée" },
  },
  {
    id: "change-my-mind",
    name: "Change mon avis",
    imageUrl: img("24y43o"),
    humorRule: "Un homme assis à une table avec une pancarte affiche une opinion clivante ou absurde qu'il assume totalement, façon 'prouve-moi le contraire'.",
    zones: [{ id: "opinion", label: "La pancarte", role: "Une opinion clivante, drôle ou absurde assumée à fond", rect: { x: 30, y: 62, w: 46, h: 22 }, style: "label", size: "sm", align: "center" }],
    tags: ["opinion", "débat", "hot take"],
    example: { opinion: "Le pain au chocolat froid, c'est meilleur" },
  },
  {
    id: "left-exit-12",
    name: "Sortie d'autoroute",
    imageUrl: img("22bdq6"),
    humorRule: "Une voiture déboîte violemment vers une sortie au dernier moment : le sujet ignore le choix raisonnable (tout droit) pour foncer vers le choix chaotique (la sortie).",
    zones: [
      { id: "straight", label: "Tout droit", role: "Le choix raisonnable, ignoré", rect: { x: 8, y: 3, w: 28, h: 13 }, style: "caption", size: "sm", align: "center" },
      { id: "exit", label: "La sortie", role: "Le choix chaotique pris à la dernière seconde", rect: { x: 44, y: 3, w: 32, h: 13 }, style: "caption", size: "sm", align: "center" },
      { id: "car", label: "La voiture", role: "Le sujet qui fait le choix chaotique", rect: { x: 50, y: 68, w: 42, h: 12 }, style: "caption", size: "sm", align: "center" },
    ],
    tags: ["choix", "chaos", "impulsif"],
    example: { straight: "Dormir tôt", exit: "Regarder une dernière vidéo", car: "Mon cerveau à minuit" },
  },
  {
    id: "uno-draw-25",
    name: "UNO +25 cartes",
    imageUrl: img("3lmzyx"),
    humorRule: "Au UNO, on peut faire une action simple OU piocher 25 cartes. Le sujet préfère la souffrance (piocher) plutôt que faire l'action simple demandée.",
    zones: [
      { id: "card", label: "La carte", role: "L'action simple demandée (que le sujet refuse de faire)", rect: { x: 3, y: 2, w: 45, h: 30 }, style: "label", size: "sm", align: "center" },
      { id: "person", label: "Le joueur", role: "Le sujet qui préfère souffrir plutôt que faire l'action", rect: { x: 53, y: 74, w: 44, h: 12 }, style: "dark", size: "sm", align: "center" },
    ],
    tags: ["évitement", "flemme", "déni"],
    example: { card: "Réponds à ce message ou pioche 25", person: "Moi" },
  },
  {
    id: "woman-yelling-cat",
    name: "La femme et le chat",
    imageUrl: img("345v97"),
    humorRule: "À gauche une femme accuse/s'énerve, à droite un chat blasé répond quelque chose de totalement déconnecté ou je-m'en-foutiste.",
    zones: [
      { id: "woman", label: "La femme", role: "L'accusation ou le reproche véhément", rect: { x: 2, y: 70, w: 47, h: 24 }, style: "caption", size: "sm", align: "center" },
      { id: "cat", label: "Le chat", role: "La réponse blasée, déconnectée ou insolente", rect: { x: 52, y: 70, w: 46, h: 24 }, style: "caption", size: "sm", align: "center" },
    ],
    tags: ["dispute", "clash", "blasé"],
    example: { woman: "Tu avais dit 5 minutes il y a 2h", cat: "Et pourtant me revoilà" },
  },
  {
    id: "is-this-a-pigeon",
    name: "C'est ça, un... ?",
    imageUrl: img("1o00in"),
    humorRule: "Un personnage montre un papillon et le confond totalement avec autre chose. 'C'est ça, X ?' = une confusion évidente et ridicule.",
    zones: [
      { id: "person", label: "Le perso", role: "Le sujet qui se trompe complètement", rect: { x: 2, y: 36, w: 34, h: 10 }, style: "caption", size: "sm", align: "center" },
      { id: "thing", label: "Le papillon", role: "La chose réelle, mal identifiée", rect: { x: 58, y: 16, w: 34, h: 10 }, style: "caption", size: "sm", align: "center" },
      { id: "question", label: "La question", role: "La fausse conclusion : « C'est ça, ... ? »", rect: { x: 10, y: 82, w: 76, h: 13 }, style: "caption", size: "sm", align: "center" },
    ],
    tags: ["confusion", "malentendu"],
    example: { person: "Moi après 1 tuto", thing: "Une ligne de code copiée", question: "C'est ça, être développeur ?" },
  },
  {
    id: "batman-slap",
    name: "Batman gifle Robin",
    imageUrl: img("9ehk"),
    humorRule: "Robin dit une bêtise naïve, Batman le gifle en le coupant net avec une réplique cinglante.",
    zones: [
      { id: "robin", label: "Robin", role: "Le propos naïf ou agaçant de Robin", rect: { x: 5, y: 4, w: 42, h: 24 }, style: "caption", size: "sm", align: "center" },
      { id: "batman", label: "Batman", role: "La réplique cinglante de Batman qui le coupe", rect: { x: 52, y: 4, w: 44, h: 24 }, style: "caption", size: "sm", align: "center" },
    ],
    tags: ["clash", "coupé net", "réplique"],
    example: { robin: "Je vais m'y mettre demain,", batman: "Tu as dit ça hier" },
  },
  {
    id: "gru-plan",
    name: "Le plan de Gru",
    imageUrl: img("26jxvz"),
    humorRule: "Gru présente un plan en 4 tableaux. Les 3 premiers vont bien, mais le 3e révèle une conséquence ratée — et Gru la relit, choqué (le 4e tableau = même texte que le 3e).",
    zones: [
      { id: "step1", label: "Étape 1", role: "Première étape du plan (raisonnable)", rect: { x: 5, y: 3, w: 43, h: 18 }, style: "label", size: "sm", align: "center" },
      { id: "step2", label: "Étape 2", role: "Deuxième étape du plan", rect: { x: 52, y: 3, w: 43, h: 18 }, style: "label", size: "sm", align: "center" },
      { id: "step3", label: "Étape 3 (le twist)", role: "La conséquence ratée inattendue (répétée au dernier tableau)", rect: { x: 5, y: 52, w: 43, h: 18 }, style: "label", size: "sm", align: "center" },
    ],
    tags: ["plan", "twist", "conséquence"],
    example: { step1: "Poster un meme", step2: "Attendre les likes", step3: "Personne ne réagit" },
  },
  {
    id: "one-does-not-simply",
    name: "On ne peut pas juste...",
    imageUrl: img("1bij"),
    humorRule: "Boromir explique gravement qu'on ne peut pas 'simplement' faire une chose pourtant banale. Format classique haut/bas.",
    zones: [
      { id: "top", label: "Haut", role: "Début : « On ne peut pas simplement... »", rect: { x: 4, y: 3, w: 92, h: 20 }, style: "caption", size: "md", align: "center" },
      { id: "bottom", label: "Bas", role: "La chute : la chose banale présentée comme impossible", rect: { x: 4, y: 76, w: 92, h: 20 }, style: "caption", size: "md", align: "center" },
    ],
    tags: ["classique", "haut/bas", "galère"],
    example: { top: "On ne peut pas simplement", bottom: "fermer un onglet sans en ouvrir trois" },
  },
  {
    id: "mocking-spongebob",
    name: "Bob l'éponge moqueur",
    imageUrl: img("1otk96"),
    humorRule: "Une phrase normale en haut, la même répétée en bas en MoCkErIe (alternance de casse) pour se moquer de quelqu'un.",
    zones: [
      { id: "normal", label: "Haut (normal)", role: "La phrase de départ, dite normalement", rect: { x: 3, y: 3, w: 94, h: 16 }, style: "caption", size: "sm", align: "center" },
      { id: "mock", label: "Bas (moqueur)", role: "La même idée, en ton moqueur (le rendu alternera la casse)", rect: { x: 3, y: 80, w: 94, h: 16 }, style: "caption", size: "sm", align: "center" },
    ],
    tags: ["moquerie", "sarcasme"],
    example: { normal: "Je maîtrise totalement mon temps", mock: "je maîtrise totalement mon temps" },
  },
  {
    id: "waiting-skeleton",
    name: "Squelette qui attend",
    imageUrl: img("2fm6x"),
    humorRule: "Un squelette attend depuis une éternité = l'attente interminable de quelque chose qui n'arrive jamais. Format haut/bas.",
    zones: [
      { id: "top", label: "Haut", role: "Ce qu'on attend (le contexte)", rect: { x: 4, y: 3, w: 92, h: 18 }, style: "caption", size: "md", align: "center" },
      { id: "bottom", label: "Bas", role: "La précision qui montre que ça n'arrivera jamais", rect: { x: 4, y: 78, w: 92, h: 18 }, style: "caption", size: "md", align: "center" },
    ],
    tags: ["attente", "jamais", "patience"],
    example: { top: "Moi attendant", bottom: "une réponse au « je te rappelle »" },
  },
];

export const MEME_FORMATS_BY_ID = new Map(MEME_FORMATS.map((format) => [format.id, format]));

const SIZE_FACTOR: Record<ZoneSize, number> = { sm: 0.05, md: 0.062, lg: 0.08 };

function mockingCase(text: string) {
  let upper = false;
  return Array.from(text)
    .map((char) => {
      if (!/[a-zàâçéèêëîïôûùüÿñæœ]/i.test(char)) return char;
      upper = !upper;
      return upper ? char.toUpperCase() : char.toLowerCase();
    })
    .join("");
}

/** Transforme le texte d'une zone comme il apparaîtra (MAJUSCULES caption, MoCkErIe). */
export function displayZoneText(zone: MemeZone, rawText: string) {
  if (zone.id === "mock") return mockingCase(rawText);
  if (zone.style === "caption" || zone.style === "dark") return rawText.toUpperCase();
  return rawText;
}

// Largeur moyenne d'un caractère par rapport à la taille de police (Impact étroit ~0.5).
const CHAR_WIDTH_RATIO = 0.52;
const LINE_HEIGHT = 1.02;

function estimateLineCount(text: string, fontSize: number, rectW: number) {
  const perLine = Math.max(1, Math.floor(rectW / (fontSize * CHAR_WIDTH_RATIO)));
  const words = text.split(/\s+/).filter(Boolean);
  let lines = 1;
  let lineLen = 0;
  for (const word of words) {
    if (lineLen === 0) lineLen = word.length;
    else if (lineLen + 1 + word.length <= perLine) lineLen += 1 + word.length;
    else {
      lines += 1;
      lineLen = word.length;
    }
  }
  return lines;
}

function longestWordWidth(text: string, fontSize: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const longest = words.reduce((max, word) => Math.max(max, word.length), 0);
  return longest * fontSize * CHAR_WIDTH_RATIO;
}

/** Réduit la police jusqu'à ce que le texte tienne (largeur + hauteur) dans la zone. */
function fitFontSize(text: string, rectW: number, rectH: number, maxFont: number) {
  let fontSize = Math.max(12, Math.round(maxFont));
  while (fontSize > 12) {
    const lines = estimateLineCount(text, fontSize, rectW);
    const totalHeight = lines * fontSize * LINE_HEIGHT;
    if (totalHeight <= rectH && longestWordWidth(text, fontSize) <= rectW) break;
    fontSize -= 1;
  }
  return fontSize;
}

function makeTextElement(zone: MemeZone, rawText: string, canvasW: number, canvasH: number, z: number): TextEl {
  const rectW = (zone.rect.w / 100) * canvasW;
  const rectH = (zone.rect.h / 100) * canvasH;
  const factor = SIZE_FACTOR[zone.size ?? "md"];
  const maxFont = Math.min(canvasH * factor, rectW * 0.22);
  const isCaption = zone.style === "caption" || zone.style === "dark";

  const text = displayZoneText(zone, rawText);
  const fontSize = fitFontSize(text, rectW, rectH, maxFont);

  return {
    id: nid(),
    type: "text",
    text,
    x: Math.round((zone.rect.x / 100) * canvasW),
    y: Math.round((zone.rect.y / 100) * canvasH),
    w: Math.round(rectW),
    h: Math.round(rectH),
    rotation: 0,
    z,
    fontFamily: isCaption ? "Impact" : "Arial",
    fontSize,
    // Contraste garanti : caption = blanc/contour noir ; label = noir/contour blanc.
    color: isCaption ? "#ffffff" : "#111111",
    bold: true,
    underline: false,
    align: zone.align ?? "center",
    bgColor: "transparent",
    bgPadding: 0,
    bgRadius: 0,
    letterSpacing: 0,
    lineHeight: LINE_HEIGHT,
    outlineColor: isCaption ? "#000000" : "#ffffff",
    outlineWidth: isCaption ? Math.max(2, Math.round(fontSize * 0.09)) : Math.max(1, Math.round(fontSize * 0.08)),
  };
}

/** Construit les éléments texte d'un format rempli (l'image est posée en fond via setImageAsPage). */
export function formatToElements(format: MemeFormat, fills: Record<string, string>, canvasW: number, canvasH: number): Element[] {
  return format.zones
    .map((zone, index) => {
      const value = (fills[zone.id] ?? "").trim();
      if (!value) return null;
      return makeTextElement(zone, value, canvasW, canvasH, index + 2);
    })
    .filter(Boolean) as Element[];
}
