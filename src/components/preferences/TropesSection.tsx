import { Heart } from "lucide-react";
import { Heading } from "~/components/Heading";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { useTropesQuery } from "~/hooks/useTropesQuery";
import type { Trope } from "~/lib/types/preferences";

interface TropesSectionProps {
	selectedTropes: Trope[];
	onToggle: (trope: Trope) => void;
}

export function TropesSection({
	selectedTropes,
	onToggle,
}: TropesSectionProps) {
	const { data: tropesData, isLoading } = useTropesQuery();

	return (
		<Card padding="md">
			<Stack gap="md">
				<div className="flex items-center">
					<Heart className="w-6 h-6 text-romance-500 mr-2" />
					<Heading level="h3" size="section">
						Tropes
					</Heading>
				</div>
				<p className="text-slate-600 dark:text-gray-300">
					Choose your favorite romance tropes
				</p>
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="h-16 bg-slate-100 rounded-lg animate-pulse"
							/>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{tropesData?.tropes.map((trope) => (
							<button
								key={trope.key}
								type="button"
								onClick={() => onToggle(trope.key)}
								className={`p-4 rounded-lg border-2 transition-all text-left ${
									selectedTropes.includes(trope.key)
										? "border-romance-500 bg-romance-50 dark:bg-romance-500/20 text-romance-700 dark:text-pink-200"
										: "border-slate-200 dark:border-gray-600 hover:border-romance-300 dark:hover:border-romance-500 text-slate-700 dark:text-gray-200"
								}`}
							>
								<div className="font-semibold">{trope.label}</div>
								{trope.description && (
									<div className="text-sm text-slate-500 mt-1">
										{trope.description}
									</div>
								)}
							</button>
						))}
					</div>
				)}
			</Stack>
		</Card>
	);
}
