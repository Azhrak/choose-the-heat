import { Check, Crown, Sparkles, Star, Volume2, Zap } from "lucide-react";
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
				<div className="mb-4">
					<span className="text-4xl font-bold text-gray-900 dark:text-white">
						${props.priceMonthly.toFixed(2)}
					</span>
					<span className="text-gray-600 dark:text-gray-400">/month</span>
					{props.priceYearly && props.priceYearly > 0 && (
						<p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
							or ${props.priceYearly.toFixed(2)}/year (save{" "}
							{Math.round(
								(1 - props.priceYearly / (props.priceMonthly * 12)) * 100,
							)}
							%)
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

			<button
				type="button"
				disabled={props.isCurrentPlan}
				className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
					props.isCurrentPlan
						? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
						: isPremiumPlus
							? "bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
							: isPopular
								? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
								: "bg-rose-500 hover:bg-rose-600 text-white"
				}`}
			>
				{props.isCurrentPlan
					? "Current Plan"
					: props.tier === "free"
						? "Current Plan"
						: "Upgrade Now"}
			</button>
		</div>
	);
}
