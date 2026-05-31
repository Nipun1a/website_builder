import type { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma.js";

export const stripeWebhook = async (request: Request, response: Response) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !endpointSecret) {
        return response.status(500).json({ message: "Stripe webhook is not configured" });
    }

    const stripe = new Stripe(stripeSecretKey);
    const signature = request.headers["stripe-signature"];

    if (!signature || Array.isArray(signature)) {
        return response.status(400).json({ message: "Missing Stripe signature" });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(request.body, signature, endpointSecret);
    } catch (error: any) {
        console.log(`Webhook signature verification failed: ${error.message}`);
        return response.sendStatus(400);
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const transactionId = session.metadata?.transactionId;
            const appId = session.metadata?.appId;

            if (appId !== "ai-site-builder" || !transactionId) {
                break;
            }

            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId }
            });

            if (!transaction || transaction.isPaid) {
                break;
            }

            await prisma.transaction.update({
                where: { id: transactionId },
                data: { isPaid: true }
            });

            await prisma.user.update({
                where: { id: transaction.userId },
                data: { credits: { increment: transaction.credits } }
            });
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return response.json({ received: true });
};
