import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/Button";
import { FormTextarea } from "~/components/FormTextarea";
import { Stack } from "~/components/ui/Stack";
import { type ChoiceOption, ChoicePointOption } from "./ChoicePointOption";

export interface ChoicePoint {
	scene_number: number;
	prompt_text: string;
	options: ChoiceOption[];
}

interface ChoicePointItemProps {
	choicePoint: ChoicePoint;
	choicePointIndex: number;
	maxScenes: number;
	allChoicePoints: ChoicePoint[];
	onUpdate: (updates: Partial<ChoicePoint>) => void;
	onRemove: () => void;
}

/**
 * ChoicePointItem - Single choice point editor with options
 * Follows props object pattern (no destructuring)
 *
 * @param props.choicePoint - Choice point data
 * @param props.choicePointIndex - Index in choice points array
 * @param props.maxScenes - Maximum number of scenes in template
 * @param props.allChoicePoints - All choice points for validation
 * @param props.onUpdate - Callback when choice point updates
 * @param props.onRemove - Callback to remove choice point
 */
export function ChoicePointItem(props: ChoicePointItemProps) {
	const addOption = () => {
		if (props.choicePoint.options.length >= 4) {
			return;
		}

		const nextOptionId = `option-${props.choicePoint.options.length + 1}`;
		const updatedOptions = [
			...props.choicePoint.options,
			{ id: nextOptionId, text: "", tone: "", impact: "" },
		];

		props.onUpdate({ options: updatedOptions });
	};

	const removeOption = (optionIndex: number) => {
		if (props.choicePoint.options.length <= 2) {
			return; // Minimum 2 options required
		}

		const updatedOptions = props.choicePoint.options.filter(
			(_, i) => i !== optionIndex,
		);
		props.onUpdate({ options: updatedOptions });
	};

	const updateOption = (
		optionIndex: number,
		updates: Partial<ChoiceOption>,
	) => {
		const updatedOptions = [...props.choicePoint.options];
		updatedOptions[optionIndex] = {
			...updatedOptions[optionIndex],
			...updates,
		};

		props.onUpdate({ options: updatedOptions });
	};

	// Available scene numbers for dropdown
	// Ensures chronological order: each choice point must be after the previous one
	// and before the next one
	const getAvailableSceneNumbers = () => {
		const usedSceneNumbers = new Set(
			props.allChoicePoints
				.map((cp) => cp.scene_number)
				.filter((num) => num !== props.choicePoint.scene_number),
		);

		// Find the minimum scene number based on the previous choice point
		let minSceneNumber = 1;
		if (props.choicePointIndex > 0) {
			// Must be greater than the previous choice point's scene number
			minSceneNumber = props.allChoicePoints[props.choicePointIndex - 1].scene_number + 1;
		}

		// Find the maximum scene number based on the next choice point
		let maxSceneNumber = props.maxScenes - 1;
		if (props.choicePointIndex < props.allChoicePoints.length - 1) {
			// Must be less than the next choice point's scene number
			maxSceneNumber = props.allChoicePoints[props.choicePointIndex + 1].scene_number - 1;
		}

		// Generate available scene numbers from min to max
		return Array.from({ length: props.maxScenes - 1 }, (_, i) => i + 1).filter(
			(num) =>
				num >= minSceneNumber &&
				num <= maxSceneNumber &&
				!usedSceneNumbers.has(num),
		);
	};

	return (
		<div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-6">
			<Stack gap="sm">
				{/* Choice Point Header */}
				<div className="flex items-center justify-between">
					<h4 className="text-md font-semibold text-slate-900 dark:text-gray-100">
						Choice Point {props.choicePointIndex + 1}
					</h4>
					<Button
						type="button"
						onClick={props.onRemove}
						variant="ghost"
						className="text-red-600 hover:text-red-700 hover:bg-red-50"
					>
						<Trash2 className="w-4 h-4" />
						Remove
					</Button>
				</div>

				{/* Scene Number */}
				<Stack gap="xs">
					<label
						htmlFor={`scene-number-${props.choicePointIndex}`}
						className="block text-sm font-medium text-slate-900 dark:text-gray-100"
					>
						After Scene Number *
					</label>
					{getAvailableSceneNumbers().length === 0 ? (
						<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
							<p className="text-sm text-amber-800 dark:text-amber-300">
								No available scene numbers. The story has {props.maxScenes} scenes.
								Please adjust the scene numbers of previous choice points to
								make room for additional choices.
							</p>
						</div>
					) : (
						<select
							id={`scene-number-${props.choicePointIndex}`}
							value={props.choicePoint.scene_number}
							onChange={(e) =>
								props.onUpdate({
									scene_number: Number.parseInt(e.target.value, 10),
								})
							}
							className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
							required
						>
							{getAvailableSceneNumbers().map((num) => (
								<option key={num} value={num}>
									Scene {num}
								</option>
							))}
						</select>
					)}
				</Stack>

				{/* Prompt Text */}
				<FormTextarea
					label="Prompt Text *"
					id={`prompt-text-${props.choicePointIndex}`}
					value={props.choicePoint.prompt_text}
					onChange={(e) => props.onUpdate({ prompt_text: e.target.value })}
					rows={2}
					placeholder="e.g., How do you respond to their proposal?"
					required
				/>

				{/* Options */}
				<Stack gap="sm">
					<div className="flex items-center justify-between">
						<p className="block text-sm font-medium text-slate-900 dark:text-gray-100">
							Options (2-4 required)
						</p>
						<Button
							type="button"
							onClick={addOption}
							variant="ghost"
							disabled={props.choicePoint.options.length >= 4}
							className="text-sm"
						>
							<Plus className="w-3 h-3" />
							Add Option
						</Button>
					</div>

					{props.choicePoint.options.map((option, optIndex) => (
						<ChoicePointOption
							key={option.id}
							option={option}
							optionIndex={optIndex}
							choicePointIndex={props.choicePointIndex}
							canRemove={props.choicePoint.options.length > 2}
							onUpdate={(updates) => updateOption(optIndex, updates)}
							onRemove={() => removeOption(optIndex)}
						/>
					))}
				</Stack>
			</Stack>
		</div>
	);
}
