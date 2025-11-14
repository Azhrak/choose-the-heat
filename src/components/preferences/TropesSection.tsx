import { Heart } from "lucide-react";
import { TROPE_LABELS, TROPES, type Trope } from "~/lib/types/preferences";

interface TropesSectionProps {
	selectedTropes: Trope[];
	onToggle: (trope: Trope) => void;
}

export function TropesSection({
	selectedTropes,
	onToggle,
}: TropesSectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<div className="flex items-center mb-6">
				<Heart className="w-6 h-6 text-romance-500 mr-2" />
				<h2 className="text-2xl font-bold text-slate-900">Tropes</h2>
			</div>
			<p className="text-slate-600 mb-6">Choose your favorite romance tropes</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{TROPES.map((trope) => (
					<button
						key={trope}
						type="button"
						onClick={() => onToggle(trope)}
						className={`p-4 rounded-lg border-2 transition-all text-left ${
							selectedTropes.includes(trope)
								? "border-romance-500 bg-romance-50 text-romance-700"
								: "border-slate-200 hover:border-romance-300 text-slate-700"
						}`}
					>
						<div className="font-semibold">{TROPE_LABELS[trope]}</div>
					</button>
				))}
			</div>
		</div>
	);
}
