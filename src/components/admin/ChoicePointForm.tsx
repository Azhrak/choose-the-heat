import { Plus, Trash2, X } from "lucide-react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { FormTextarea } from "~/components/FormTextarea";

export interface ChoiceOption {
	id: string;
	text: string;
	tone: string;
	impact: string;
}

export interface ChoicePoint {
	scene_number: number;
	prompt_text: string;
	options: ChoiceOption[];
}

interface ChoicePointFormProps {
	choicePoints: ChoicePoint[];
	onChange: (choicePoints: ChoicePoint[]) => void;
	maxScenes: number;
}

export function ChoicePointForm({
	choicePoints,
	onChange,
	maxScenes,
}: ChoicePointFormProps) {
	const maxChoicePoints = maxScenes - 1;

	const addChoicePoint = () => {
		if (choicePoints.length >= maxChoicePoints) {
			return;
		}

		// Find the next available scene number
		const usedSceneNumbers = new Set(choicePoints.map((cp) => cp.scene_number));
		let nextSceneNumber = 1;
		while (
			usedSceneNumbers.has(nextSceneNumber) &&
			nextSceneNumber <= maxScenes
		) {
			nextSceneNumber++;
		}

		const newChoicePoint: ChoicePoint = {
			scene_number: nextSceneNumber,
			prompt_text: "",
			options: [
				{ id: "option-1", text: "", tone: "", impact: "" },
				{ id: "option-2", text: "", tone: "", impact: "" },
			],
		};

		onChange([...choicePoints, newChoicePoint]);
	};

	const removeChoicePoint = (index: number) => {
		onChange(choicePoints.filter((_, i) => i !== index));
	};

	const updateChoicePoint = (index: number, updates: Partial<ChoicePoint>) => {
		const updated = [...choicePoints];
		updated[index] = { ...updated[index], ...updates };
		onChange(updated);
	};

	const addOption = (choicePointIndex: number) => {
		const choicePoint = choicePoints[choicePointIndex];
		if (choicePoint.options.length >= 4) {
			return;
		}

		const nextOptionId = `option-${choicePoint.options.length + 1}`;
		const updatedOptions = [
			...choicePoint.options,
			{ id: nextOptionId, text: "", tone: "", impact: "" },
		];

		updateChoicePoint(choicePointIndex, { options: updatedOptions });
	};

	const removeOption = (choicePointIndex: number, optionIndex: number) => {
		const choicePoint = choicePoints[choicePointIndex];
		if (choicePoint.options.length <= 2) {
			return; // Minimum 2 options required
		}

		const updatedOptions = choicePoint.options.filter(
			(_, i) => i !== optionIndex,
		);
		updateChoicePoint(choicePointIndex, { options: updatedOptions });
	};

	const updateOption = (
		choicePointIndex: number,
		optionIndex: number,
		updates: Partial<ChoiceOption>,
	) => {
		const choicePoint = choicePoints[choicePointIndex];
		const updatedOptions = [...choicePoint.options];
		updatedOptions[optionIndex] = {
			...updatedOptions[optionIndex],
			...updates,
		};

		updateChoicePoint(choicePointIndex, { options: updatedOptions });
	};

	// Available scene numbers for dropdown
	const getAvailableSceneNumbers = (currentSceneNumber: number) => {
		const usedSceneNumbers = new Set(
			choicePoints
				.map((cp) => cp.scene_number)
				.filter((num) => num !== currentSceneNumber),
		);

		return Array.from({ length: maxScenes }, (_, i) => i + 1).filter(
			(num) => !usedSceneNumbers.has(num),
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Choice Points
					</h3>
					<p className="text-sm text-slate-600 mt-1">
						Add choice points that appear after scenes. Maximum{" "}
						{maxChoicePoints} choice points (one after each scene, except the
						last).
					</p>
				</div>
				<Button
					type="button"
					onClick={addChoicePoint}
					variant="secondary"
					disabled={choicePoints.length >= maxChoicePoints}
				>
					<Plus className="w-4 h-4" />
					Add Choice Point
				</Button>
			</div>

			{choicePoints.length === 0 ? (
				<div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
					<p className="text-slate-600">No choice points added yet.</p>
					<p className="text-sm text-slate-500 mt-1">
						Click "Add Choice Point" to create your first choice point.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{choicePoints.map((choicePoint, cpIndex) => (
						<div
							key={`choice-point-${choicePoint.scene_number}-${cpIndex}`}
							className="bg-slate-50 border border-slate-200 rounded-lg p-6"
						>
							{/* Choice Point Header */}
							<div className="flex items-center justify-between mb-4">
								<h4 className="text-md font-semibold text-slate-900">
									Choice Point {cpIndex + 1}
								</h4>
								<Button
									type="button"
									onClick={() => removeChoicePoint(cpIndex)}
									variant="ghost"
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<Trash2 className="w-4 h-4" />
									Remove
								</Button>
							</div>

							{/* Scene Number */}
							<div className="mb-4">
								<label
									htmlFor={`scene-number-${cpIndex}`}
									className="block text-sm font-medium text-slate-900 mb-2"
								>
									After Scene Number *
								</label>
								<select
									id={`scene-number-${cpIndex}`}
									value={choicePoint.scene_number}
									onChange={(e) =>
										updateChoicePoint(cpIndex, {
											scene_number: Number.parseInt(e.target.value, 10),
										})
									}
									className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									required
								>
									{getAvailableSceneNumbers(choicePoint.scene_number).map(
										(num) => (
											<option key={num} value={num}>
												Scene {num}
											</option>
										),
									)}
								</select>
							</div>

							{/* Prompt Text */}
							<FormTextarea
								label="Prompt Text *"
								id={`prompt-text-${cpIndex}`}
								value={choicePoint.prompt_text}
								onChange={(e) =>
									updateChoicePoint(cpIndex, { prompt_text: e.target.value })
								}
								rows={2}
								placeholder="e.g., How do you respond to their proposal?"
								required
								containerClassName="mb-4"
							/>

							{/* Options */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<p className="block text-sm font-medium text-slate-900">
										Options (2-4 required)
									</p>
									<Button
										type="button"
										onClick={() => addOption(cpIndex)}
										variant="ghost"
										disabled={choicePoint.options.length >= 4}
										className="text-sm"
									>
										<Plus className="w-3 h-3" />
										Add Option
									</Button>
								</div>

								{choicePoint.options.map((option, optIndex) => (
									<div
										key={option.id}
										className="bg-white border border-slate-200 rounded-lg p-4"
									>
										<div className="flex items-center justify-between mb-3">
											<span className="text-sm font-medium text-slate-700">
												Option {optIndex + 1}
											</span>
											{choicePoint.options.length > 2 && (
												<button
													type="button"
													onClick={() => removeOption(cpIndex, optIndex)}
													className="text-red-600 hover:text-red-700"
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
												id={`option-text-${cpIndex}-${optIndex}`}
												value={option.text}
												onChange={(e) =>
													updateOption(cpIndex, optIndex, {
														text: e.target.value,
													})
												}
												className="px-3 py-2 text-sm"
												labelClassName="text-xs"
												placeholder="e.g., Challenge them with skepticism"
												required
											/>

											<div className="grid grid-cols-2 gap-3">
												<FormInput
													label="Tone *"
													type="text"
													id={`option-tone-${cpIndex}-${optIndex}`}
													value={option.tone}
													onChange={(e) =>
														updateOption(cpIndex, optIndex, {
															tone: e.target.value,
														})
													}
													className="px-3 py-2 text-sm"
													labelClassName="text-xs"
													placeholder="e.g., confrontational"
													required
												/>
												<FormInput
													label="Impact *"
													type="text"
													id={`option-impact-${cpIndex}-${optIndex}`}
													value={option.impact}
													onChange={(e) =>
														updateOption(cpIndex, optIndex, {
															impact: e.target.value,
														})
													}
													className="px-3 py-2 text-sm"
													labelClassName="text-xs"
													placeholder="e.g., bold"
													required
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
