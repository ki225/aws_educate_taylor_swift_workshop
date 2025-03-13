"use client";
import { Button, ColorMode } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

function ThemeToggle({ initialValue }: { initialValue: ColorMode }) {
  const [colorMode, setColorMode] = useState(initialValue);

  useEffect(() => {
    if (colorMode) {
    //   document.cookie = `colorMode=${colorMode};path=/;`;
      localStorage.setItem("colorMode", colorMode);
      document
        ?.querySelector("[data-amplify-theme]")
        ?.setAttribute("data-amplify-color-mode", colorMode);
    } else {
      setColorMode(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    }
  }, [colorMode]);

  return (
    <Button
      onClick={() => setColorMode(colorMode === "dark" ? "light" : "dark")}
    >
      {colorMode === "dark" ? <LuSun /> : <LuMoon />}
    </Button>
  );
}

export default ThemeToggle;