import { Heart } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "~/components/ui/Card";

interface FeatureSectionProps {
	icon: ReactNode;
	title: string;
	description: string;
	features: string[];
}

/**
 * FeatureSection - Displays a feature with icon, title, description, and feature list
 * Used on About page to showcase product features
 *
 * @param props.icon - React node for the feature icon
 * @param props.title - Feature title
 * @param props.description - Feature description
 * @param props.features - Array of feature bullet points
 */
export function FeatureSection(props: FeatureSectionProps) {
	return (
		<Card padding="lg">
			<div className="flex items-start gap-4">
				<div className="shrink-0 text-rose-500 dark:text-rose-400">
					{props.icon}
				</div>
				<div className="flex-1">
					<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
						{props.title}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						{props.description}
					</p>
					<ul className="space-y-2">
						{props.features.map((feature) => (
							<li
								key={feature}
								className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
							>
								<Heart className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
								<span>{feature}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</Card>
	);
}
