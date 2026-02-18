import { CardSwap } from "@/components/animations/CardSwap";
import { CountUp } from "@/components/animations/CountUp";
import { DecryptedText } from "@/components/animations/DecryptedText";
import { FlowingMenu } from "@/components/animations/FlowingMenu";
import { LogoLoop } from "@/components/animations/LogoLoop";
import { TrueFocus } from "@/components/animations/TrueFocus";
import { LightPillar } from "@/components/backgrounds/LightPillar";
import { StickyScrollReveal } from "@/components/sections/StickyScrollReveal";
import { profile } from "@/data/profile-data";
import styles from "./page.module.css";

export default function HomePage() {
  const faqItems = [
    {
      question: "Are you authorized to work in USA?",
      answer: "Yes, US Citizen."
    },
    {
      question: "Are you willing to relocate?",
      answer: "Yes. (for the right role)"
    },
    {
      question: "What kind of role do you prefer?",
      answer: "Software Engineering roles with strong AI/ML focus."
    },
    {
      question: "What is the best way to reach you?",
      answer: `Email: ${profile.email}`
    },
    {
      question: "Pineapple on Pizza?",
      answer: "Nah."
    },
    {
      question: "Marvel or DC?",
      answer: "DC all the way!!"
    }
  ];

  return (
    <main>
      <LightPillar
        topColor="#5227FF"
        bottomColor="#FF9FFC"
        intensity={1}
        rotationSpeed={0.3}
        glowAmount={0.002}
        pillarWidth={3}
        pillarHeight={0.4}
        noiseIntensity={0.5}
        pillarRotation={25}
        interactive={false}
        mixBlendMode="screen"
        quality="high"
      />

      <section className={`section ${styles.hero}`}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="section-kicker">Machine Learning Engineer</p>
            <h1 className={styles.title}>
              <DecryptedText text={profile.name} />
            </h1>
            <p className={styles.headline}>{profile.headline}</p>
            <p className="muted">{profile.location}</p>

            <div className={styles.focusRow}>
              <TrueFocus
                words={[
                  "Agentic Systems",
                  "Applied NLP",
                  "Cloud-Ready MLOps",
                  "Full-Stack AI Products"
                ]}
              />
            </div>

            <p className={styles.summary}>{profile.summary[0]}</p>

            <div className={styles.actions}>
              <a href={`mailto:${profile.email}`} className={styles.primaryBtn}>
                Email Me
              </a>
              <a href={profile.linkedin} className={styles.ghostBtn} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={profile.website} className={styles.ghostBtn} target="_blank" rel="noreferrer">
                Personal Site
              </a>
            </div>
          </div>

          <aside className={styles.headshotCard}>
            <img src={profile.headshot} alt="Karan Shrivastava" className={styles.headshot} />
            <p className={styles.headshotCaption}>Building practical AI systems for production teams.</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Impact</div>
          <h2 className="section-title">Production results across AI + enterprise systems</h2>
          <div className={styles.statsGrid}>
            {profile.stats.map((stat) => (
              <article key={stat.label} className={styles.statCard}>
                <div className={styles.statValue}>
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Network</div>
          <h2 className="section-title">Teams, platforms, and ecosystems</h2>
          <LogoLoop items={profile.logos} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Experience</div>
          <h2 className="section-title">Sticky scroll career timeline</h2>
          <StickyScrollReveal
            items={profile.experiences.map((item) => ({
              title: `${item.role} — ${item.company}`,
              text: `${item.period} • ${item.detail}`,
              bullets: item.bullets
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Projects</div>
          <h2 className="section-title">Live project stack with card swap</h2>
          <CardSwap cards={profile.projects} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Credentials</div>
          <h2 className="section-title">Expanded certification portfolio</h2>
          <div className={styles.certGrid}>
            {profile.certifications.map((cert) => (
              <article className={styles.certCard} key={cert.title}>
                <h3>{cert.title}</h3>
                <p className={styles.certIssuer}>{cert.issuer}</p>
                <p className={styles.certFocus}>{cert.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Languages</div>
          <h2 className="section-title">Flowing language profile</h2>
          <div className={styles.languageMenuWrap}>
            <FlowingMenu
              items={profile.languages.map((lang) => ({
                link: "#",
                text: `${lang.name} — ${lang.level}`,
                image: lang.image,
                phrases: lang.phrases
              }))}
              speed={15}
              textColor="#ffffff"
              bgColor="#060010"
              marqueeBgColor="#ffffff"
              marqueeTextColor="#060010"
              borderColor="#ffffff"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.faqSection}`}>
          <div>
            <p className="section-kicker">FAQ</p>
            <h2 className={styles.faqTitle}>Frequently asked questions</h2>
          </div>

          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>
                  <span className={styles.faqIcon}>+</span>
                  {item.question}
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
