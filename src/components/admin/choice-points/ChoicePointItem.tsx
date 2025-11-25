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

export function ChoicePointItem({
	choicePoint,
	choicePointIndex,
	maxScenes,
	allChoicePoints,
	onUpdate,
	onRemove,
}: ChoicePointItemProps) {
	const addOption = () => {
		if (choicePoint.options.length >= 4) {
			return;
		}

		const nextOptionId = `option-${choicePoint.options.length + 1}`;
		const updatedOptions = [
			...choicePoint.options,
			{ id: nextOptionId, text: "", tone: "", impact: "" },
		];

		onUpdate({ options: updatedOptions });
	};

	const removeOption = (optionIndex: number) => {
		if (choicePoint.options.length <= 2) {
			return; // Minimum 2 options required
		}

		const updatedOptions = choicePoint.options.filter(
			(_, i) => i !== optionIndex,
		);
		onUpdate({ options: updatedOptions });
	};

	const updateOption = (
		optionIndex: number,
		updates: Partial<ChoiceOption>,
	) => {
		const updatedOptions = [...choicePoint.options];
		updatedOptions[optionIndex] = {
			...updatedOptions[optionIndex],
			...updates,
		};

		onUpdate({ options: updatedOptions });
	};

	// Available scene numbers for dropdown
	// Ensures chronological order: each choice point must be after the previous one
	// and before the next one
	const getAvailableSceneNumbers = () => {
		const usedSceneNumbers = new Set(
			allChoicePoints
				.map((cp) => cp.scene_number)
				.filter((num) => num !== choicePoint.scene_number),
		);

		// Find the minimum scene number based on the previous choice point
		let minSceneNumber = 1;
		if (choicePointIndex > 0) {
			// Must be greater than the previous choice point's scene number
			minSceneNumber = allChoicePoints[choicePointIndex - 1].scene_number + 1;
		}

		// Find the maximum scene number based on the next choice point
		let maxSceneNumber = maxScenes - 1;
		if (choicePointIndex < allChoicePoints.length - 1) {
			// Must be less than the next choice point's scene number
			maxSceneNumber = allChoicePoints[choicePointIndex + 1].scene_number - 1;
		}

		// Generate available scene numbers from min to max
		return Array.from({ length: maxScenes - 1 }, (_, i) => i + 1).filter(
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
						Choice Point {choicePointIndex + 1}
					</h4>
					<Button
						type="button"
						onClick={onRemove}
						variant="ghost"
						className="text-red-600 hover:text-red-700 hover:bg-red-50"
					>
						<Trash2 className="w-4 h-4" />
						Remove
					</Button>
				</div>

				{/* Scene Number */}
				<div className="space-y-2">
					<label
						htmlFor={`scene-number-${choicePointIndex}`}
						className="block text-sm font-medium text-slate-900 dark:text-gray-100"
					>
						After Scene Number *
					</label>
					{getAvailableSceneNumbers().length === 0 ? (
						<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
							<p className="text-sm text-amber-800 dark:text-amber-300">
								No available scene numbers. The story has {maxScenes} scenes.
								Please adjust the scene numbers of previous choice points to
								make room for additional choices.
							</p>
						</div>
					) : (
						<select
							id={`scene-number-${choicePointIndex}`}
							value={choicePoint.scene_number}
							onChange={(e) =>
								onUpdate({
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
				</div>

				{/* Prompt Text */}
				<FormTextarea
					label="Prompt Text *"
					id={`prompt-text-${choicePointIndex}`}
					value={choicePoint.prompt_text}
					onChange={(e) => onUpdate({ prompt_text: e.target.value })}
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
							disabled={choicePoint.options.length >= 4}
							className="text-sm"
						>
							<Plus className="w-3 h-3" />
							Add Option
						</Button>
					</div>

					{choicePoint.options.map((option, optIndex) => (
						<ChoicePointOption
							key={option.id}
							option={option}
							optionIndex={optIndex}
							choicePointIndex={choicePointIndex}
							canRemove={choicePoint.options.length > 2}
							onUpdate={(updates) => updateOption(optIndex, updates)}
							onRemove={() => removeOption(optIndex)}
						/>
					))}
				</Stack>
			</Stack>
		</div>
	);
}
