"use server"

import Stripe from "stripe"
import { getAdminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function cancelSubscriptionAction(userId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const adminDb = getAdminDb()

  // Get the user's subscription ID from Firestore
  const userDoc = await adminDb.collection("users").doc(userId).get()
  const userData = userDoc.data()

  if (!userData?.stripeSubscriptionId) {
    return { error: "No active subscription found" }
  }

  try {
    // Cancel at period end — user keeps access until billing period ends
    const subscription = await stripe.subscriptions.update(
      userData.stripeSubscriptionId,
      { cancel_at_period_end: true }
    )

    // Update Firestore with cancellation status and period end date
    await adminDb.collection("users").doc(userId).update({
      subscriptionStatus: "canceled",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: subscription.current_period_end,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return {
      success: true,
      periodEnd: subscription.current_period_end,
    }
  } catch (err) {
    console.error("Failed to cancel subscription:", err)
    return { error: "Failed to cancel subscription" }
  }
}
