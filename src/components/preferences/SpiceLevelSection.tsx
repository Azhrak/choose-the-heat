import { Flame } from "lucide-react";
import { SPICE_LABELS, type SpiceLevel } from "~/lib/types/preferences";

interface SpiceLevelSectionProps {
	selectedLevel: SpiceLevel;
	onSelect: (level: SpiceLevel) => void;
}

export function SpiceLevelSection({
	selectedLevel,
	onSelect,
}: SpiceLevelSectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<div className="flex items-center mb-6">
				<Flame className="w-6 h-6 text-romance-500 mr-2" />
				<h2 className="text-2xl font-bold text-slate-900">Spice Level</h2>
			</div>
			<p className="text-slate-600 mb-6">
				Set your preferred heat level for intimate scenes
			</p>
			<div className="space-y-3">
				{([1, 2, 3, 4, 5] as SpiceLevel[]).map((level) => (
					<button
						key={level}
						type="button"
						onClick={() => onSelect(level)}
						className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
							selectedLevel === level
								? "border-romance-500 bg-romance-50"
								: "border-slate-200 hover:border-romance-300"
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<div className="flex items-center gap-2">
									<span className="font-semibold text-slate-900">
										{SPICE_LABELS[level].label}
									</span>
									<div className="flex gap-1">
										{Array.from({ length: level }).map((_, i) => (
											<Flame
												key={i}
												className="w-4 h-4 text-romance-500"
												fill="currentColor"
											/>
										))}
									</div>
								</div>
								<p className="text-sm text-slate-600">
									{SPICE_LABELS[level].description}
								</p>
							</div>
							<div
								className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
									selectedLevel === level
										? "border-romance-500 bg-romance-500"
										: "border-slate-300"
								}`}
							>
								{selectedLevel === level && (
									<div className="w-2 h-2 bg-white rounded-full" />
								)}
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
