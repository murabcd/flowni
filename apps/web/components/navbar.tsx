import { Container } from "@repo/design-system/components/container";
import { Link } from "@repo/design-system/components/link";
import { Logo } from "@repo/design-system/components/logo";
import { Button } from "@repo/design-system/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { domAnimation, LazyMotion } from "motion/react";

export const Navbar = () => (
  <LazyMotion features={domAnimation}>
    <nav className="sticky top-0 z-50">
      <Container className="grid grid-cols-[40px_1fr_40px] items-center gap-4 bg-backdrop/90 py-3 backdrop-blur-sm md:grid-cols-[120px_1fr_120px]">
        <div>
          <Link className="hidden md:block" href="/">
            <Logo showName />
          </Link>
          <Link className="block md:hidden" href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center justify-center" />
        <div className="flex justify-end">
          <Button asChild className="hidden md:flex">
            <a href="http://localhost:3000">Get started</a>
          </Button>
          <Button asChild className="flex md:hidden" size="icon">
            <a href="http://localhost:3000">
              <ArrowRightIcon size={16} />
            </a>
          </Button>
        </div>
      </Container>
    </nav>
  </LazyMotion>
);
