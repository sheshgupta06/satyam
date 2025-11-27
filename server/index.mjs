import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn("WARNING: STRIPE_SECRET_KEY not set. The /create-checkout-session endpoint will fail without it.");
}

const stripe = new Stripe(stripeSecret || "", { apiVersion: "2024-08-01" });

// POST /create-checkout-session
// body: { items: [{ title, price, quantity }], success_url, cancel_url }
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, success_url, cancel_url } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    const line_items = items.map((it) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: it.title,
        },
        unit_amount: Math.round(Number(it.price) * 100),
      },
      quantity: it.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: success_url || "http://localhost:5173/order-success",
      cancel_url: cancel_url || "http://localhost:5173/checkout",
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () => {
  console.log(`Stripe server listening on http://localhost:${port}`);
});
