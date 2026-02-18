import styles from "./LogoLoop.module.css";

type LogoLoopProps = {
  items: string[];
};

export function LogoLoop({ items }: LogoLoopProps) {
  const loop = [...items, ...items];

  return (
    <div className={styles.frame}>
      <div className={styles.track}>
        {loop.map((item, index) => (
          <div key={`${item}-${index}`} className={styles.logo}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
