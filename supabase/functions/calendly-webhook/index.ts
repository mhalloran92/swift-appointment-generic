import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const payload = await req.json();
    console.log("Calendly webhook received:", JSON.stringify(payload, null, 2));

    const event = payload.event;
    const data = payload.payload;

    if (event !== "invitee.created" && event !== "invitee.canceled") {
      return new Response(JSON.stringify({ message: "Event ignored" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const inviteeUri = data.uri;
    const inviteeEmail = data.email;
    const inviteeName = data.name;
    const scheduledEvent = data.scheduled_event;
    const startTime = scheduledEvent?.start_time;
    const endTime = scheduledEvent?.end_time;
    const eventName = scheduledEvent?.name || "Appointment";
    const location = scheduledEvent?.location?.join_url || scheduledEvent?.location?.location || null;
    const cancelUrl = data.cancel_url || null;
    const rescheduleUrl = data.reschedule_url || null;
    const eventUri = scheduledEvent?.uri || null;

    if (event === "invitee.canceled") {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("calendly_invitee_uri", inviteeUri);
      if (error) throw new Error(`Error cancelling appointment: ${error.message}`);
      console.log(`Marked appointment cancelled for invitee: ${inviteeUri}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // invitee.created — look up user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", inviteeEmail)
      .maybeSingle();

    const userId = profile?.id ?? null;
    if (profileError) {
      console.warn(`Profile lookup error for ${inviteeEmail}: ${profileError.message}`);
    }
    if (!userId) {
      console.warn(`No profile found for ${inviteeEmail} — storing appointment without user_id`);
    }

    const { error: upsertError } = await supabase
      .from("appointments")
      .upsert(
        {
          user_id: userId,
          event_name: eventName,
          start_time: startTime,
          end_time: endTime,
          status: "active",
          invitee_email: inviteeEmail,
          invitee_name: inviteeName,
          location,
          cancel_url: cancelUrl,
          reschedule_url: rescheduleUrl,
          calendly_event_uri: eventUri,
          calendly_invitee_uri: inviteeUri,
        },
        { onConflict: "calendly_invitee_uri" }
      );

    if (upsertError) throw new Error(`Error upserting appointment: ${upsertError.message}`);

    console.log(`Appointment synced for ${inviteeEmail}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
