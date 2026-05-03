CREATE TABLE "achievement" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"distance_label" text,
	"event_date" date,
	"location" text,
	"finish_time" text,
	"pace" text,
	"placement" text,
	"strava_url" text,
	"description" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievement_user_id_idx" ON "achievement" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "achievement_event_date_idx" ON "achievement" USING btree ("event_date");