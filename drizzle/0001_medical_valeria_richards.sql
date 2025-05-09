CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"content" text NOT NULL,
	"role" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
