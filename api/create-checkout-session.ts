import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId, name, email, serviceName, successUrl, cancelUrl } = req.body;

    if (!priceId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      // Metadata is key: it carries our application data to n8n
      metadata: {
        customer_name: name,
        customer_email: email,
        service_name: serviceName,
        source: 'swift_generic_appointment'
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Session Error:', err);
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
}
