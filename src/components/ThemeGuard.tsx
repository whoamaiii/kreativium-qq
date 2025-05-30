"use client";
import { useEffect, useState } from "react";

export default function ThemeGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme") ?? "light";
    document.documentElement.dataset.theme = theme;
    setReady(true);
  }, []);

  return ready ? <>{children}</> : null;
} 