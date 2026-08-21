/**
 * Content for /personal — the page that is about Karan rather than the work.
 *
 * Kept apart from profile-data.ts on purpose: that file is the résumé and
 * this one is not, and mixing them is how a personal page starts sounding
 * like a cover letter.
 *
 * Anything with `draft: true` is skipped by the page. That is deliberate —
 * a half-written section should be invisible rather than published with
 * filler in it, because filler is the exact thing this page exists to
 * avoid. Fill a section in, drop the flag, and it appears. Individual
 * facts work the same way: a row with an empty value is not rendered.
 *
 * Section numbers are not stored here. They are counted off whatever is
 * actually on the page, so drafting a section out does not leave a hole
 * in the sequence.
 */

export type Fact = { k: string; v: string };

export type Pursuit = {
  id: string;
  title: string;
  lede: string;
  body: string[];
  facts: Fact[];
  photo?: { src: string; alt: string; caption?: string };
  draft?: boolean;
};

/* Annotated rather than `satisfies`, which would narrow each entry to its
   own literal and drop `photo` from the ones that do not have one yet. */
const pursuits: Pursuit[] = [
  {
    id: "table-tennis",
    title: "Table tennis",
    lede: "Two seasons for Georgia State. First at North Georgia Regionals.",
    body: [
      "I played NCTTA Division 1 for Georgia State in 2023 and 2024, and won North Georgia Regionals. I left college at 1900 USATT, which was about my peak.",
      "I still play, just not rated since. I play defensive — consistent, low risk, waiting for the opponent to make the first mistake, then capitalizing on it."
    ],
    facts: [
      { k: "School", v: "Georgia State University" },
      { k: "Seasons", v: "2023, 2024" },
      { k: "Division", v: "NCTTA Division 1" },
      { k: "Best result", v: "North Georgia Regionals — 1st place" },
      { k: "USATT rating", v: "1900 leaving college, and about my peak" },
      { k: "Since", v: "Still playing, unrated" },
      { k: "Style", v: "Defensive. Consistency over winners." },
      /* Still waiting on Karan: blade and rubbers. */
      { k: "Setup", v: "" }
    ]
  },
  {
    id: "badminton",
    title: "Badminton",
    lede: "",
    body: [],
    facts: [
      { k: "Where", v: "" },
      { k: "Format", v: "" },
      { k: "Racket", v: "" },
      { k: "Tension", v: "" }
    ],
    draft: true
  },
  {
    id: "building",
    title: "Building machines",
    lede: "Four builds so far.",
    body: [
      "The current one is an RTX 3070 Ti on a Ryzen 7 9850X3D, with 128 GB of DDR5-6400 CL30."
    ],
    facts: [
      { k: "Builds", v: "Four so far" },
      { k: "CPU", v: "Ryzen 7 9850X3D" },
      { k: "GPU", v: "RTX 3070 Ti" },
      { k: "Memory", v: "128 GB DDR5-6400 CL30" },
      { k: "Went wrong", v: "" }
    ]
  },
  {
    id: "local-models",
    title: "Running models locally",
    lede: "Gemma 4 27B and Nemotron Super 30B, on the machine under my desk.",
    body: [
      "Both run on the 3070 Ti build. I point them at personal projects and at the agentic workflows I keep running on my own machine. Nothing leaves the house."
    ],
    facts: [
      { k: "Models", v: "Gemma 4 27B · Nemotron Super 30B" },
      { k: "On", v: "RTX 3070 Ti · 128 GB DDR5-6400 CL30" },
      { k: "What for", v: "Personal projects and local agent workflows" },
      { k: "Runner", v: "" }
    ]
  },
  {
    id: "pasta",
    title: "Pasta",
    lede: "Alfredo. Easy to learn, hard to master.",
    body: [
      "It is a far more complex sauce than most people anticipate."
    ],
    facts: [
      { k: "The dish", v: "Alfredo" },
      /* Still waiting on Karan: fresh or dry, and the specific thing he
         thinks everyone gets wrong. That opinion is the line that would
         make this section land. */
      { k: "Fresh or dry", v: "" },
      { k: "The hill I die on", v: "" }
    ]
  }

];

export const personal = {
  eyebrow: "Outside of work",
  title: "The other things I am serious about.",
  intro:
    "Two rackets, a workbench, a GPU that earns its keep, and a pot of salted water.",
  pursuits
};
