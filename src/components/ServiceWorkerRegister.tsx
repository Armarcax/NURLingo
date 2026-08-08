"use client";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/notifications";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
