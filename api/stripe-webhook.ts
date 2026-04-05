import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    // Collect the raw body buffer to verify the signature
    const rawBody = await new Promise<string>((resolve, reject) => {
      let chunks = '';
      req.on('data', (chunk: any) => chunks += chunk);
      req.on('end', () => resolve(chunks));
      req.on('error', (err: any) => reject(err));
    });

    event = stripe.webhooks.constructEvent(rawBody, sig || '', webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the "checkout.session.completed" event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log(`Payment confirmed for session: ${session.id}`);

    // Forward to n8n if URL is provided
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType: 'payment_success',
            paymentId: session.id,
            amount: session.amount_total,
            currency: session.currency,
            customerEmail: session.customer_email || session.metadata?.customer_email,
            customerName: session.metadata?.customer_name,
            serviceName: session.metadata?.service_name,
            stripeMetadata: session.metadata,
          }),
        });
        console.log('Successfully forwarded to n8n');
      } catch (n8nErr) {
        console.error('Failed to forward to n8n:', n8nErr);
      }
    }
  }

  return res.status(200).json({ received: true });
}

// Ensure the body isn't parsed by Vercel before we can verify the signature
export const config = {
  api: {
    bodyParser: false,
  },
};
