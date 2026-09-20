"use client";
import { useEffect, useRef, useState } from "react";

export function useTypewriter(text: string, speed = 22) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setOut("");
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        if (timer.current) clearInterval(timer.current);
        setDone(true);
      }
    }, speed);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [text, speed]);

  const skip = () => {
    if (timer.current) clearInterval(timer.current);
    setOut(text);
    setDone(true);
  };

  return { out, done, skip };
}
