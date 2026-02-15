import "./styles.css";
import { DesignSystemProvider } from "@repo/design-system/components/provider";
import { fonts } from "@repo/design-system/lib/fonts";
import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
    <body className="min-h-screen bg-backdrop">
      <DesignSystemProvider>
        <QueryProvider>{children}</QueryProvider>
      </DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
