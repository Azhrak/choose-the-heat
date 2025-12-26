import { Check, Crown, Sparkles, Star, Volume2, Zap } from "lucide-react";
import { useState } from "react";
import type { TierFeatures } from "~/hooks/useSubscriptionQuery";
import type { SubscriptionTier } from "~/lib/db/types";

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

/**
 * SubscriptionCard - Displays a subscription tier with pricing and features
 * Used on Subscription page to showcase available plans
 *
 * @param props.tier - Subscription tier level (free, basic, premium, premium_plus)
 * @param props.name - Display name of the tier
 * @param props.description - Brief description of the tier
 * @param props.priceMonthly - Monthly price in dollars
 * @param props.priceYearly - Yearly price in dollars (or null if not available)
 * @param props.textGenerations - Number of text generations per day (-1 for unlimited)
 * @param props.voiceGenerations - Number of voice generations per day (-1 for unlimited, 0 for none)
 * @param props.features - Additional tier features (priority support, advanced AI, early access)
 * @param props.isCurrentPlan - Whether this is the user's current subscription tier
 */
export function SubscriptionCard(props: SubscriptionCardProps) {
	const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
		"monthly",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isPopular = props.tier === "premium";
	const isPremiumPlus = props.tier === "premium_plus";

	const getTierIcon = () => {
		switch (props.tier) {
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

	const handleUpgrade = async () => {
		if (props.tier === "free" || props.isCurrentPlan) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/checkout/create-session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					tierId: props.tier,
					billingPeriod,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create checkout session");
			}

			// Redirect to Stripe Checkout
			if (data.sessionUrl) {
				window.location.href = data.sessionUrl;
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all ${
				props.isCurrentPlan
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

			{props.isCurrentPlan && (
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
								: props.tier === "basic"
									? "bg-linear-to-br from-blue-500 to-cyan-500 text-white"
									: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
					}`}
				>
					{getTierIcon()}
				</div>
				<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{props.name}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
					{props.description}
				</p>

				{/* Billing Period Toggle - Only show for paid tiers with yearly option */}
				{props.tier !== "free" &&
					props.priceYearly &&
					props.priceYearly > 0 && (
						<div className="flex justify-center gap-2 mb-3">
							<button
								type="button"
								onClick={() => setBillingPeriod("monthly")}
								className={`px-3 py-1 text-xs rounded-full transition-all ${
									billingPeriod === "monthly"
										? "bg-rose-500 text-white"
										: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
								}`}
							>
								Monthly
							</button>
							<button
								type="button"
								onClick={() => setBillingPeriod("yearly")}
								className={`px-3 py-1 text-xs rounded-full transition-all ${
									billingPeriod === "yearly"
										? "bg-rose-500 text-white"
										: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
								}`}
							>
								Yearly (Save{" "}
								{Math.round(
									(1 - props.priceYearly / (props.priceMonthly * 12)) * 100,
								)}
								%)
							</button>
						</div>
					)}

				<div className="mb-4">
					<span className="text-4xl font-bold text-gray-900 dark:text-white">
						$
						{billingPeriod === "yearly" && props.priceYearly
							? (props.priceYearly / 12).toFixed(2)
							: props.priceMonthly.toFixed(2)}
					</span>
					<span className="text-gray-600 dark:text-gray-400">/month</span>
					{billingPeriod === "yearly" && props.priceYearly && (
						<p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
							Billed ${props.priceYearly.toFixed(2)} annually
						</p>
					)}
				</div>
			</div>

			<div className="space-y-3 mb-6">
				<div className="flex items-start gap-2">
					<Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
					<span className="text-sm text-gray-700 dark:text-gray-300">
						{props.textGenerations === -1 ? "Unlimited" : props.textGenerations}{" "}
						text generations/day
					</span>
				</div>
				<div className="flex items-start gap-2">
					<Volume2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
					<span className="text-sm text-gray-700 dark:text-gray-300">
						{props.voiceGenerations === -1
							? "Unlimited"
							: props.voiceGenerations === 0
								? "No"
								: props.voiceGenerations}{" "}
						voice generations/day
					</span>
				</div>
				{props.features?.priority_support && (
					<div className="flex items-start gap-2">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Priority support
						</span>
					</div>
				)}
				{props.features?.advanced_ai_models && (
					<div className="flex items-start gap-2">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Advanced AI models
						</span>
					</div>
				)}
				{props.features?.early_access && (
					<div className="flex items-start gap-2">
						<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Early access to features
						</span>
					</div>
				)}
			</div>

			{/* Error message */}
			{error && (
				<div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
					{error}
				</div>
			)}

			<button
				type="button"
				disabled={props.isCurrentPlan || isLoading}
				onClick={handleUpgrade}
				className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
					props.isCurrentPlan || isLoading
						? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
						: isPremiumPlus
							? "bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
							: isPopular
								? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
								: "bg-rose-500 hover:bg-rose-600 text-white"
				}`}
			>
				{isLoading
					? "Processing..."
					: props.isCurrentPlan
						? "Current Plan"
						: props.tier === "free"
							? "Current Plan"
							: "Upgrade Now"}
			</button>
		</div>
	);
}
