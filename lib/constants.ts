export const CATEGORIES = [
  {
    name: "Biology",
    code: "B",
  },
  {
    name: "Mathematics",
    code: "M",
  },
  {
    name: "Art",
    code: "A",
  },
  {
    name: "Commerce",
    code: "C",
  },
  {
    name: "Technology",
    code: "T",
  },
  {
    name: "OL",
    code: "O",
  },
] as const;

export const CATEGORY_CODES = {
  BIOLOGY: "B",
  MATHEMATICS: "M",
  ART: "A",
  COMMERCE: "C",
  TECHNOLOGY: "T",
  OL: "O",
} as const;
