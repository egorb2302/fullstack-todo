CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(500),
	"is_completed" boolean DEFAULT false
);
