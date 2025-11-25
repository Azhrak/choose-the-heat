import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	Calendar,
	Check,
	FileText,
	Flame,
	Heart,
	Pencil,
	Sparkles,
	Timer,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "~/components/admin/ConfirmDialog";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { FullPageLoader } from "~/components/FullPageLoader";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { StoryProgressBar } from "~/components/StoryProgressBar";
import { Stack } from "~/components/ui/Stack";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useDeleteStoryMutation } from "~/hooks/useDeleteStoryMutation";
import { useStoryQuery } from "~/hooks/useStoryQuery";
import { useToggleFavoriteMutation } from "~/hooks/useToggleFavoriteMutation";
import { useTropeMap } from "~/hooks/useTropesQuery";
import { useUpdateStoryTitleMutation } from "~/hooks/useUpdateStoryTitleMutation";
import type { UserPreferences } from "~/lib/types/preferences";
import {
	GENRE_LABELS,
	PACING_LABELS,
	SCENE_LENGTH_LABELS,
	SPICE_LABELS,
} from "~/lib/types/preferences";

export const Route = createFileRoute("/story/$id/info")({
	component: StoryInfoPage,
});

function StoryInfoPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { data: profileData } = useCurrentUserQuery();
	const { data, isLoading, error } = useStoryQuery(id);
	const updateTitleMutation = useUpdateStoryTitleMutation();
	const deleteStoryMutation = useDeleteStoryMutation();
	const toggleFavoriteMutation = useToggleFavoriteMutation();
	const tropeMap = useTropeMap();

	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [titleError, setTitleError] = useState("");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleStartEdit = () => {
		if (data?.story) {
			setEditedTitle(data.story.story_title || data.story.template.title);
			setIsEditingTitle(true);
			setTitleError("");
		}
	};

	const handleCancelEdit = () => {
		setIsEditingTitle(false);
		setEditedTitle("");
		setTitleError("");
	};

	const handleSaveTitle = async () => {
		const trimmedTitle = editedTitle.trim();

		if (!trimmedTitle) {
			setTitleError("Title cannot be empty");
			return;
		}

		if (trimmedTitle.length > 255) {
			setTitleError("Title must be 255 characters or less");
			return;
		}

		try {
			await updateTitleMutation.mutateAsync({
				storyId: id,
				storyTitle: trimmedTitle,
			});
			setIsEditingTitle(false);
			setEditedTitle("");
			setTitleError("");
		} catch (error) {
			setTitleError(
				error instanceof Error ? error.message : "Failed to update title",
			);
		}
	};

	const handleDeleteStory = async () => {
		try {
			await deleteStoryMutation.mutateAsync(id);
			// Navigate back to library after successful deletion
			navigate({
				to: "/library",
				search: { tab: "in-progress", favorites: false },
			});
		} catch (error) {
			// Error is handled by the mutation
			console.error("Failed to delete story:", error);
			setShowDeleteDialog(false);
		}
	};

	const handleToggleFavorite = () => {
		const isFavorite = !story.favorited_at;
		toggleFavoriteMutation.mutate({ storyId: id, isFavorite });
	};

	if (isLoading) {
		return <FullPageLoader />;
	}

	if (error || !data?.story) {
		return (
			<PageBackground>
				<Header currentPath="/library" userRole={profileData?.role} />
				<PageContainer maxWidth="2xl">
					<ErrorMessage
						message="Failed to load story information"
						variant="centered"
					/>
				</PageContainer>
			</PageBackground>
		);
	}

	const { story } = data;
	const preferences: UserPreferences | null = story.preferences
		? typeof story.preferences === "string"
			? JSON.parse(story.preferences)
			: story.preferences
		: null;

	const spiceInfo = preferences ? SPICE_LABELS[preferences.spiceLevel] : null;
	const pacingInfo = preferences ? PACING_LABELS[preferences.pacing] : null;
	const sceneLengthInfo = preferences?.sceneLength
		? SCENE_LENGTH_LABELS[preferences.sceneLength]
		: SCENE_LENGTH_LABELS.medium;

	return (
		<PageBackground>
			<Header currentPath="/library" userRole={profileData?.role} />

			<PageContainer maxWidth="2xl">
				<Stack gap="md">
					{/* Back Navigation */}
					<Link
						to="/library"
						search={{ tab: "in-progress", favorites: false }}
						className="inline-flex items-center gap-2 text-romance-600 dark:text-romance-400 hover:text-romance-700 dark:hover:text-romance-300 font-medium transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Library
					</Link>

					{/* Story Header */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
						{/* Cover */}
						<div
							className={`h-64 bg-linear-to-br ${story.template.cover_gradient} flex items-center justify-center relative`}
						>
							<BookOpen className="w-24 h-24 text-white opacity-50" />
							{/* Favorite button */}
							<button
								type="button"
								onClick={handleToggleFavorite}
								disabled={toggleFavoriteMutation.isPending}
								className="absolute top-6 right-6 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
								title={
									story.favorited_at
										? "Remove from favorites"
										: "Add to favorites"
								}
							>
								<Heart
									className={`w-6 h-6 transition-colors ${
										story.favorited_at
											? "fill-red-500 text-red-500"
											: "text-slate-600 dark:text-gray-300 hover:text-red-500"
									}`}
								/>
							</button>
						</div>

						{/* Title & Metadata */}
						<div className="p-8 space-y-4">
							<Stack gap="xs">
								{!isEditingTitle ? (
									<div className="flex items-start gap-3">
										<div className="flex-1">
											<Heading level="h1" size="page">
												{story.story_title || story.template.title}
											</Heading>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleStartEdit}
											className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100"
											title="Edit title"
										>
											<Pencil className="w-5 h-5" />
										</Button>
									</div>
								) : (
									<Stack gap="xs">
										<FormInput
											label="Story Title"
											type="text"
											value={editedTitle}
											onChange={(e) => setEditedTitle(e.target.value)}
											placeholder="Story title"
											maxLength={255}
											autoFocus
											error={titleError}
										/>
										<div className="flex gap-2">
											<Button
												onClick={handleSaveTitle}
												loading={updateTitleMutation.isPending}
												size="sm"
												className="flex items-center gap-2"
											>
												<Check className="w-4 h-4" />
												Save
											</Button>
											<Button
												variant="secondary"
												size="sm"
												onClick={handleCancelEdit}
												disabled={updateTitleMutation.isPending}
												className="flex items-center gap-2"
											>
												<X className="w-4 h-4" />
												Cancel
											</Button>
										</div>
									</Stack>
								)}
								<p className="text-slate-600 dark:text-gray-300">
									{story.template.description}
								</p>
							</Stack>

							<div className="flex items-center gap-6 text-sm text-slate-500 dark:text-gray-400">
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									<span>
										Started{" "}
										{new Date(story.created_at).toLocaleDateString("en-US", {
											month: "long",
											day: "numeric",
											year: "numeric",
										})}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Sparkles className="w-4 h-4" />
									<span>{story.template.estimated_scenes} scenes</span>
								</div>
							</div>

							{/* Progress */}
							<Stack gap="xs">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-slate-700 dark:text-gray-300">
										Reading Progress
									</span>
									<span className="text-sm text-slate-600 dark:text-gray-400">
										Scene {story.current_scene} of{" "}
										{story.template.estimated_scenes}
									</span>
								</div>
								<StoryProgressBar
									currentScene={story.current_scene}
									totalScenes={story.template.estimated_scenes}
								/>
							</Stack>

							{/* Action Button */}
							<div className="flex gap-3 justify-between">
								<Link
									to="/story/$id/read"
									params={{ id: story.id }}
									search={{ scene: undefined }}
									className="inline-flex items-center justify-center px-6 py-3 bg-romance-600 dark:bg-romance-700 text-white rounded-lg font-medium hover:bg-romance-700 dark:hover:bg-romance-800 transition-colors"
								>
									{story.status === "completed"
										? "Read Again"
										: "Continue Reading"}
								</Link>
								<Button
									variant="danger"
									onClick={() => setShowDeleteDialog(true)}
									className="flex items-center gap-2"
									title="Remove story"
								>
									<Trash2 className="w-5 h-5" />
								</Button>
							</div>
						</div>
					</div>

					{/* Story Preferences */}
					{preferences && (
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
							<Heading level="h2" size="section">
								Story Settings
							</Heading>

							<Stack gap="md">
								{/* Spice Level */}
								{spiceInfo && (
									<Stack gap="xs">
										<div className="flex items-center gap-2">
											<Flame className="w-5 h-5 text-romance-600" />
											<Heading level="h3" size="subsection">
												Spice Level
											</Heading>
										</div>
										<div className="pl-7 space-y-1">
											<div className="flex items-center gap-2">
												<span className="text-2xl font-bold text-romance-600 dark:text-romance-400">
													{preferences.spiceLevel}
												</span>
												<span className="text-lg font-medium text-slate-700 dark:text-gray-300">
													{spiceInfo.label}
												</span>
											</div>
											<p className="text-sm text-slate-600 dark:text-gray-400">
												{spiceInfo.description}
											</p>
										</div>
									</Stack>
								)}

								{/* Pacing */}
								{pacingInfo && (
									<Stack gap="xs">
										<div className="flex items-center gap-2">
											<Timer className="w-5 h-5 text-romance-600" />
											<Heading level="h3" size="subsection">
												Pacing
											</Heading>
										</div>
										<div className="pl-7 space-y-1">
											<p className="font-medium text-slate-700 dark:text-gray-300">
												{pacingInfo.label}
											</p>
											<p className="text-sm text-slate-600 dark:text-gray-400">
												{pacingInfo.description}
											</p>
										</div>
									</Stack>
								)}

								{/* Scene Length */}
								<Stack gap="xs">
									<div className="flex items-center gap-2">
										<FileText className="w-5 h-5 text-romance-600" />
										<Heading level="h3" size="subsection">
											Scene Length
										</Heading>
									</div>
									<div className="pl-7 space-y-1">
										<p className="font-medium text-slate-700 dark:text-gray-300">
											{sceneLengthInfo.label}
										</p>
										<p className="text-sm text-slate-600 dark:text-gray-400">
											{sceneLengthInfo.description} ({sceneLengthInfo.wordCount}
											)
										</p>
									</div>
								</Stack>

								{/* Genres */}
								{preferences.genres && preferences.genres.length > 0 && (
									<Stack gap="xs">
										<div className="flex items-center gap-2">
											<BookOpen className="w-5 h-5 text-romance-600" />
											<Heading level="h3" size="subsection">
												Genres
											</Heading>
										</div>
										<div className="pl-7">
											<div className="flex flex-wrap gap-2">
												{preferences.genres.map((genre) => (
													<span
														key={genre}
														className="px-3 py-1 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full text-sm text-romance-700 dark:text-pink-200 font-medium"
													>
														{GENRE_LABELS[genre]}
													</span>
												))}
											</div>
										</div>
									</Stack>
								)}

								{/* Tropes */}
								{preferences.tropes && preferences.tropes.length > 0 && (
									<Stack gap="xs">
										<div className="flex items-center gap-2">
											<Heart className="w-5 h-5 text-romance-600" />
											<Heading level="h3" size="subsection">
												Tropes
											</Heading>
										</div>
										<div className="pl-7">
											<div className="flex flex-wrap gap-2">
												{preferences.tropes.map((trope) => (
													<span
														key={trope}
														className="px-3 py-1 bg-pink-50 dark:bg-pink-500/20 border border-pink-200 dark:border-pink-500/30 rounded-full text-sm text-pink-700 dark:text-pink-200 font-medium"
													>
														{tropeMap[trope] || trope}
													</span>
												))}
											</div>
										</div>
									</Stack>
								)}
							</Stack>
						</div>
					)}
				</Stack>
			</PageContainer>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDeleteStory}
				title="Remove Story"
				message={
					<>
						<p>Are you sure you want to remove this story?</p>
						<p className="mt-2 font-medium dark:text-gray-200">
							This will permanently delete all your progress and choices.
						</p>
					</>
				}
				confirmText="Remove Story"
				confirmVariant="danger"
				loading={deleteStoryMutation.isPending}
			/>
		</PageBackground>
	);
}
