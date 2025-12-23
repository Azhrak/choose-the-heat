import { X } from "lucide-react";
import { FormInput } from "~/components/FormInput";

export interface ChoiceOption {
	id: string;
	text: string;
	tone: string;
	impact: string;
}

interface ChoicePointOptionProps {
	option: ChoiceOption;
	optionIndex: number;
	choicePointIndex: number;
	canRemove: boolean;
	onUpdate: (updates: Partial<ChoiceOption>) => void;
	onRemove: () => void;
}

/**
 * ChoicePointOption - Single option within a choice point
 * Follows props object pattern (no destructuring)
 *
 * @param props.option - Choice option data
 * @param props.optionIndex - Index in options array
 * @param props.choicePointIndex - Index of parent choice point
 * @param props.canRemove - Whether option can be removed
 * @param props.onUpdate - Callback when option updates
 * @param props.onRemove - Callback to remove option
 */
export function ChoicePointOption(props: ChoicePointOptionProps) {
	return (
		<div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg p-4">
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-slate-700 dark:text-gray-300">
						Option {props.optionIndex + 1}
					</span>
					{props.canRemove && (
						<button
							type="button"
							onClick={props.onRemove}
							className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
							aria-label="Remove option"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>

				<div className="space-y-3">
					<FormInput
						label="Text *"
						type="text"
						id={`option-text-${props.choicePointIndex}-${props.optionIndex}`}
						value={props.option.text}
						onChange={(e) => props.onUpdate({ text: e.target.value })}
						className="px-3 py-2 text-sm"
						labelClassName="text-xs"
						placeholder="e.g., Challenge them with skepticism"
						required
					/>

					<div className="grid grid-cols-2 gap-3">
						<FormInput
							label="Tone *"
							type="text"
							id={`option-tone-${props.choicePointIndex}-${props.optionIndex}`}
							value={props.option.tone}
							onChange={(e) => props.onUpdate({ tone: e.target.value })}
							className="px-3 py-2 text-sm"
							labelClassName="text-xs"
							placeholder="e.g., confrontational"
							required
						/>
						<FormInput
							label="Impact *"
							type="text"
							id={`option-impact-${props.choicePointIndex}-${props.optionIndex}`}
							value={props.option.impact}
							onChange={(e) => props.onUpdate({ impact: e.target.value })}
							className="px-3 py-2 text-sm"
							labelClassName="text-xs"
							placeholder="e.g., bold"
							required
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
