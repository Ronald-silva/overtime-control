import { useState, useEffect } from 'react';
import styles from '../styles/Clock.module.css';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.clock}>
      {time.toLocaleTimeString()}
    </div>
  );
}