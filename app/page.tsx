import {
  EmailTrigger,
  FaqTracker,
  HeadshotClickTracker
} from "@/components/achievements/InteractiveTriggers";
import { DecryptedText } from "@/components/animations/DecryptedText";
import { FlowingMenu } from "@/components/animations/FlowingMenu";
import { LogoLoop } from "@/components/animations/LogoLoop";
import { TrueFocus } from "@/components/animations/TrueFocus";
import { LightPillar } from "@/components/backgrounds/LightPillar";
import { NeuralMesh } from "@/components/backgrounds/NeuralMesh";
import { CareerTimeline } from "@/components/sections/CareerTimeline";
import { ScrollMorph } from "@/components/sections/ScrollMorph";
import { ScrollProjects } from "@/components/sections/ScrollProjects";
import { ScrollStats } from "@/components/sections/ScrollStats";
import { USAMap } from "@/components/sections/USAMap";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TiltCard } from "@/components/ui/TiltCard";
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
      answer: "Yes, just not to Arkansas."
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
      answer: "Nah. (Non-negotiable)"
    },
    {
      question: "Marvel or DC?",
      answer: "DC all the way!! (Psst — try the Konami code anywhere on this page.)"
    },
    {
      question: "Are the background particles judging me?",
      answer:
        "Yes (unless you get me an offer)"
    }
  ];

  return (
    <main>
      <LightPillar
        topColor="#5227FF"
        bottomColor="#FF9FFC"
        intensity={0.85}
        rotationSpeed={0.3}
        glowAmount={0.002}
        pillarWidth={3}
        pillarHeight={0.4}
        noiseIntensity={0.35}
        pillarRotation={25}
        interactive={false}
        mixBlendMode="screen"
        quality="high"
      />
      <NeuralMesh />

      <section className={`section ${styles.hero}`}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="section-kicker">Senior Applied AI Engineer</p>
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
              <EmailTrigger>
                <MagneticButton href={`mailto:${profile.email}`} className={styles.primaryBtn}>
                  Email Me
                </MagneticButton>
              </EmailTrigger>
              <MagneticButton
                href={profile.linkedin}
                className={styles.ghostBtn}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </MagneticButton>
              <MagneticButton
                href={profile.website}
                className={styles.ghostBtn}
                target="_blank"
                rel="noreferrer"
              >
                Personal Site
              </MagneticButton>
            </div>
          </div>

          <HeadshotClickTracker>
            <TiltCard className={styles.headshotCard} max={6}>
              <img src={profile.headshot} alt="Karan Shrivastava" className={styles.headshot} />
              <p className={styles.headshotCaption}>Building practical AI systems for production teams.</p>
            </TiltCard>
          </HeadshotClickTracker>
        </div>
      </section>

      <ScrollStats stats={profile.stats} />

      <section className="section">
        <div className="container">
          <div className="section-kicker">Network</div>
          <h2 className="section-title">Teams, platforms, and ecosystems</h2>
          <LogoLoop items={profile.logos} />
        </div>
      </section>

      <ScrollMorph />

      <CareerTimeline items={profile.experiences} />

      <ScrollProjects projects={profile.projects} />

      <section className="section">
        <div className="container">
          <div className="section-kicker">Credentials</div>
          <h2 className="section-title">Expanded certification portfolio</h2>
          <div className={styles.certGrid}>
            {profile.certifications.map((cert) => (
              <TiltCard className={styles.certCard} key={cert.title} max={7}>
                <h3>{cert.title}</h3>
                <p className={styles.certIssuer}>{cert.issuer}</p>
                <p className={styles.certFocus}>{cert.focus}</p>
              </TiltCard>
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

      <USAMap />

      <section className="section">
        <div className={`container ${styles.faqSection}`}>
          <div>
            <p className="section-kicker">FAQ</p>
            <h2 className={styles.faqTitle}>Frequently asked questions</h2>
          </div>

          <FaqTracker total={faqItems.length}>
            <div className={styles.faqList}>
              {faqItems.map((item) => (
                <details key={item.question} className={styles.faqItem} data-faq-id={item.question}>
                  <summary>
                    <span className={styles.faqIcon} aria-hidden="true" />
                    {item.question}
                  </summary>
                  <div className={styles.faqAnswer}>
                    <div className={styles.faqAnswerInner}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </FaqTracker>
        </div>
      </section>
    </main>
  );
}
