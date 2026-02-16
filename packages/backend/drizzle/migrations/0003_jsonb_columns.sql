ALTER TABLE "initiative_page" ALTER COLUMN "content" TYPE jsonb USING "content"::jsonb;
--> statement-breakpoint
ALTER TABLE "initiative_canvas" ALTER COLUMN "content" TYPE jsonb USING "content"::jsonb;
--> statement-breakpoint
ALTER TABLE "initiative_update" ALTER COLUMN "content" TYPE jsonb USING "content"::jsonb;
--> statement-breakpoint
ALTER TABLE "feature" ALTER COLUMN "canvas" TYPE jsonb USING "canvas"::jsonb;
--> statement-breakpoint
ALTER TABLE "feature" ALTER COLUMN "content" TYPE jsonb USING "content"::jsonb;
--> statement-breakpoint
ALTER TABLE "template" ALTER COLUMN "content" TYPE jsonb USING "content"::jsonb;
--> statement-breakpoint
ALTER TABLE "changelog" ALTER COLUMN "content" TYPE jsonb USING "content"::jsonb;
--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "content" TYPE jsonb USING "content"::jsonb;
--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "transcript" TYPE jsonb USING "transcript"::jsonb;
