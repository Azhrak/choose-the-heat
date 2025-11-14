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
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<h3 className="text-xl font-bold text-slate-900 mb-4">Scene Length</h3>
			<p className="text-slate-600 mb-6">Choose your preferred scene length</p>
			<div className="space-y-3">
				{SCENE_LENGTH_OPTIONS.map((length) => (
					<button
						key={length}
						type="button"
						onClick={() => onSelect(length)}
						className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
							selectedLength === length
								? "border-romance-500 bg-romance-50"
								: "border-slate-200 hover:border-romance-300"
						}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="font-semibold text-slate-900">
									{SCENE_LENGTH_LABELS[length].label}
								</div>
								<p className="text-sm text-slate-600">
									{SCENE_LENGTH_LABELS[length].description}
								</p>
								<p className="text-xs text-slate-500 mt-1">
									{SCENE_LENGTH_LABELS[length].wordCount}
								</p>
							</div>
							<div
								className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
									selectedLength === length
										? "border-romance-500 bg-romance-500"
										: "border-slate-300"
								}`}
							>
								{selectedLength === length && (
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
