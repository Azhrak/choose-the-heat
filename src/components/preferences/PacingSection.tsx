import { Wind } from "lucide-react";
import { Heading } from "~/components/Heading";
import { RadioButton } from "~/components/RadioButton";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import {
	PACING_LABELS,
	PACING_OPTIONS,
	type PacingOption,
} from "~/lib/types/preferences";

interface PacingSectionProps {
	selectedPacing: PacingOption;
	onSelect: (pacing: PacingOption) => void;
}

export function PacingSection({
	selectedPacing,
	onSelect,
}: PacingSectionProps) {
	return (
		<Card padding="md">
			<Stack gap="md">
				<Stack gap="sm">
					<div className="flex items-center">
						<Wind className="w-6 h-6 text-romance-500 mr-2" />
						<Heading level="h3" size="section">
							Relationship Pacing
						</Heading>
					</div>
					<p className="text-slate-600 dark:text-gray-300">
						How quickly should relationships develop in your stories?
					</p>
				</Stack>
				<Stack gap="xs">
					{PACING_OPTIONS.map((pacing) => (
						<RadioButton
							key={pacing}
							selected={selectedPacing === pacing}
							onClick={() => onSelect(pacing)}
						>
							<div className="font-semibold text-slate-900 dark:text-gray-100">
								{PACING_LABELS[pacing].label}
							</div>
							<p className="text-sm text-slate-600 dark:text-gray-300">
								{PACING_LABELS[pacing].description}
							</p>
						</RadioButton>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
