import { ConfigureAmplify } from "./ConfigureAmplify";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}