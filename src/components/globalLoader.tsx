"use client";
import React from "react";
import { useEffect } from "react";

export default function GlobalLoader() {
  useEffect(() => {
    async function getLoader() {
      const { hatch } = await import("ldrs");
      hatch.register();
    }
    getLoader();
  }, []);

  return (
    <div className="flex items-center justify-center">
      {React.createElement("l-hatch", {
        size: "30",
        speed: "3.0",
        color: "#0063A4",
      })}
    </div>
  );
}
