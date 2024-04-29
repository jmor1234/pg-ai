import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prismaSingelton";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { NextResponse } from "next/server";

const settingsURL = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId: userId,
      },
    });

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsURL,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsURL,
      cancel_url: settingsURL,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PG-Insights Pro",
              description:
                "The most contextually relevant insights grounded in Paul Graham's essay wisdom.",
            },
            unit_amount: 999,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.log("[STRIPE_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
