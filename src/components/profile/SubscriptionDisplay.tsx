import { Crown, Sparkles, Volume2, ArrowUpCircle } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { LinkButton } from "~/components/ui/LinkButton";
import { Stack } from "~/components/ui/Stack";
import { useSubscriptionTiersQuery, useUserSubscriptionQuery, useUserUsageQuery } from "~/hooks/useSubscriptionQuery";

export function SubscriptionDisplay() {
	const { data: tiers } = useSubscriptionTiersQuery();
	const { data: subscription } = useUserSubscriptionQuery();
	const { data: usage } = useUserUsageQuery();

	const currentTier = subscription?.subscription_tier || 'free';
	const tierInfo = tiers?.find(t => t.tier === currentTier);

	const getTierBadgeColor = (tier: string) => {
		switch (tier) {
			case 'premium_plus':
				return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
			case 'premium':
				return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
			case 'basic':
				return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
			default:
				return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
		}
	};

	const formatLimit = (limit: number) => {
		if (limit === -1) return 'Unlimited';
		if (limit === 0) return 'None';
		return limit.toString();
	};

	const getUsagePercentage = (used: number, limit: number) => {
		if (limit === -1) return 0; // Unlimited
		if (limit === 0) return 100; // No access
		return Math.min((used / limit) * 100, 100);
	};

	const getProgressBarColor = (percentage: number) => {
		if (percentage >= 90) return 'bg-red-500';
		if (percentage >= 70) return 'bg-yellow-500';
		return 'bg-green-500';
	};

	return (
		<Card>
			<Stack gap="md">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Crown className="w-5 h-5 text-romance-500" />
						<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
							Subscription
						</h2>
					</div>
					{tierInfo && (
						<span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTierBadgeColor(currentTier)}`}>
							{tierInfo.name}
						</span>
					)}
				</div>

				{tierInfo && (
					<>
						{/* Pricing Info */}
						<div className="bg-slate-50 dark:bg-gray-800/50 rounded-lg p-4">
							<div className="flex items-baseline gap-2">
								<span className="text-3xl font-bold text-slate-900 dark:text-gray-100">
									${parseFloat(tierInfo.price_monthly).toFixed(2)}
								</span>
								<span className="text-slate-600 dark:text-gray-400">/month</span>
							</div>
							{tierInfo.description && (
								<p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
									{tierInfo.description}
								</p>
							)}
						</div>

						{/* Usage Limits */}
						<Stack gap="sm">
							<h3 className="font-semibold text-slate-700 dark:text-gray-300">
								Today's Usage
							</h3>

							{/* Text Generations */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Sparkles className="w-4 h-4 text-rose-500" />
										<span className="text-sm text-slate-700 dark:text-gray-300">
											Text Generations
										</span>
									</div>
									<span className="text-sm font-semibold text-slate-900 dark:text-gray-100">
										{usage?.text_generations || 0} / {formatLimit(tierInfo.text_generations_per_day)}
									</span>
								</div>
								{tierInfo.text_generations_per_day !== -1 && (
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all ${getProgressBarColor(
												getUsagePercentage(usage?.text_generations || 0, tierInfo.text_generations_per_day)
											)}`}
											style={{
												width: `${getUsagePercentage(usage?.text_generations || 0, tierInfo.text_generations_per_day)}%`
											}}
										/>
									</div>
								)}
							</div>

							{/* Voice Generations */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Volume2 className="w-4 h-4 text-purple-500" />
										<span className="text-sm text-slate-700 dark:text-gray-300">
											Voice Generations
										</span>
									</div>
									<span className="text-sm font-semibold text-slate-900 dark:text-gray-100">
										{usage?.voice_generations || 0} / {formatLimit(tierInfo.voice_generations_per_day)}
									</span>
								</div>
								{tierInfo.voice_generations_per_day !== -1 && tierInfo.voice_generations_per_day !== 0 && (
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all ${getProgressBarColor(
												getUsagePercentage(usage?.voice_generations || 0, tierInfo.voice_generations_per_day)
											)}`}
											style={{
												width: `${getUsagePercentage(usage?.voice_generations || 0, tierInfo.voice_generations_per_day)}%`
											}}
										/>
									</div>
								)}
							</div>
						</Stack>

						{/* Features */}
						{tierInfo.features && (
							<Stack gap="xs">
								<h3 className="font-semibold text-slate-700 dark:text-gray-300">
									Plan Features
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{tierInfo.features.priority_support && (
										<div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
											<span className="w-1.5 h-1.5 rounded-full bg-green-500" />
											Priority Support
										</div>
									)}
									{tierInfo.features.advanced_ai_models && (
										<div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
											<span className="w-1.5 h-1.5 rounded-full bg-green-500" />
											Advanced AI Models
										</div>
									)}
									{tierInfo.features.early_access && (
										<div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
											<span className="w-1.5 h-1.5 rounded-full bg-green-500" />
											Early Access
										</div>
									)}
								</div>
							</Stack>
						)}

						{/* Upgrade Button */}
						{currentTier === 'free' ? (
							<LinkButton to="/subscription" variant="primary" className="flex items-center justify-center gap-2">
								<ArrowUpCircle className="w-4 h-4" />
								Upgrade to Premium
							</LinkButton>
						) : (
							<LinkButton to="/subscription" variant="outline">
								Manage Subscription
							</LinkButton>
						)}
					</>
				)}
			</Stack>
		</Card>
	);
}
