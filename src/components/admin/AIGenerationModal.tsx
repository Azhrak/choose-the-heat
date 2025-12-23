import {
	Edit2,
	MessageSquare,
	RefreshCw,
	Sparkles,
	Tag,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
	GeneratedTemplate,
	GenerateTemplateInput,
} from "~/lib/ai/generateTemplate";
import { Button } from "../Button";
import { LoadingSpinner } from "../LoadingSpinner";
import { Alert } from "../ui/Alert";
import { Card } from "../ui/Card";
import { Stack } from "../ui/Stack";
import { Text } from "../ui/Text";
import { TemplatePreview } from "./TemplatePreview";
import { TropeSelector } from "./TropeSelector";

interface AIGenerationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAccept: (template: GeneratedTemplate) => void;
}

type ModalState =
	| { type: "select" }
	| { type: "prompt-input" }
	| { type: "trope-input"; selectedTropes: string[] }
	| { type: "generating"; mode: string }
	| {
			type: "preview";
			template: GeneratedTemplate;
			warnings?: string[];
			lastInput: GenerateTemplateInput;
	  }
	| { type: "error"; error: string; lastInput?: GenerateTemplateInput };

/**
 * AIGenerationModal - Modal for AI-powered template generation
 * Follows props object pattern (no destructuring)
 *
 * @param props.isOpen - Whether modal is visible
 * @param props.onClose - Callback to close modal
 * @param props.onAccept - Callback when template is accepted
 */
