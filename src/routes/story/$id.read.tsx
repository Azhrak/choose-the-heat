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
import { useMakeChoiceMutation } from "~/hooks/useMakeChoiceMutation";
import { useStorySceneQuery } from "~/hooks/useStorySceneQuery";
import { api } from "~/lib/api/client";

export const Route = createFileRoute("/story/$id/read")({
	component: ReadingPage,
});

function ReadingPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [selectedOption, setSelectedOption] = useState<number | null>(null);
	const [currentSceneNumber, setCurrentSceneNumber] = useState<number | null>(
		null,
	);

	// Fetch scene data
	const { data, isLoading, error } = useStorySceneQuery(id, currentSceneNumber);

	// Record choice mutation
	const choiceMutation = useMakeChoiceMutation(id);

	const handleChoiceSuccess = (result: {
		completed: boolean;
		nextScene?: number;
	}) => {
		setSelectedOption(null);

		if (result.completed) {
			// Story complete - redirect to library
			navigate({ to: "/library" });
		} else if (result.nextScene !== undefined) {
			// Move to next scene and refetch
			setCurrentSceneNumber(result.nextScene);
		}
	};

	const handleMakeChoice = () => {
		if (selectedOption === null || !data?.choicePoint) return;

		choiceMutation.mutate(
			{
				choicePointId: data.choicePoint.id,
				selectedOption,
			},
			{
				onSuccess: handleChoiceSuccess,
			},
		);
	};

	const handleNavigateScene = (sceneNum: number) => {
		setCurrentSceneNumber(sceneNum);
		setSelectedOption(null);
	};

	if (isLoading) {
		return <FullPageLoader message="Loading your story..." />;
	}

	if (error) {
		return (
			<div className="min-h-screen bg-linear-to-br from-rose-50 via-purple-50 to-pink-50 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center p-8">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h1 className="text-2xl font-bold text-gray-800 mb-2">
						Oops! Something went wrong
					</h1>
					<p className="text-gray-600 mb-6">
						{error instanceof Error ? error.message : "Failed to load scene"}
					</p>
					<Link
						to="/library"
						className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
					>
						<Home className="w-5 h-5" />
						Back to Library
					</Link>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const { scene, story, choicePoint } = data;
	const progress = (scene.number / story.estimatedScenes) * 100;
	const isLastScene = scene.number >= story.estimatedScenes;

	return (
		<div className="min-h-screen bg-linear-to-br from-rose-50 via-purple-50 to-pink-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between mb-3">
						<Link
							to="/library"
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
					<h1 className="text-2xl font-bold text-gray-800 mb-3">
						{story.title}
					</h1>

					{/* Progress Bar */}
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
			</header>

			{/* Main Content */}
			<main className="max-w-2xl mx-auto px-4 py-8">
				{/* Scene Content */}
				<div className="bg-white rounded-xl shadow-lg p-8 mb-6">
					<div className="prose prose-lg max-w-none">
						{scene.content.split("\n\n").map((paragraph) => (
							<p key={paragraph} className="mb-4 text-gray-800 leading-relaxed">
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
					<div className="bg-white rounded-xl shadow-lg p-8 mb-6">
						<div className="flex items-center gap-2 mb-4">
							<Flame className="w-5 h-5 text-rose-500" />
							<h2 className="text-xl font-bold text-gray-800">
								What happens next?
							</h2>
						</div>
						<p className="text-gray-600 mb-6">{choicePoint.promptText}</p>

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
							className="w-full mt-6 bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700"
						>
							<span>Continue Story</span>
							<ChevronRight className="w-5 h-5" />
						</Button>
					</div>
				)}{" "}
				{/* No Choice Point - Continue to Next Scene */}
				{!choicePoint && !isLastScene && (
					<div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
						<p className="text-gray-600 mb-6">Ready to continue?</p>
						<Button
							type="button"
							onClick={async () => {
								const nextScene = scene.number + 1;
								// Update story progress in database
								try {
									await api.patch(`/api/stories/${id}/scene`, {
										currentScene: nextScene,
									});
									// Navigate to next scene
									setCurrentSceneNumber(nextScene);
								} catch (error) {
									console.error("Failed to update scene:", error);
								}
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
					<div className="bg-linear-to-br from-purple-100 to-rose-100 rounded-xl shadow-lg p-8 text-center">
						<Sparkles className="w-16 h-16 text-rose-500 mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-gray-800 mb-2">The End</h2>
						<p className="text-gray-600 mb-6">
							You've completed this story! Thank you for reading.
						</p>
						<Link
							to="/library"
							className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
						>
							<Home className="w-5 h-5" />
							Back to Library
						</Link>
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
							scene.number + 1 > story.currentScene ||
							scene.number >= story.estimatedScenes
						}
						variant="ghost"
						size="sm"
						className="text-gray-600 hover:text-rose-600"
						title={
							scene.number + 1 > story.currentScene
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
