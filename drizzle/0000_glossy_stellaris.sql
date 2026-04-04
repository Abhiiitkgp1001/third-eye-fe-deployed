CREATE TYPE "public"."cadence" AS ENUM('MANUAL', 'DAILY', 'WEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TYPE "public"."syncStatus" AS ENUM('DRAFT', 'BUILDING', 'NORMAL', 'FAILED');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyListId" text NOT NULL,
	"linkedinUrl" text NOT NULL,
	"latestMetadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"ordinal" bigint GENERATED ALWAYS AS IDENTITY (sequence name "companies_ordinal_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1)
);
--> statement-breakpoint
CREATE TABLE "companyLists" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orgId" text NOT NULL,
	"name" text NOT NULL,
	"min" integer,
	"max" integer,
	"enabled" boolean DEFAULT false NOT NULL,
	"syncStatus" "syncStatus" DEFAULT 'DRAFT' NOT NULL,
	"allowedMovements" text[],
	"prompt" text,
	"cadence" "cadence" DEFAULT 'MANUAL' NOT NULL,
	"nextRunAt" timestamp with time zone,
	"lastRunAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"ordinal" bigint GENERATED ALWAYS AS IDENTITY (sequence name "companyLists_ordinal_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1)
);
--> statement-breakpoint
CREATE TABLE "movementsCompanyList" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" text NOT NULL,
	"linkedinUrl" text NOT NULL,
	"movement" text NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movementsProfileList" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profileId" text NOT NULL,
	"linkedinUrl" text NOT NULL,
	"movement" text NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"name" text NOT NULL,
	"domain" text,
	"ordinal" bigint GENERATED ALWAYS AS IDENTITY (sequence name "organizations_ordinal_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	CONSTRAINT "organizations_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "peopleLists" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orgId" text NOT NULL,
	"name" text NOT NULL,
	"min" integer,
	"max" integer,
	"enabled" boolean DEFAULT false NOT NULL,
	"syncStatus" "syncStatus" DEFAULT 'DRAFT' NOT NULL,
	"allowedMovements" text[],
	"prompt" text,
	"cadence" "cadence" DEFAULT 'MANUAL' NOT NULL,
	"nextRunAt" timestamp with time zone,
	"lastRunAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"ordinal" bigint GENERATED ALWAYS AS IDENTITY (sequence name "peopleLists_ordinal_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"peopleListId" text NOT NULL,
	"linkedinUrl" text NOT NULL,
	"latestMetadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"ordinal" bigint GENERATED ALWAYS AS IDENTITY (sequence name "profiles_ordinal_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1)
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_companyListId_companyLists_id_fk" FOREIGN KEY ("companyListId") REFERENCES "public"."companyLists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companyLists" ADD CONSTRAINT "companyLists_orgId_organizations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movementsCompanyList" ADD CONSTRAINT "movementsCompanyList_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movementsProfileList" ADD CONSTRAINT "movementsProfileList_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peopleLists" ADD CONSTRAINT "peopleLists_orgId_organizations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_peopleListId_peopleLists_id_fk" FOREIGN KEY ("peopleListId") REFERENCES "public"."peopleLists"("id") ON DELETE no action ON UPDATE no action;