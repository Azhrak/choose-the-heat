import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Flame,
	GitBranch,
	Home,
	Info,
	Loader2,
	Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BranchConfirmationDialog } from "~/components/BranchConfirmationDialog";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { SceneNavigation } from "~/components/SceneNavigation";
import { LinkButton } from "~/components/ui/LinkButton";
import { Stack } from "~/components/ui/Stack";
import { useBranchStoryMutation } from "~/hooks/useBranchStoryMutation";
import { useCheckExistingBranch } from "~/hooks/useCheckExistingBranch";
import { useMakeChoiceMutation } from "~/hooks/useMakeChoiceMutation";
import { useStreamingScene } from "~/hooks/useStreamingScene";
import { useUpdateProgressMutation } from "~/hooks/useUpdateProgressMutation";
import { calculateStoryProgress } from "~/lib/utils";

export const Route = createFileRoute("/story/$id/read")({
	validateSearch: (search: Record<string, unknown>): { scene?: number } => {
		return {
			scene: search.scene ? Number(search.scene) : undefined,
		};
	},
	component: ReadingPage,
});

function ReadingPage() {
	const { id } = Route.useParams();
	const { scene: sceneFromUrl } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [selectedOption, setSelectedOption] = useState<number | null>(null);
	const [showBranchDialog, setShowBranchDialog] = useState(false);
	const [branchChoice, setBranchChoice] = useState<number | null>(null);
	const [showHeader, setShowHeader] = useState(true);
	const lastUpdatedSceneRef = useRef<number>(0);
	const lastScrollY = useRef(0);

	// Use scene from URL, fallback to null (which uses current_scene from API)
	const currentSceneNumber = sceneFromUrl ?? null;

	// Use streaming hook for scene data
	// Only enable when we have a valid story ID
	const streamingState = useStreamingScene(id, currentSceneNumber, !!id);

	// Mutations
	const choiceMutation = useMakeChoiceMutation(id);
	const progressMutation = useUpdateProgressMutation(id);
	const branchMutation = useBranchStoryMutation(id);

	// Extract data from streaming state
	const sceneMetadata = streamingState.metadata;
	const sceneContent = streamingState.content;
	const isGenerating = streamingState.isStreaming;
	const error = streamingState.error;

	// Check for existing branch when dialog is shown
	const { data: existingBranchData, isLoading: isCheckingExistingBranch } =
		useCheckExistingBranch(
			id,
			sceneMetadata?.scene.number ?? 0,
			sceneMetadata?.choicePoint?.id ?? "",
			branchChoice ?? 0,
			showBranchDialog &&
				branchChoice !== null &&
				!!sceneMetadata?.scene.number &&
				!!sceneMetadata?.choicePoint?.id,
		);

	// Update progress when viewing a scene beyond current progress
	useEffect(() => {
		if (
			sceneMetadata &&
			sceneMetadata.scene.number > sceneMetadata.story.currentScene &&
			sceneMetadata.scene.number !== lastUpdatedSceneRef.current
		) {
			lastUpdatedSceneRef.current = sceneMetadata.scene.number;
			progressMutation.mutate({ currentScene: sceneMetadata.scene.number });
		}
	}, [sceneMetadata, progressMutation]);

	// Handle scroll to hide/show header
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

			// Show header when scrolling up or near the top
			if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
				setShowHeader(true);
			}
			// Hide header when scrolling down
			else if (
				currentScrollY > lastScrollY.current &&
				currentScrollY > scrollThreshold
			) {
				setShowHeader(false);
			}

			lastScrollY.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleChoiceSuccess = (result: {
		completed: boolean;
		nextScene?: number;
	}) => {
		setSelectedOption(null);

		if (result.completed) {
			// Story complete - redirect to library
			navigate({
				to: "/library",
				search: { tab: "completed", favorites: false },
			});
		} else if (result.nextScene !== undefined) {
			// Move to next scene and refetch
			navigate({ search: { scene: result.nextScene }, replace: false });
		}
	};

	const handleMakeChoice = () => {
		if (selectedOption === null || !sceneMetadata?.choicePoint) return;

		choiceMutation.mutate(
			{
				choicePointId: sceneMetadata.choicePoint.id,
				selectedOption,
				currentScene: sceneMetadata.scene.number,
			},
			{
				onSuccess: handleChoiceSuccess,
			},
		);
	};

	const handleBranchChoice = (optionIndex: number) => {
		if (!sceneMetadata?.choicePoint) return;
		setBranchChoice(optionIndex);
		setShowBranchDialog(true);
	};

	const handleConfirmBranch = () => {
		if (branchChoice === null || !sceneMetadata?.choicePoint) return;

		// If an existing branch exists, navigate to it instead
		if (existingBranchData?.exists && existingBranchData.branch) {
			// Close dialog and reset state before navigating
			setShowBranchDialog(false);
			setBranchChoice(null);
			navigate({
				to: "/story/$id/read",
				params: { id: existingBranchData.branch.id },
				search: { scene: sceneMetadata.scene.number + 1 },
			});
			return;
		}

		// Otherwise create a new branch
		branchMutation.mutate(
			{
				sceneNumber: sceneMetadata.scene.number,
				choicePointId: sceneMetadata.choicePoint.id,
				newChoice: branchChoice,
			},
			{
				onSuccess: (result) => {
					// Close dialog and reset state before navigating
					setShowBranchDialog(false);
					setBranchChoice(null);
					// Navigate to the new branched story
					navigate({
						to: "/story/$id/read",
						params: { id: result.storyId },
						search: { scene: sceneMetadata.scene.number + 1 },
					});
				},
			},
		);
	};

	const handleNavigateToExistingBranch = () => {
		if (existingBranchData?.branch && sceneMetadata) {
			// Close dialog and reset state before navigating
			setShowBranchDialog(false);
			setBranchChoice(null);
			navigate({
				to: "/story/$id/read",
				params: { id: existingBranchData.branch.id },
				search: { scene: sceneMetadata.scene.number + 1 },
			});
		}
	};

	const handleNavigateScene = (sceneNum: number) => {
		// Scroll to top of content area smoothly
		window.scrollTo({ top: 0, behavior: "smooth" });
		navigate({ search: { scene: sceneNum }, replace: false });
		setSelectedOption(null);
	};

	// Show error if streaming failed
	if (error) {
		return (
			<div className="min-h-screen bg-linear-to-br from-rose-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center p-8 space-y-4">
					<div className="text-red-500 text-6xl">⚠️</div>
					<Stack gap="xs">
						<Heading
							level="h1"
							size="section"
							className="text-gray-800 dark:text-gray-100"
						>
							Oops! Something went wrong
						</Heading>
						<p className="text-gray-600 dark:text-gray-300">{error}</p>
					</Stack>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							type="button"
							onClick={() => streamingState.retry()}
							variant="primary"
							className="bg-purple-600 hover:bg-purple-700"
						>
							<Sparkles className="w-5 h-5" />
							<span>Retry Generation</span>
						</Button>
						<LinkButton
							to="/library"
							search={{ tab: "in-progress", favorites: false }}
							variant="secondary"
							className="border border-rose-200 dark:border-gray-700 text-rose-600 dark:text-rose-400"
						>
							<Home className="w-5 h-5" />
							Back to Library
						</LinkButton>
					</div>
				</div>
			</div>
		);
	}

	// Wait for metadata before rendering
	if (!sceneMetadata) {
		return null;
	}

	// Extract data from metadata
	const scene = sceneMetadata.scene;
	const story = sceneMetadata.story;
	const choicePoint = sceneMetadata.choicePoint;
	const previousChoice = sceneMetadata.previousChoice;
	const { percentage: progress } = calculateStoryProgress(
		scene.number,
		story.estimatedScenes,
		story.status as "in-progress" | "completed",
	);
	const isLastScene = scene.number >= story.estimatedScenes;
	const hasAlreadyMadeChoice = previousChoice !== null;

	return (
		<div className="min-h-screen bg-linear-to-br from-rose-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
			{/* Header */}
			<header
				className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-rose-200 dark:border-gray-700 sticky top-0 z-10 transition-transform duration-300 ${
					showHeader ? "translate-y-0" : "-translate-y-full"
				}`}
			>
				<div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
					<div className="flex items-center justify-between">
						<LinkButton
							to="/library"
							search={{ tab: "in-progress", favorites: false }}
							variant="ghost"
							size="sm"
							className="text-gray-600 hover:text-rose-600"
						>
							<ChevronLeft className="w-5 h-5" />
							Back to Library
						</LinkButton>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
								<BookOpen className="w-4 h-4" />
								Scene {scene.number} of {story.estimatedScenes}
							</div>
							<LinkButton
								to="/story/$id/info"
								params={{ id }}
								variant="ghost"
								size="sm"
								className="text-sm text-gray-600 hover:text-rose-600"
								title="View story info"
							>
								<Info className="w-4 h-4" />
								Info
							</LinkButton>
						</div>
					</div>
					{/* Title */}
					<div className="space-y-3">
						<Heading
							level="h1"
							size="section"
							className="text-gray-800 dark:text-gray-100"
						>
							{story.title}
						</Heading>
						{/* Progress Bar */}
						<div>
							<div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
								<div
									className="absolute inset-y-0 left-0 bg-linear-to-r from-rose-500 to-purple-600 transition-all duration-500"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
								{Math.round(progress)}% complete
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Scene Navigation */}
			<div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
				<SceneNavigation
					currentScene={scene.number}
					totalScenes={story.estimatedScenes}
					hasChoicePoint={choicePoint !== null}
					hasAlreadyMadeChoice={hasAlreadyMadeChoice}
					onNavigateScene={handleNavigateScene}
				/>
			</div>

			{/* Main Content - key ensures this section re-renders when scene changes */}
			<main
				key={scene.number}
				className="max-w-2xl mx-auto px-4 pb-8 space-y-6"
			>
				{/* Scene Content */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
					{/* Show streaming indicator while generating */}
					{isGenerating && sceneContent && (
						<div className="mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm">
							<Loader2 className="w-4 h-4 animate-spin" />
							<span>Generating your story...</span>
						</div>
					)}
					<div className="prose prose-lg max-w-none space-y-4">
						{sceneContent?.trim() ? (
							sceneContent.split("\n\n").map((paragraph: string) => (
								<p
									key={paragraph.substring(0, 50)}
									className="text-gray-800 dark:text-gray-200 leading-relaxed font-garamond"
								>
									{paragraph}
								</p>
							))
						) : isGenerating ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-12 gap-4">
								<p className="text-gray-600 dark:text-gray-400 text-center">
									No content was generated. This sometimes happens with AI
									models.
								</p>
								<Button
									type="button"
									onClick={() => streamingState.retry()}
									variant="primary"
									className="bg-purple-600 hover:bg-purple-700"
								>
									<Sparkles className="w-5 h-5" />
									<span>Retry Generation</span>
								</Button>
							</div>
						)}
					</div>{" "}
					{/* Reading stats - show when complete */}
					{streamingState.isComplete && sceneContent && (
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
							<div className="flex items-center gap-4">
								<span>{sceneContent.split(/\s+/).length} words</span>
								<span>
									~{Math.ceil(sceneContent.split(/\s+/).length / 200)} min read
								</span>
							</div>
							{!scene.cached && (
								<div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
									<Sparkles className="w-4 h-4" />
									<span>Freshly generated</span>
								</div>
							)}
						</div>
					)}
				</div>
				{/* Choice Point - only show when streaming is complete */}
				{streamingState.isComplete && choicePoint && !isLastScene && (
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 space-y-6">
						<Stack gap="sm">
							<div className="flex items-center gap-2">
								<Flame className="w-5 h-5 text-rose-500" />
								<Heading
									level="h2"
									size="subsection"
									className="text-gray-800 dark:text-gray-100"
								>
									What happens next?
								</Heading>
							</div>
							<p className="text-gray-600 dark:text-gray-300">
								{choicePoint.promptText}
							</p>
						</Stack>

						{hasAlreadyMadeChoice ? (
							// Display previous choice in read-only mode
							<>
								<div className="space-y-3">
									{choicePoint.options.map((option, index) => (
										<div
											key={option.text}
											className={`w-full text-left p-4 rounded-lg border-2 ${
												previousChoice === index
													? "border-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-400"
													: "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
											}`}
										>
											<div className="flex items-start justify-between">
												<span
													className={`font-medium ${
														previousChoice === index
															? "text-gray-800 dark:text-gray-200"
															: "text-gray-400 dark:text-gray-400"
													}`}
												>
													{option.text}
												</span>
												<div className="flex items-center gap-2 ml-3">
													{previousChoice === index && (
														<span className="text-xs text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded font-medium">
															Your Choice
														</span>
													)}
													<span className="text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
														{option.tone}
													</span>
												</div>
											</div>
											{/* Branch button for other choices */}
											{previousChoice !== index && (
												<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
													<button
														type="button"
														onClick={() => handleBranchChoice(index)}
														disabled={branchMutation.isPending}
														className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors disabled:opacity-50"
													>
														<GitBranch className="w-4 h-4" />
														<span>Try this choice instead</span>
													</button>
												</div>
											)}
										</div>
									))}
								</div>

								<Button
									type="button"
									onClick={() => {
										const nextScene = scene.number + 1;
										navigate({ search: { scene: nextScene }, replace: false });
									}}
									variant="primary"
									className="w-full bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700"
								>
									<span>Continue Story</span>
									<ChevronRight className="w-5 h-5" />
								</Button>
							</>
						) : (
							// Make a new choice
							<>
								<div className="space-y-3">
									{choicePoint.options.map((option, index) => (
										<button
											key={option.text}
											type="button"
											onClick={() => setSelectedOption(index)}
											disabled={choiceMutation.isPending}
											className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
												selectedOption === index
													? "border-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-400"
													: "border-gray-200 dark:border-gray-600 hover:border-rose-300 dark:hover:border-rose-400 bg-white dark:bg-gray-700"
											} ${choiceMutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
										>
											<div className="flex items-start justify-between">
												<span className="font-medium text-gray-800 dark:text-gray-200">
													{option.text}
												</span>
												<span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded ml-3">
													{option.tone}
												</span>
											</div>
										</button>
									))}
								</div>

								<Button
									type="button"
									onClick={handleMakeChoice}
									disabled={selectedOption === null}
									loading={choiceMutation.isPending}
									variant="primary"
									className="w-full bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700"
								>
									<span>Continue Story</span>
									<ChevronRight className="w-5 h-5" />
								</Button>
							</>
						)}
					</div>
				)}{" "}
				{/* No Choice Point - Continue to Next Scene - only show when streaming is complete and content exists */}
				{streamingState.isComplete &&
					!choicePoint &&
					!isLastScene &&
					sceneContent?.trim() && (
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center space-y-6">
							<p className="text-gray-600 dark:text-gray-300">
								Ready to continue?
							</p>
							<Button
								type="button"
								onClick={() => {
									const nextScene = scene.number + 1;
									// Just navigate to next scene, don't mark as complete
									navigate({ search: { scene: nextScene }, replace: false });
								}}
								variant="primary"
								className="bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700"
							>
								<span>Continue to Next Scene</span>
								<ChevronRight className="w-5 h-5" />
							</Button>
						</div>
					)}
				{/* Story Complete - only show when streaming is complete */}
				{streamingState.isComplete && isLastScene && (
					<div className="bg-linear-to-br from-purple-100 to-rose-100 dark:from-purple-900/30 dark:to-rose-900/30 rounded-xl shadow-lg p-8 text-center space-y-4">
						<Sparkles className="w-16 h-16 text-rose-500 mx-auto" />
						<Stack gap="xs">
							<Heading
								level="h2"
								size="section"
								className="text-gray-800 dark:text-gray-100"
							>
								The End
							</Heading>
							<p className="text-gray-600 dark:text-gray-300">
								You've completed this story! Thank you for reading.
							</p>
						</Stack>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button
								type="button"
								onClick={() => {
									progressMutation.mutate(
										{ currentScene: scene.number + 1 },
										{
											onSuccess: () => {
												// Redirect to library after marking complete
												navigate({
													to: "/library",
													search: { tab: "completed", favorites: false },
												});
											},
										},
									);
								}}
								disabled={progressMutation.isPending}
								variant="primary"
								className="bg-rose-600 hover:bg-rose-700"
							>
								<Sparkles className="w-5 h-5" />
								<span>
									{progressMutation.isPending
										? "Marking Complete..."
										: "Mark as Completed"}
								</span>
							</Button>
							<LinkButton
								to="/library"
								search={{ tab: "completed", favorites: false }}
								variant="secondary"
								className="border border-rose-200 dark:border-gray-600 text-rose-600 dark:text-rose-400"
							>
								<Home className="w-5 h-5" />
								Back to Library
							</LinkButton>
						</div>
					</div>
				)}
				{/* Navigation */}
				<div className="mt-6">
					<SceneNavigation
						currentScene={scene.number}
						totalScenes={story.estimatedScenes}
						hasChoicePoint={choicePoint !== null}
						hasAlreadyMadeChoice={hasAlreadyMadeChoice}
						onNavigateScene={handleNavigateScene}
					/>
				</div>
			</main>

			{/* Branch Confirmation Dialog */}
			{sceneMetadata && branchChoice !== null && (
				<BranchConfirmationDialog
					isOpen={showBranchDialog}
					onClose={() => {
						setShowBranchDialog(false);
						setBranchChoice(null);
					}}
					onConfirm={handleConfirmBranch}
					onNavigateToExisting={handleNavigateToExistingBranch}
					storyTitle={story.title}
					sceneNumber={scene.number}
					originalChoice={choicePoint?.options[previousChoice ?? 0]?.text ?? ""}
					newChoice={choicePoint?.options[branchChoice]?.text ?? ""}
					existingBranch={existingBranchData?.branch}
					isCheckingExisting={isCheckingExistingBranch}
					isLoading={branchMutation.isPending}
				/>
			)}
		</div>
	);
}
