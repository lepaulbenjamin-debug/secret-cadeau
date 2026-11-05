"use client";

import { useEffect, useRef } from "react";

/** Ouvre le <details> parent quand l'adresse se termine par #id (lien « ne plus recevoir de rappels »). */
export function OuvrirSiAncre({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    const details = ref.current?.closest("details");
    if (details) {
      details.open = true;
      details.scrollIntoView({ block: "start" });
    }
  }, [id]);
  return <span ref={ref} hidden />;
}
