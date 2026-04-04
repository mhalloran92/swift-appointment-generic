/**
 * Calendly Webhook Setup Script
 * 
 * This script registers your Supabase Edge Function as a webhook in Calendly.
 * Since Calendly doesn't have a UI for webhooks, this API call is necessary.
 * 
 * Usage:
 * 1. Get a Personal Access Token (PAT) from Calendly:
 *    https://calendly.com/integrations/api_webhooks
 * 2. Run: CALENDLY_PAT=your_token node scripts/setup_calendly_webhook.js
 */

const CALENDLY_PAT = process.env.CALENDLY_PAT;
const WEBHOOK_URL = "https://jqqzvvytczjannvngpav.supabase.co/functions/v1/calendly-webhook";

if (!CALENDLY_PAT) {
  console.error("Error: CALENDLY_PAT environment variable is required.");
  console.log("Please run: CALENDLY_PAT=your_token node scripts/setup_calendly_webhook.js");
  process.exit(1);
}

async function setupWebhook() {
  try {
    console.log("1. Fetching Calendly user information...");
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        "Authorization": `Bearer ${CALENDLY_PAT}`,
        "Content-Type": "application/json"
      }
    });

    if (!userResponse.ok) {
      const error = await userResponse.json();
      throw new Error(`Failed to fetch user: ${JSON.stringify(error)}`);
    }

    const { resource: user } = await userResponse.json();
    console.log(`   Connected as: ${user.name} (${user.email})`);
    console.log(`   Organization URI: ${user.current_organization}`);

    console.log("\n2. Registering Webhook Subscription...");
    const webhookResponse = await fetch("https://api.calendly.com/webhook_subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CALENDLY_PAT}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        events: ["invitee.created", "invitee.canceled"],
        organization: user.current_organization,
        scope: "organization"
      })
    });

    const result = await webhookResponse.json();

    if (!webhookResponse.ok) {
      // If organization scope fails, try user scope
      if (result.message?.includes("organization")) {
        console.log("   Organization subscription not allowed, trying User scope...");
        const userWebhookResponse = await fetch("https://api.calendly.com/webhook_subscriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${CALENDLY_PAT}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: WEBHOOK_URL,
            events: ["invitee.created", "invitee.canceled"],
            user: user.uri,
            scope: "user"
          })
        });

        if (!userWebhookResponse.ok) {
          const userError = await userWebhookResponse.json();
          throw new Error(`Failed to create user webhook: ${JSON.stringify(userError)}`);
        }
        
        const userResult = await userWebhookResponse.json();
        console.log("✅ Webhook successfully registered (User scope)!");
        console.log("   Subscription URI:", userResult.resource.uri);
      } else {
        throw new Error(`Failed to create webhook: ${JSON.stringify(result)}`);
      }
    } else {
      console.log("✅ Webhook successfully registered (Organization scope)!");
      console.log("   Subscription URI:", result.resource.uri);
    }

    console.log("\nSuccess! Your Supabase Edge Function is now linked to Calendly.");
    console.log("Any new bookings or cancellations will now automatically sync to your database.");

  } catch (error) {
    console.error("\n❌ Setup failed:");
    console.error(error.message);
  }
}

setupWebhook();
