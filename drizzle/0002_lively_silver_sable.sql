CREATE TABLE "achievement_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"achievement_id" integer NOT NULL,
	"full_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer,
	"thumbnail_width" integer,
	"thumbnail_height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievement_image" ADD CONSTRAINT "achievement_image_achievement_id_achievement_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievement_image_achievement_id_idx" ON "achievement_image" USING btree ("achievement_id");--> statement-breakpoint
CREATE INDEX "achievement_image_sort_order_idx" ON "achievement_image" USING btree ("sort_order");