"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { gsap } from "gsap";
import styles from "./FlowingMenu.module.css";

type FlowingMenuItem = {
  link: string;
  text: string;
  image: string;
  phrases: string[];
};

type FlowingMenuProps = {
  items: FlowingMenuItem[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
};

type MenuItemProps = {
  item: FlowingMenuItem;
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
};

function distMetric(x: number, y: number, x2: number, y2: number) {
  const xDiff = x - x2;
  const yDiff = y - y2;
  return xDiff * xDiff + yDiff * yDiff;
}

function findClosestEdge(mouseX: number, mouseY: number, width: number, height: number) {
  const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
  const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
  return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
}

function MenuItem({ item, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor }: MenuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: "expo" };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) {
        return;
      }

      const marqueeContent = marqueeInnerRef.current.querySelector(`.${styles.marqueePart}`) as HTMLElement | null;
      if (!marqueeContent) {
        return;
      }

      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / Math.max(contentWidth, 1)) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [item]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) {
        return;
      }

      const marqueeContent = marqueeInnerRef.current.querySelector(`.${styles.marqueePart}`) as HTMLElement | null;
      if (!marqueeContent) {
        return;
      }

      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) {
        return;
      }

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.fromTo(
        marqueeInnerRef.current,
        { x: 0 },
        {
          x: -contentWidth,
          duration: speed,
          ease: "none",
          repeat: -1
        }
      );
    };

    const timer = window.setTimeout(setupMarquee, 60);

    return () => {
      window.clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [item, repetitions, speed]);

  const handleMouseEnter = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }

    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const handleMouseLeave = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }

    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  return (
    <div className={styles.menuItem} ref={itemRef} style={{ borderColor }}>
      <a
        className={styles.menuItemLink}
        href={item.link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        {item.text}
      </a>
      <div className={styles.marquee} ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className={styles.marqueeInnerWrap}>
          <div className={styles.marqueeInner} ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }).map((_, index) => (
              <div className={styles.marqueePart} key={`${item.text}-${index}`} style={{ color: marqueeTextColor }}>
                <span>{item.text}</span>
                <span className={styles.words}>{item.phrases.join(" • ")}</span>
                <div className={styles.marqueeImg} style={{ backgroundImage: `url(${item.image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlowingMenu({
  items,
  speed = 15,
  textColor = "#ffffff",
  bgColor = "#060010",
  marqueeBgColor = "#ffffff",
  marqueeTextColor = "#060010",
  borderColor = "#ffffff"
}: FlowingMenuProps) {
  return (
    <div className={styles.menuWrap} style={{ backgroundColor: bgColor }}>
      <nav className={styles.menu}>
        {items.map((item) => (
          <MenuItem
            key={item.text}
            item={item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
          />
        ))}
      </nav>
    </div>
  );
}
