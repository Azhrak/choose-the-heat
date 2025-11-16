import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Flame,
	Home,
	Info,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { FullPageLoader } from "~/components/FullPageLoader";
import { Heading } from "~/components/Heading";
import { useMakeChoiceMutation } from "~/hooks/useMakeChoiceMutation";
import { useStorySceneQuery } from "~/hooks/useStorySceneQuery";
import { useUpdateProgressMutation } from "~/hooks/useUpdateProgressMutation";

export const Route = createFileRoute("/story/$id/read")({
	validateSearch: (search: Record<string, unknown>) => {
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

	// Use scene from URL, fallback to null (which uses current_scene from API)
	const currentSceneNumber = sceneFromUrl ?? null;

	// Fetch scene data
	const { data, isLoading, error } = useStorySceneQuery(id, currentSceneNumber);

	// Mutations
	const choiceMutation = useMakeChoiceMutation(id);
	const progressMutation = useUpdateProgressMutation(id);

	const handleChoiceSuccess = (result: {
		completed: boolean;
		nextScene?: number;
	}) => {
		setSelectedOption(null);

		if (result.completed) {
			// Story complete - redirect to library
			navigate({ to: "/library", search: { tab: "completed" } });
		} else if (result.nextScene !== undefined) {
			// Move to next scene and refetch
			navigate({ search: { scene: result.nextScene }, replace: false });
		}
	};

	const handleMakeChoice = () => {
		if (selectedOption === null || !data?.choicePoint) return;

		choiceMutation.mutate(
			{
				choicePointId: data.choicePoint.id,
				selectedOption,
				currentScene: scene.number,
			},
			{
				onSuccess: handleChoiceSuccess,
			},
		);
	};

	const handleNavigateScene = (sceneNum: number) => {
		navigate({ search: { scene: sceneNum }, replace: false });
		setSelectedOption(null);
	};

	if (isLoading) {
		return <FullPageLoader message="Loading your story..." />;
	}

	if (error) {
		return (
			<div className="min-h-screen bg-linear-to-br from-rose-50 via-purple-50 to-pink-50 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center p-8 space-y-4">
					<div className="text-red-500 text-6xl">⚠️</div>
					<div className="space-y-2">
						<Heading level="h1" size="section" className="text-gray-800">
							Oops! Something went wrong
						</Heading>
						<p className="text-gray-600">
							{error instanceof Error ? error.message : "Failed to load scene"}
						</p>
					</div>
					<Link
						to="/library"
						search={{ tab: "completed" }}
						className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition-colors border border-rose-200"
					>
						<Home className="w-5 h-5" />
						Back to Library
					</Link>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const { scene, story, choicePoint, previousChoice } = data;
	const progress = (scene.number / story.estimatedScenes) * 100;
	const isLastScene = scene.number >= story.estimatedScenes;
	const hasAlreadyMadeChoice = previousChoice !== null;

	return (
		<div className="min-h-screen bg-linear-to-br from-rose-50 via-purple-50 to-pink-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
					<div className="flex items-center justify-between">
						<Link
							to="/library"
							search={{ tab: "in-progress" }}
							className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors"
						>
							<ChevronLeft className="w-5 h-5" />
							Back to Library
						</Link>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<BookOpen className="w-4 h-4" />
								Scene {scene.number} of {story.estimatedScenes}
							</div>
							<Link
								to="/story/$id/info"
								params={{ id }}
								className="flex items-center gap-1 text-sm text-gray-600 hover:text-rose-600 transition-colors"
								title="View story info"
							>
								<Info className="w-4 h-4" />
								Info
							</Link>
						</div>
					</div>
					{/* Title */}
					<div className="space-y-3">
						<Heading level="h1" size="section" className="text-gray-800">
							{story.title}
						</Heading>
						{/* Progress Bar */}
						<div>
							<div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="absolute inset-y-0 left-0 bg-linear-to-r from-rose-500 to-purple-600 transition-all duration-500"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<p className="text-xs text-gray-500 mt-1 text-right">
								{Math.round(progress)}% complete
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
				{/* Scene Content */}
				<div className="bg-white rounded-xl shadow-lg p-8">
					<div className="prose prose-lg max-w-none space-y-4">
						{scene.content.split("\n\n").map((paragraph) => (
							<p
								key={paragraph}
								className="text-gray-800 leading-relaxed font-garamond"
							>
								{paragraph}
							</p>
						))}
					</div>

					{/* Reading stats */}
					<div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
						<div className="flex items-center gap-4">
							<span>{scene.wordCount} words</span>
							<span>~{Math.ceil(scene.wordCount / 200)} min read</span>
						</div>
						{!scene.cached && (
							<div className="flex items-center gap-2 text-purple-600">
								<Sparkles className="w-4 h-4" />
								<span>Freshly generated</span>
							</div>
						)}
					</div>
				</div>
				{/* Choice Point */}
				{choicePoint && !isLastScene && (
					<div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Flame className="w-5 h-5 text-rose-500" />
								<Heading level="h2" size="subsection" className="text-gray-800">
									What happens next?
								</Heading>
							</div>
							<p className="text-gray-600">{choicePoint.promptText}</p>
						</div>

						{hasAlreadyMadeChoice ? (
							// Display previous choice in read-only mode
							<>
								<div className="space-y-3">
									{choicePoint.options.map((option, index) => (
										<div
											key={option.text}
											className={`w-full text-left p-4 rounded-lg border-2 ${
												previousChoice === index
													? "border-rose-500 bg-rose-50"
													: "border-gray-200 bg-gray-50"
											}`}
										>
											<div className="flex items-start justify-between">
												<span
													className={`font-medium ${
														previousChoice === index
															? "text-gray-800"
															: "text-gray-400"
													}`}
												>
													{option.text}
												</span>
												<div className="flex items-center gap-2 ml-3">
													{previousChoice === index && (
														<span className="text-xs text-rose-600 bg-rose-100 px-2 py-1 rounded font-medium">
															Your Choice
														</span>
													)}
													<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
														{option.tone}
													</span>
												</div>
											</div>
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
													? "border-rose-500 bg-rose-50"
													: "border-gray-200 hover:border-rose-300 bg-white"
											} ${choiceMutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
										>
											<div className="flex items-start justify-between">
												<span className="font-medium text-gray-800">
													{option.text}
												</span>
												<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-3">
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
				{/* No Choice Point - Continue to Next Scene */}
				{!choicePoint && !isLastScene && (
					<div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
						<p className="text-gray-600">Ready to continue?</p>
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
				{/* Story Complete */}
				{isLastScene && (
					<div className="bg-linear-to-br from-purple-100 to-rose-100 rounded-xl shadow-lg p-8 text-center space-y-4">
						<Sparkles className="w-16 h-16 text-rose-500 mx-auto" />
						<div className="space-y-2">
							<Heading level="h2" size="section" className="text-gray-800">
								The End
							</Heading>
							<p className="text-gray-600">
								You've completed this story! Thank you for reading.
							</p>
						</div>
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
													search: { tab: "completed" },
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
							<Link
								to="/library"
								search={{ tab: "completed" }}
								className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition-colors border border-rose-200"
							>
								<Home className="w-5 h-5" />
								Back to Library
							</Link>
						</div>
					</div>
				)}
				{/* Navigation */}
				<div className="flex items-center justify-between mt-6">
					<Button
						type="button"
						onClick={() => handleNavigateScene(scene.number - 1)}
						disabled={scene.number === 1}
						variant="ghost"
						size="sm"
						className="text-gray-600 hover:text-rose-600"
					>
						<ChevronLeft className="w-5 h-5" />
						Previous Scene
					</Button>

					<Button
						type="button"
						onClick={() => handleNavigateScene(scene.number + 1)}
						disabled={
							scene.number >= story.estimatedScenes ||
							(choicePoint !== null && !hasAlreadyMadeChoice)
						}
						variant="ghost"
						size="sm"
						className="text-gray-600 hover:text-rose-600"
						title={
							choicePoint !== null && !hasAlreadyMadeChoice
								? "Make a choice to unlock the next scene"
								: ""
						}
					>
						Next Scene
						<ChevronRight className="w-5 h-5" />
					</Button>
				</div>
			</main>
		</div>
	);
}
