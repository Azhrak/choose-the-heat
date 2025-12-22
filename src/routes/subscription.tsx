import { createFileRoute } from "@tanstack/react-router";
import { Check, Crown, Sparkles, Star, Volume2, Zap } from "lucide-react";
import { BillingDetailsCard } from "~/components/subscription/BillingDetailsCard";
import { InvoiceHistory } from "~/components/subscription/InvoiceHistory";
import {
	useSubscriptionTiersQuery,
	useUserSubscriptionQuery,
	useUserUsageQuery,
} from "~/hooks/useSubscriptionQuery";
import type { SubscriptionTier } from "~/lib/db/types";

export const Route = createFileRoute("/subscription")({
	component: SubscriptionPage,
});

interface TierFeatures {
	priority_support: boolean;
	advanced_ai_models: boolean;
	early_access: boolean;
}

function SubscriptionPage() {
	const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiersQuery();
	const { data: userSubscription, isLoading: subscriptionLoading } =
		useUserSubscriptionQuery();
	const { data: usage } = useUserUsageQuery();

	const currentTier = userSubscription?.subscription_tier || "free";

	if (tiersLoading || subscriptionLoading) {
		return (
			<div className="min-h-screen bg-linear-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-300">
						Loading subscription plans...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
						Choose Your Plan
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						Unlock more features and generations with our flexible subscription
						plans
					</p>
				</div>

				{/* Current Usage */}
				{usage && currentTier && (
					<div className="max-w-2xl mx-auto mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
							Today's Usage
						</h2>
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
				)}

				{/* Subscription Tiers */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
					{tiers?.map((tier) => (
						<SubscriptionCard
							key={tier.tier}
							tier={tier.tier}
							name={tier.name}
							description={tier.description || ""}
							priceMonthly={parseFloat(tier.price_monthly)}
							priceYearly={
								tier.price_yearly ? parseFloat(tier.price_yearly) : null
							}
							textGenerations={tier.text_generations_per_day}
							voiceGenerations={tier.voice_generations_per_day}
							features={tier.features}
							isCurrentPlan={tier.tier === currentTier}
						/>
					))}
				</div>

				{/* FAQ or Additional Info */}
				<div className="max-w-3xl mx-auto mt-16 text-center">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						All plans include
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
							<Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
							<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Personalized Stories
							</p>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
							<Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
							<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Save & Resume
							</p>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
							<Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
							<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
								No Ads
							</p>
						</div>
					</div>
				</div>

				{/* Billing & Payment */}
				<div className="max-w-5xl mx-auto mt-16 space-y-8">
					<BillingDetailsCard />
					<InvoiceHistory />
				</div>
			</div>
		</div>
	);
}

interface SubscriptionCardProps {
	tier: SubscriptionTier;
	name: string;
	description: string;
	priceMonthly: number;
	priceYearly: number | null;
	textGenerations: number;
	voiceGenerations: number;
	features: TierFeatures | null;
	isCurrentPlan: boolean;
}

function SubscriptionCard({
	tier,
	name,
	description,
	priceMonthly,
	priceYearly,
	textGenerations,
	voiceGenerations,
	features,
	isCurrentPlan,
}: SubscriptionCardProps) {
	const isPopular = tier === "premium";
	const isPremiumPlus = tier === "premium_plus";

	const getTierIcon = () => {
		switch (tier) {
			case "free":
				return <Star className="w-8 h-8" />;
			case "basic":
				return <Zap className="w-8 h-8" />;
			case "premium":
				return <Sparkles className="w-8 h-8" />;
			case "premium_plus":
				return <Crown className="w-8 h-8" />;
			default:
				return <Star className="w-8 h-8" />;
		}
	};

	return (
		<div
			className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all ${
				isCurrentPlan
					? "border-rose-500 dark:border-rose-400"
					: isPopular
						? "border-purple-500 dark:border-purple-400"
						: "border-gray-200 dark:border-gray-700"
			} ${isPopular ? "transform scale-105" : ""}`}
		>
			{isPopular && (
				<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
					<span className="bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
						MOST POPULAR
					</span>
				</div>
			)}

			{isCurrentPlan && (
				<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
					<span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
						CURRENT PLAN
					</span>
				</div>
			)}

			<div className="text-center mb-6">
				<div
					className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
						isPremiumPlus
							? "bg-linear-to-br from-yellow-400 to-orange-500 text-white"
							: isPopular
								? "bg-linear-to-br from-purple-500 to-pink-500 text-white"
								: tier === "basic"
									? "bg-linear-to-br from-blue-500 to-cyan-500 text-white"
									: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
					}`}
				>
					{getTierIcon()}
				</div>
				<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{name}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
					{description}
				</p>
				<div className="mb-4">
					<span className="text-4xl font-bold text-gray-900 dark:text-white">
						${priceMonthly.toFixed(2)}
					</span>
					<span className="text-gray-600 dark:text-gray-400">/month</span>
					{priceYearly && priceYearly > 0 && (
						<p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
							or ${priceYearly.toFixed(2)}/year (save{" "}
							{Math.round((1 - priceYearly / (priceMonthly * 12)) * 100)}%)
						</p>
					)}
				</div>
			</div>

			<div className="space-y-3 mb-6">
				<div className="flex items-start gap-2">
					<Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
					<span className="text-sm text-gray-700 dark:text-gray-300">
						{textGenerations === -1 ? "Unlimited" : textGenerations} text
						generations/day
					</span>
				</div>
				<div className="flex items-start gap-2">
					<Volume2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
					<span className="text-sm text-gray-700 dark:text-gray-300">
						{voiceGenerations === -1
							? "Unlimited"
							: voiceGenerations === 0
								? "No"
								: voiceGenerations}{" "}
						voice generations/day
					</span>
				</div>
				{features?.priority_support && (
					<div className="flex items-start gap-2">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Priority support
						</span>
					</div>
				)}
				{features?.advanced_ai_models && (
					<div className="flex items-start gap-2">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Advanced AI models
						</span>
					</div>
				)}
				{features?.early_access && (
					<div className="flex items-start gap-2">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Early access to features
						</span>
					</div>
				)}
			</div>

			<button
				type="button"
				disabled={isCurrentPlan}
				className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
					isCurrentPlan
						? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
						: isPremiumPlus
							? "bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
							: isPopular
								? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
								: "bg-rose-500 hover:bg-rose-600 text-white"
				}`}
			>
				{isCurrentPlan
					? "Current Plan"
					: tier === "free"
						? "Current Plan"
						: "Upgrade Now"}
			</button>
		</div>
	);
}
