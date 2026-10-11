import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

export function BootProgress() {
  useEffect(() => {
    void useProgress.persist.rehydrate();
    // Solo en el sitio público (base /nueve/): cache offline para la PWA.
    const base = import.meta.env.BASE_URL;
    if (import.meta.env.PROD && base !== "/" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {});
    }
  }, []);
  return null;
}
