import { Container } from "@repo/design-system/components/container";
import { Link } from "@repo/design-system/components/link";
import { Logo } from "@repo/design-system/components/logo";
import { ThemeToggle } from "./theme-toggle";

export const Footer = async () => (
  <section className="relative overflow-hidden">
    <Container className="flex items-center justify-between gap-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Logo showName />
        </Link>
        <p className="text-muted-foreground text-sm">All rights reserved.</p>
      </div>
      <ThemeToggle />
    </Container>
  </section>
);
