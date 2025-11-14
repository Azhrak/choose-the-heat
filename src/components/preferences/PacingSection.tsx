import { RadioButton } from "~/components/RadioButton";
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
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<h3 className="text-xl font-bold text-slate-900 mb-4">
				Relationship Pacing
			</h3>
			<p className="text-slate-600 mb-6">
				How quickly should relationships develop in your stories?
			</p>
			<div className="space-y-3">
				{PACING_OPTIONS.map((pacing) => (
					<RadioButton
						key={pacing}
						selected={selectedPacing === pacing}
						onClick={() => onSelect(pacing)}
					>
						<div className="font-semibold text-slate-900">
							{PACING_LABELS[pacing].label}
						</div>
						<p className="text-sm text-slate-600">
							{PACING_LABELS[pacing].description}
						</p>
					</RadioButton>
				))}
			</div>
		</div>
	);
}
