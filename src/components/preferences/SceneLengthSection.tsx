import { Ruler } from "lucide-react";
import { Heading } from "~/components/Heading";
import { Card } from "~/components/ui";
import { Stack } from "~/components/ui/Stack";
import {
	SCENE_LENGTH_LABELS,
	SCENE_LENGTH_OPTIONS,
	type SceneLengthOption,
} from "~/lib/types/preferences";

interface SceneLengthSectionProps {
	selectedLength: SceneLengthOption;
	onSelect: (length: SceneLengthOption) => void;
}

export function SceneLengthSection({
	selectedLength,
	onSelect,
}: SceneLengthSectionProps) {
	return (
		<Card padding="md">
			<Stack gap="md">
				<Stack gap="sm">
					<div className="flex items-center">
						<Ruler className="w-6 h-6 text-romance-500 mr-2" />
						<Heading level="h3" size="section">
							Scene Length
						</Heading>
					</div>

					<p className="text-slate-600 dark:text-gray-300">
						Choose your preferred scene length
					</p>
				</Stack>
				<Stack gap="xs">
					{SCENE_LENGTH_OPTIONS.map((length) => (
						<button
							key={length}
							type="button"
							onClick={() => onSelect(length)}
							className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
								selectedLength === length
									? "border-romance-500 bg-romance-50 dark:bg-romance-500/20"
									: "border-slate-200 dark:border-gray-600 hover:border-romance-300 dark:hover:border-romance-500"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<div className="font-semibold text-slate-900 dark:text-gray-100">
										{SCENE_LENGTH_LABELS[length].label}
									</div>
									<p className="text-sm text-slate-600 dark:text-gray-300">
										{SCENE_LENGTH_LABELS[length].description}
									</p>
									<p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
										{SCENE_LENGTH_LABELS[length].wordCount}
									</p>
								</div>
								<div
									className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
										selectedLength === length
											? "border-romance-500 bg-romance-500"
											: "border-slate-300 dark:border-gray-600"
									}`}
								>
									{selectedLength === length && (
										<div className="w-2 h-2 bg-white rounded-full" />
									)}
								</div>
							</div>
						</button>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
