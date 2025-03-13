import { Sidebar } from "@/components//Sidebar";
import { Layout } from "@/components/Layout";
import { CreateChat } from "@/components/Sidebar/CreateChat";
import { LogoutButton } from "@/components/Sidebar/Logout";
import ThemeToggle from "@/components/ThemeToggle";
import { theme } from "@/theme";
import { ColorMode } from "@aws-amplify/ui-react";
import { ThemeStyle } from "@aws-amplify/ui-react/server";
import { cookies } from "next/headers";
import { ConfigureAmplify } from "./ConfigureAmplify";
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const colorMode = ((await cookieStore).get("colorMode")?.value ??
    "light") as ColorMode;
//   const colorMode = (localStorage.getItem("colorMode") ??
//     "light") as ColorMode;
  return (
    <html lang="en">
      <body {...theme.containerProps({ colorMode })}>
        <Layout>
          <ConfigureAmplify />

          <Sidebar>
            <LogoutButton />
            <CreateChat />
            <ThemeToggle initialValue={colorMode} />
          </Sidebar>

          {children}
        </Layout>
        <ThemeStyle theme={theme} />
      </body>
    </html>
  );
}