"use client"

import { Sidebar } from "@/components//Sidebar";
import { Layout } from "@/components/Layout";
import { CreateChat } from "@/components/Sidebar/CreateChat";
import { LogoutButton } from "@/components/Sidebar/Logout";
import ThemeToggle from "@/components/ThemeToggle";
import { theme } from "@/theme";
import { ColorMode } from "@aws-amplify/ui-react";
import { ThemeStyle } from "@aws-amplify/ui-react/server";
import { useEffect, useState } from "react";
import { ConfigureAmplify } from "./ConfigureAmplify";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [colorMode, setColorMode] = useState("light");

  useEffect(() => {
    const savedColorMode = localStorage.getItem("colorMode") || "light";
    setColorMode(savedColorMode);
    
    // set HTML class
    if (savedColorMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // set Amplify theme
    document
      ?.querySelector("[data-amplify-theme]")
      ?.setAttribute("data-amplify-color-mode", savedColorMode);
  }, []);

  return (
    <html lang="en">
      <body {...theme.containerProps()}>
        <Layout>
          <ConfigureAmplify />

          <div className="bg-[#fffaf3] dark:bg-gray-800 max-w-1/4">
            <Sidebar>
              <LogoutButton />
              <CreateChat />
              <ThemeToggle currentMode={colorMode as ColorMode} setColorMode={setColorMode} />
            </Sidebar>
          </div>

          {children}
        </Layout>
        <ThemeStyle theme={theme} />
      </body>
    </html>
  );
}