export function AIGenerationModal(props: AIGenerationModalProps) {
	const [state, setState] = useState<ModalState>({ type: "select" });
	const [promptInput, setPromptInput] = useState("");
	const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

	// Reset to select mode when modal opens
	useEffect(() => {
		if (props.isOpen) {
			setState({ type: "select" });
			setPromptInput("");
			setShowCloseConfirmation(false);
		}
	}, [props.isOpen]);

	// Handle close attempts - show confirmation if in preview state
	const handleCloseAttempt = () => {
		if (state.type === "preview") {
			setShowCloseConfirmation(true);
		} else if (state.type !== "generating") {
			onClose();
		}
	};

	const confirmClose = () => {
		setShowCloseConfirmation(false);
		props.onClose();
	};

	// Close modal with escape key
	useEffect(() => {
		if (!props.isOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (showCloseConfirmation) {
					setShowCloseConfirmation(false);
				} else if (state.type === "preview") {
					setShowCloseConfirmation(true);
				} else if (state.type !== "generating") {
					props.onClose();
				}
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [props.isOpen, props.onClose, state.type, showCloseConfirmation]);

	const handleGenerate = async (input: GenerateTemplateInput) => {
		setState({ type: "generating", mode: input.mode });

		try {
			const response = await fetch("/api/admin/templates/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate template");
			}

			setState({
				type: "preview",
				template: data.template,
				warnings: data.warnings || [],
				lastInput: input,
			});
		} catch (error) {
			setState({
				type: "error",
				error: error instanceof Error ? error.message : "Unknown error",
				lastInput: input,
			});
		}
	};

	const handleAccept = () => {
		if (state.type === "preview") {
			props.onAccept(state.template);
		}
	};

	const handleRegenerate = () => {
		if (state.type === "preview" && state.lastInput) {
			handleGenerate(state.lastInput);
		}
	};

	const returnToInput = () => {
		if (state.type === "preview" || state.type === "error") {
			const input =
				state.type === "preview" ? state.lastInput : state.lastInput;
			if (!input) {
				setState({ type: "select" });
				return;
			}

			if (input.mode === "prompt") {
				setPromptInput(input.prompt || "");
				setState({ type: "prompt-input" });
			} else if (input.mode === "trope-based") {
				setState({
					type: "trope-input",
					selectedTropes: input.selectedTropes || [],
				});
			} else {
				setState({ type: "select" });
			}
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop */}
			<button
				type="button"
				className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				onClick={handleCloseAttempt}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						handleCloseAttempt();
					}
				}}
				aria-label="Close modal"
			/>
			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<Card
					padding="lg"
					className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto"
				>
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-2 text-romance-600 dark:text-romance-400">
							<Sparkles className="w-6 h-6" />
							<h3 className="text-2xl font-bold">Generate with AI</h3>
						</div>
						{state.type !== "generating" && (
							<button
								type="button"
								onClick={handleCloseAttempt}
								className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
								aria-label="Close"
							>
								<X className="w-6 h-6" />
							</button>
						)}
					</div>

					{/* Content based on state */}
					{state.type === "select" && (
						<SelectMode
							onSelectPrompt={() => setState({ type: "prompt-input" })}
							onSelectTropeBased={() =>
								setState({ type: "trope-input", selectedTropes: [] })
							}
							onSelectRandom={() => handleGenerate({ mode: "random" })}
						/>
					)}

					{state.type === "prompt-input" && (
						<PromptInput
							value={promptInput}
							onChange={setPromptInput}
							onGenerate={() =>
								handleGenerate({ mode: "prompt", prompt: promptInput })
							}
							onBack={() => setState({ type: "select" })}
						/>
					)}

					{state.type === "trope-input" && (
						<TropeInput
							selectedTropes={state.selectedTropes}
							onTropesChange={(tropes) =>
								setState({ type: "trope-input", selectedTropes: tropes })
							}
							onGenerate={() =>
								handleGenerate({
									mode: "trope-based",
									selectedTropes: state.selectedTropes,
								})
							}
							onBack={() => setState({ type: "select" })}
						/>
					)}

					{state.type === "generating" && <GeneratingState mode={state.mode} />}

					{state.type === "preview" && (
						<PreviewState
							template={state.template}
							warnings={state.warnings}
							onAccept={handleAccept}
							onRegenerate={handleRegenerate}
							onModify={returnToInput}
							onCancel={handleCloseAttempt}
						/>
					)}

					{state.type === "error" && (
						<ErrorState
							error={state.error}
							onRetry={() =>
								state.lastInput
									? handleGenerate(state.lastInput)
									: setState({ type: "select" })
							}
							onBack={returnToInput}
							onCancel={onClose}
						/>
					)}

					{/* Close Confirmation Dialog */}
					{showCloseConfirmation && (
						<div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center p-4">
							<Card padding="lg" className="max-w-md w-full">
								<Stack gap="md">
									<Stack gap="xs">
										<Text weight="semibold" size="lg">
											Discard Generated Template?
										</Text>
										<Text
											size="sm"
											className="text-slate-600 dark:text-gray-400"
										>
											You have a generated template ready to use. If you close
											now, you'll lose this template and need to generate a new
											one.
										</Text>
									</Stack>
									<Stack direction="horizontal" gap="sm">
										<Button
											variant="ghost"
											onClick={() => setShowCloseConfirmation(false)}
											className="flex-1"
										>
											Keep Working
										</Button>
										<Button
											variant="danger"
											onClick={confirmClose}
											className="flex-1"
										>
											Discard & Close
										</Button>
									</Stack>
								</Stack>
							</Card>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}

// Mode Selection
function SelectMode({
	onSelectPrompt,
	onSelectTropeBased,
	onSelectRandom,
}: {
	onSelectPrompt: () => void;
	onSelectTropeBased: () => void;
	onSelectRandom: () => void;
}) {
	return (
		<Stack gap="md">
			<Text>Choose how you'd like to generate your template:</Text>

			<div className="grid grid-cols-1 gap-4">
				<ModeCard
					icon={<MessageSquare className="w-6 h-6" />}
					title="Simple Prompt"
					description="Describe your story idea in a few words"
					onClick={onSelectPrompt}
				/>
				<ModeCard
					icon={<Tag className="w-6 h-6" />}
					title="Trope-Based"
					description="Select tropes and let AI generate the rest"
					onClick={onSelectTropeBased}
				/>
				<ModeCard
					icon={<Sparkles className="w-6 h-6" />}
					title="Full Random"
					description="Generate a complete surprise romance"
					onClick={onSelectRandom}
				/>
			</div>
		</Stack>
	);
}

function ModeCard({
	icon,
	title,
	description,
	onClick,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-start gap-4 p-4 border-2 border-slate-200 dark:border-gray-700 rounded-lg hover:border-romance-500 dark:hover:border-romance-400 hover:bg-romance-50 dark:hover:bg-romance-900/20 transition-colors text-left group"
		>
			<div className="flex-shrink-0 text-romance-600 dark:text-romance-400 group-hover:scale-110 transition-transform">
				{icon}
			</div>
			<div>
				<Text weight="semibold" className="mb-1">
					{title}
				</Text>
				<Text size="sm" className="text-slate-600 dark:text-gray-400">
					{description}
				</Text>
			</div>
		</button>
	);
}

// Prompt Input
function PromptInput({
	value,
	onChange,
	onGenerate,
	onBack,
}: {
	value: string;
	onChange: (value: string) => void;
	onGenerate: () => void;
	onBack: () => void;
}) {
	return (
		<Stack gap="md">
			<Text>Describe your romance novel concept:</Text>

			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="e.g., A royal prince falls for a commoner artist in a magical kingdom..."
				className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-romance-500 dark:bg-gray-700 dark:text-gray-100 min-h-32 resize-y"
			/>

			<Stack direction="horizontal" gap="sm">
				<Button variant="ghost" onClick={onBack} className="flex-1">
					Back
				</Button>
				<Button
					variant="primary"
					onClick={onGenerate}
					disabled={!value.trim()}
					className="flex-1"
				>
					<Sparkles className="w-5 h-5" />
					Generate
				</Button>
			</Stack>
		</Stack>
	);
}

// Trope Input
function TropeInput({
	selectedTropes,
	onTropesChange,
	onGenerate,
	onBack,
}: {
	selectedTropes: string[];
	onTropesChange: (tropes: string[]) => void;
	onGenerate: () => void;
	onBack: () => void;
}) {
	return (
		<Stack gap="md">
			<TropeSelector
				label="Select Tropes"
				selectedTropeKeys={selectedTropes}
				onChange={onTropesChange}
				required
				helperText="Choose 1-5 tropes for your story"
			/>

			<Stack direction="horizontal" gap="sm">
				<Button variant="ghost" onClick={onBack} className="flex-1">
					Back
				</Button>
				<Button
					variant="primary"
					onClick={onGenerate}
					disabled={selectedTropes.length === 0}
					className="flex-1"
				>
					<Sparkles className="w-5 h-5" />
					Generate
				</Button>
			</Stack>
		</Stack>
	);
}

// Generating State
function GeneratingState({ mode }: { mode: string }) {
	const modeLabels: Record<string, string> = {
		prompt: "based on your prompt",
		"trope-based": "using your selected tropes",
		random: "with a surprise combination",
	};

	return (
		<Stack gap="lg" className="py-12 items-center">
			<LoadingSpinner size="lg" />
			<Stack gap="sm" className="text-center">
				<Text size="lg" weight="semibold">
					Generating your romance template...
				</Text>
				<Text size="sm" className="text-slate-600 dark:text-gray-400">
					Creating {modeLabels[mode] || "your template"}
				</Text>
				<Text size="sm" className="text-slate-500 dark:text-gray-500">
					This may take 10-20 seconds
				</Text>
			</Stack>
		</Stack>
	);
}

// Preview State
function PreviewState({
	template,
	warnings,
	onAccept,
	onRegenerate,
	onModify,
	onCancel,
}: {
	template: GeneratedTemplate;
	warnings?: string[];
	onAccept: () => void;
	onRegenerate: () => void;
	onModify: () => void;
	onCancel: () => void;
}) {
	return (
		<Stack gap="md">
			<Text weight="semibold" size="lg">
				Review Your Template
			</Text>

			<TemplatePreview template={template} warnings={warnings} />

			<Stack
				direction="horizontal"
				gap="sm"
				className="pt-4 border-t border-slate-200 dark:border-gray-700"
			>
				<Button variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="secondary" onClick={onModify}>
					<Edit2 className="w-4 h-4" />
					Modify Input
				</Button>
				<Button variant="secondary" onClick={onRegenerate}>
					<RefreshCw className="w-4 h-4" />
					Regenerate
				</Button>
				<Button variant="primary" onClick={onAccept}>
					Accept & Use Template
				</Button>
			</Stack>
		</Stack>
	);
}

// Error State
function ErrorState({
	error,
	onRetry,
	onBack,
	onCancel,
}: {
	error: string;
	onRetry: () => void;
	onBack: () => void;
	onCancel: () => void;
}) {
	return (
		<Stack gap="md">
			<Alert variant="error">
				<Stack gap="sm">
					<Text weight="semibold">Generation Failed</Text>
					<Text size="sm">{error}</Text>
				</Stack>
			</Alert>

			<Stack direction="horizontal" gap="sm">
				<Button variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="secondary" onClick={onBack}>
					<Edit2 className="w-4 h-4" />
					Modify Input
				</Button>
				<Button variant="primary" onClick={onRetry}>
					<RefreshCw className="w-4 h-4" />
					Try Again
				</Button>
			</Stack>
		</Stack>
	);
}
