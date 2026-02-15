"use client";

import { Container } from "@repo/design-system/components/container";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@repo/design-system/components/kibo-ui/announcement";
import { Link } from "@repo/design-system/components/link";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";
import { domAnimation, LazyMotion, m } from "motion/react";
import type { ComponentProps } from "react";
import { CTAButton } from "../cta-button";

type HeroProperties = ComponentProps<"section"> & {
  readonly latestUpdate: string | undefined;
};

export const Hero = ({
  className,
  latestUpdate,
  ...properties
}: HeroProperties) => (
  <section className={cn("overflow-hidden", className)} {...properties}>
    <LazyMotion features={domAnimation}>
      <Container className="p-4 text-center">
        <div className="relative z-10 flex flex-col items-center py-12 sm:py-16 md:py-24">
          {latestUpdate ? (
            <m.div
              animate={{ opacity: 1, translateY: 0 }}
              className="w-full"
              initial={{ opacity: 0, translateY: 16 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <a
                aria-label="View latest update on Flowni changelog page"
                href="https://flowni.flowni.ai/changelog"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Announcement>
                  <AnnouncementTag>Latest update</AnnouncementTag>
                  <AnnouncementTitle>
                    {latestUpdate}
                    <ArrowUpRightIcon
                      className="shrink-0 text-muted-foreground"
                      size={16}
                    />
                  </AnnouncementTitle>
                </Announcement>
              </a>
            </m.div>
          ) : null}
          <div className="mt-8 max-w-6xl">
            <m.h1
              animate={{ opacity: 1, translateY: 0 }}
              className={cn(
                "mb-6 text-balance font-semibold tracking-tighter",
                "text-[2.125rem] sm:text-5xl md:text-6xl"
              )}
              initial={{ opacity: 0, translateY: 16 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
            >
              The open source product management platform
            </m.h1>
            <m.p
              animate={{ opacity: 1, translateY: 0 }}
              className="mx-auto mt-0 max-w-3xl text-balance text-muted-foreground sm:text-lg"
              initial={{ opacity: 0, translateY: 16 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 1 }}
            >
              Flowni is a simple, open source alternative to tools like
              Productboard and Cycle. Bring your product team together to
              explore problems, ideate solutions, prioritize features and plan
              roadmaps with the help of AI.
            </m.p>
          </div>
          <m.div
            animate={{ opacity: 1, translateY: 0 }}
            className="mt-8 flex max-w-lg flex-col items-center gap-4 sm:flex-row"
            initial={{ opacity: 0, translateY: 16 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 1.5 }}
          >
            <CTAButton size="lg" />
            <Button asChild size="lg" variant="outline">
              <Link href="http://localhost:3000">Get started</Link>
            </Button>
          </m.div>
        </div>
      </Container>
    </LazyMotion>
  </section>
);
