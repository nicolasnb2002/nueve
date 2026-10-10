import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

export function BootProgress() {
  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);
  return null;
}
