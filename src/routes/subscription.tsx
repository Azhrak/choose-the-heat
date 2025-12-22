import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles, Volume2 } from "lucide-react";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { BillingDetailsCard } from "~/components/subscription/BillingDetailsCard";
import { InvoiceHistory } from "~/components/subscription/InvoiceHistory";
import { SubscriptionCard } from "~/components/subscription/SubscriptionCard";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import {
	useSubscriptionTiersQuery,
	useUserSubscriptionQuery,
	useUserUsageQuery,
} from "~/hooks/useSubscriptionQuery";

export const Route = createFileRoute("/subscription")({
	component: SubscriptionPage,
});

function SubscriptionPage() {
	const { data: currentUser } = useCurrentUserQuery();
	const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiersQuery();
	const { data: userSubscription, isLoading: subscriptionLoading } =
		useUserSubscriptionQuery();
	const { data: usage } = useUserUsageQuery();

	const currentTier = userSubscription?.subscription_tier || "free";

	if (tiersLoading || subscriptionLoading) {
		return (
			<PageBackground>
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<Text variant="secondary">Loading subscription plans...</Text>
					</div>
				</div>
			</PageBackground>
		);
	}

	return (
		<PageBackground>
			<Header currentPath="/subscription" userRole={currentUser?.role} />
			<PageContainer maxWidth="full">
				<Stack gap="xl">
					{/* Header */}
					<div className="text-center">
						<Heading level="h1" size="page" className="mb-4">
							Choose Your Plan
						</Heading>
						<Text variant="secondary" size="lg" className="max-w-2xl mx-auto">
							Unlock more features and generations with our flexible
							subscription plans
						</Text>
					</div>

					{/* Current Usage */}
					{usage && currentTier && (
						<div className="max-w-2xl mx-auto">
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
								<Heading level="h2" size="subsection" className="mb-4">
									Today's Usage
								</Heading>
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
										<div className="flex items-center gap-2 mb-2">
											<Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												Text Generations
											</span>
										</div>
										<p className="text-2xl font-bold text-gray-900 dark:text-white">
											{usage.text_generations}
											{tiers?.find((t) => t.tier === currentTier)
												?.text_generations_per_day !== -1 && (
												<span className="text-sm text-gray-500 dark:text-gray-400">
													{" "}
													/{" "}
													{
														tiers?.find((t) => t.tier === currentTier)
															?.text_generations_per_day
													}
												</span>
											)}
										</p>
									</div>
									<div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
										<div className="flex items-center gap-2 mb-2">
											<Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												Voice Generations
											</span>
										</div>
										<p className="text-2xl font-bold text-gray-900 dark:text-white">
											{usage.voice_generations}
											{tiers?.find((t) => t.tier === currentTier)
												?.voice_generations_per_day !== -1 &&
												tiers?.find((t) => t.tier === currentTier)
													?.voice_generations_per_day !== 0 && (
													<span className="text-sm text-gray-500 dark:text-gray-400">
														{" "}
														/{" "}
														{
															tiers?.find((t) => t.tier === currentTier)
																?.voice_generations_per_day
														}
													</span>
												)}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Subscription Tiers */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
						{tiers?.map((tier) => (
							<SubscriptionCard
								key={tier.tier}
								tier={tier.tier}
								name={tier.name}
								description={tier.description || ""}
								priceMonthly={Number.parseFloat(tier.price_monthly)}
								priceYearly={
									tier.price_yearly ? Number.parseFloat(tier.price_yearly) : null
								}
								textGenerations={tier.text_generations_per_day}
								voiceGenerations={tier.voice_generations_per_day}
								features={tier.features}
								isCurrentPlan={tier.tier === currentTier}
							/>
						))}
					</div>

					{/* FAQ or Additional Info */}
					<div className="max-w-3xl mx-auto text-center">
						<Heading level="h2" size="section" className="mb-4">
							All plans include
						</Heading>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
								<Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
								<Text size="sm" weight="medium">
									Personalized Stories
								</Text>
							</div>
							<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
								<Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
								<Text size="sm" weight="medium">
									Save & Resume
								</Text>
							</div>
							<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
								<Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
								<Text size="sm" weight="medium">
									No Ads
								</Text>
							</div>
						</div>
					</div>

					{/* Billing & Payment */}
					<div className="max-w-5xl mx-auto">
						<Stack gap="lg">
							<BillingDetailsCard />
							<InvoiceHistory />
						</Stack>
					</div>
				</Stack>
			</PageContainer>
			<Footer />
		</PageBackground>
	);
}
