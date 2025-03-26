"use client";
import { Button, ColorMode } from "@aws-amplify/ui-react";
import { LuMoon, LuSun } from "react-icons/lu";

function ThemeToggle({
  currentMode,
  setColorMode,
}: {
  currentMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}) {

  const toggleColorMode = () => {
    const newMode = currentMode === "dark" ? "light" : "dark";
    setColorMode(newMode);

    localStorage.setItem("colorMode", newMode);

    // update HTML class
    if (newMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // update Amplify theme
    document
      ?.querySelector("[data-amplify-theme]")
      ?.setAttribute("data-amplify-color-mode", newMode);
  };

  return (
    <Button onClick={() => toggleColorMode()}>
      {currentMode === "dark" ? <LuSun /> : <LuMoon />}
    </Button>
  );
}

export default ThemeToggle;