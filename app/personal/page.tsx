import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";
import { personal } from "@/data/personal-data";
import styles from "./page.module.css";

/* Describes the sections that are actually live. Worth re-reading when a
   drafted pursuit is turned on, so the description does not advertise
   something the page does not have. */
export const metadata: Metadata = {
  title: "Karan Shrivastava — Outside of work",
  description:
    "Table tennis at Georgia State, building machines, running models on them, and Alfredo.",
  openGraph: {
    title: "Karan Shrivastava — Outside of work",
    description:
      "NCTTA Division 1 table tennis, four PC builds, local inference, and a sauce that is harder than it looks.",
    type: "website"
  }
};


export default function PersonalPage() {
  /* Unwritten sections stay off the page rather than shipping with
     filler in them. See the note in personal-data.ts. */
  const pursuits = personal.pursuits.filter((p) => !p.draft);

  return (
    <main id="main">
      <span id="top" />

      <section className={styles.hero}>
        <div className="wrap">
          <Eyebrow>{personal.eyebrow}</Eyebrow>
          <h1 className={styles.h1} data-reveal>
            {personal.title}
          </h1>
          <p className={styles.intro} data-reveal>
            {personal.intro}
          </p>
        </div>
      </section>

      {pursuits.map((p, i) => (
        <section
          className={`sec ${i % 2 ? "sec--alt" : ""}`}
          id={p.id}
          key={p.id}
        >
          <div className={`wrap ${styles.grid}`}>
            <div className={styles.copy}>
              <Eyebrow n={String(i + 1).padStart(2, "0")}>{p.title}</Eyebrow>
              {p.lede && (
                <h2 className="sec__h" data-reveal>
                  {p.lede}
                </h2>
              )}
              {p.body.map((para) => (
                <p className={styles.para} key={para} data-reveal>
                  {para}
                </p>
              ))}

              {/* Rows without a value are still being written, so they
                  are dropped rather than rendered as an empty line. */}
              <div className="spec">
                {p.facts
                  .filter((f) => f.v)
                  .map((f) => (
                    <div className="spec__r" key={f.k} data-reveal>
                      <span className="spec__k">{f.k}</span>
                      <span className="spec__v">{f.v}</span>
                    </div>
                  ))}
              </div>
            </div>

            {p.photo && (
              <figure className={styles.figure} data-reveal>
                <img
                  className={styles.photo}
                  src={p.photo.src}
                  alt={p.photo.alt}
                  loading="lazy"
                />
                {p.photo.caption && (
                  <figcaption className={styles.caption}>
                    {p.photo.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </section>
      ))}

      <section className={styles.back}>
        <div className="wrap">
          <a className="btn btn--ghost" href="/#work">
            ← Back to the work
          </a>
        </div>
      </section>
    </main>
  );
}
