import { Plus } from "lucide-react";
import { Button } from "~/components/Button";
import { Stack } from "~/components/ui/Stack";
import {
	type ChoiceOption,
	type ChoicePoint,
	ChoicePointItem,
} from "./choice-points";

interface ChoicePointFormProps {
	choicePoints: ChoicePoint[];
	onChange: (choicePoints: ChoicePoint[]) => void;
	maxScenes: number;
}

export type { ChoiceOption, ChoicePoint };

/**
 * ChoicePointForm - Form for managing choice points in story templates
 * Follows props object pattern (no destructuring)
 *
 * @param props.choicePoints - Array of choice points
 * @param props.onChange - Callback when choice points change
 * @param props.maxScenes - Maximum number of scenes in template
 */
export function ChoicePointForm(props: ChoicePointFormProps) {
	const maxChoicePoints = props.maxScenes - 1;

	const addChoicePoint = () => {
		if (props.choicePoints.length >= maxChoicePoints) {
			return;
		}

		// Find the next available scene number (must be after the last choice point)
		let nextSceneNumber = 1;
		if (props.choicePoints.length > 0) {
			// Start from after the last choice point's scene number
			const lastSceneNumber =
				props.choicePoints[props.choicePoints.length - 1].scene_number;
			nextSceneNumber = lastSceneNumber + 1;
		}

		// Ensure we don't exceed maxScenes
		if (nextSceneNumber > props.maxScenes) {
			nextSceneNumber = props.maxScenes;
		}

		const newChoicePoint: ChoicePoint = {
			scene_number: nextSceneNumber,
			prompt_text: "",
			options: [
				{ id: "option-1", text: "", tone: "", impact: "" },
				{ id: "option-2", text: "", tone: "", impact: "" },
			],
		};

		props.onChange([...props.choicePoints, newChoicePoint]);
	};

	const removeChoicePoint = (index: number) => {
		props.onChange(props.choicePoints.filter((_, i) => i !== index));
	};

	const updateChoicePoint = (index: number, updates: Partial<ChoicePoint>) => {
		const updated = [...props.choicePoints];
		updated[index] = { ...updated[index], ...updates };
		props.onChange(updated);
	};

	return (
		<Stack gap="md">
			{props.choicePoints.length === 0 ? (
				<div className="text-center py-8 bg-slate-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-gray-600">
					<p className="text-slate-600 dark:text-gray-400">
						No choice points added yet.
					</p>
					<p className="text-sm text-slate-500 dark:text-gray-500 mt-1">
						Click "Add Choice Point" to create your first choice point.
					</p>
				</div>
			) : (
				<Stack gap="md">
					{props.choicePoints.map((choicePoint, cpIndex) => (
						<ChoicePointItem
							key={`choice-point-${choicePoint.scene_number}-${cpIndex}`}
							choicePoint={choicePoint}
							choicePointIndex={cpIndex}
							maxScenes={props.maxScenes}
							allChoicePoints={props.choicePoints}
							onUpdate={(updates) => updateChoicePoint(cpIndex, updates)}
							onRemove={() => removeChoicePoint(cpIndex)}
						/>
					))}
				</Stack>
			)}

			<Button
				type="button"
				onClick={addChoicePoint}
				variant="secondary"
				disabled={props.choicePoints.length >= maxChoicePoints}
				className="w-full"
			>
				<Plus className="w-4 h-4" />
				Add Choice Point
			</Button>
		</Stack>
	);
}
