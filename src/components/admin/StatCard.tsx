import type { LucideIcon } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";

interface StatCardProps {
	title: string;
	value: number | string;
	icon: LucideIcon;
	color: string;
}

/**
 * StatCard - Reusable stat card component for admin dashboards
 * Follows props object pattern (no destructuring)
 * Displays a metric with an icon in a colored background
 *
 * @param props.title - Card title text
 * @param props.value - Metric value (number or string)
 * @param props.icon - Lucide icon component
 * @param props.color - Tailwind background color class (e.g., "bg-blue-500")
 */
export function StatCard(props: StatCardProps) {
	const Icon = props.icon;

	return (
		<Card padding="md" className="border border-slate-200 dark:border-gray-700">
			<Stack gap="md">
				<div className="flex items-center justify-between">
					<div
						className={`p-3 rounded-lg ${props.color} bg-opacity-10 dark:bg-opacity-20`}
					>
						<Icon
							className={`w-6 h-6 ${props.color.replace("bg-", "text-")}`}
						/>
					</div>
				</div>
				<Stack gap="xs">
					<h3 className="text-sm font-medium text-slate-600 dark:text-gray-400">
						{props.title}
					</h3>
					<p className="text-3xl font-bold text-slate-900 dark:text-gray-100">
						{props.value}
					</p>
				</Stack>
			</Stack>
		</Card>
	);
}
