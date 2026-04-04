import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  // Get the Webhook Secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = evt.type;

  console.log(`Webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "organization.created": {
        const { id, name, slug } = evt.data;

        console.log(`Creating organization in database: ${id} - ${name}`);

        // Check if organization already exists
        const existingOrg = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, id))
          .limit(1);

        if (existingOrg.length === 0) {
          // Create organization in database
          await db.insert(organizations).values({
            id: id,
            name: name,
            domain: slug || null,
          });

          console.log(`✅ Organization created: ${id}`);
        } else {
          console.log(`ℹ️  Organization already exists: ${id}`);
        }

        break;
      }

      case "organization.updated": {
        const { id, name, slug } = evt.data;

        console.log(`Updating organization in database: ${id} - ${name}`);

        // Update organization in database
        await db
          .update(organizations)
          .set({
            name: name,
            domain: slug || null,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, id));

        console.log(`✅ Organization updated: ${id}`);
        break;
      }

      case "organization.deleted": {
        const id = evt.data.id;

        if (!id) {
          console.error("Organization ID is missing in delete event");
          break;
        }

        console.log(`Deleting organization from database: ${id}`);

        // Delete organization from database (this will cascade to lists)
        await db.delete(organizations).where(eq(organizations.id, id));

        console.log(`✅ Organization deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook:`, error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
