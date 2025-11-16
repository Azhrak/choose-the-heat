import { createFileRoute, Link } from "@tanstack/react-router";
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
	X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { FullPageLoader } from "~/components/FullPageLoader";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { StoryProgressBar } from "~/components/StoryProgressBar";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useStoryQuery } from "~/hooks/useStoryQuery";
import { useUpdateStoryTitleMutation } from "~/hooks/useUpdateStoryTitleMutation";
import type { UserPreferences } from "~/lib/types/preferences";
import {
	GENRE_LABELS,
	PACING_LABELS,
	SCENE_LENGTH_LABELS,
	SPICE_LABELS,
	TROPE_LABELS,
} from "~/lib/types/preferences";

export const Route = createFileRoute("/story/$id/info")({
	component: StoryInfoPage,
});

function StoryInfoPage() {
	const { id } = Route.useParams();
	const { data: profileData } = useCurrentUserQuery();
	const { data, isLoading, error } = useStoryQuery(id);
	const updateTitleMutation = useUpdateStoryTitleMutation();

	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [titleError, setTitleError] = useState("");

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
				<div className="space-y-6">
					{/* Back Navigation */}
					<Link
						to="/library"
						search={{ tab: "in-progress" }}
						className="inline-flex items-center gap-2 text-romance-600 hover:text-romance-700 font-medium transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Library
					</Link>

					{/* Story Header */}
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						{/* Cover */}
						<div
							className={`h-64 bg-linear-to-br ${story.template.cover_gradient} flex items-center justify-center`}
						>
							<BookOpen className="w-24 h-24 text-white opacity-50" />
						</div>

						{/* Title & Metadata */}
						<div className="p-8 space-y-4">
							<div className="space-y-2">
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
											className="text-slate-600 hover:text-slate-900"
											title="Edit title"
										>
											<Pencil className="w-5 h-5" />
										</Button>
									</div>
								) : (
									<div className="space-y-2">
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
									</div>
								)}
								<p className="text-slate-600">{story.template.description}</p>
							</div>

							<div className="flex items-center gap-6 text-sm text-slate-500">
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
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-slate-700">
										Reading Progress
									</span>
									<span className="text-sm text-slate-600">
										Scene {story.current_scene} of{" "}
										{story.template.estimated_scenes}
									</span>
								</div>
								<StoryProgressBar
									currentScene={story.current_scene}
									totalScenes={story.template.estimated_scenes}
								/>
							</div>

							{/* Action Button */}
							<Link
								to="/story/$id/read"
								params={{ id: story.id }}
								search={{ scene: undefined }}
								className="inline-flex items-center justify-center px-6 py-3 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors"
							>
								{story.status === "completed"
									? "Read Again"
									: "Continue Reading"}
							</Link>
						</div>
					</div>

					{/* Story Preferences */}
					{preferences && (
						<div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
							<Heading level="h2" size="section">
								Story Settings
							</Heading>

							<div className="space-y-6">
								{/* Spice Level */}
								{spiceInfo && (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Flame className="w-5 h-5 text-romance-600" />
											<Heading level="h3" size="subsection">
												Spice Level
											</Heading>
										</div>
										<div className="pl-7 space-y-1">
											<div className="flex items-center gap-2">
												<span className="text-2xl font-bold text-romance-600">
													{preferences.spiceLevel}
												</span>
												<span className="text-lg font-medium text-slate-700">
													{spiceInfo.label}
												</span>
											</div>
											<p className="text-sm text-slate-600">
												{spiceInfo.description}
											</p>
										</div>
									</div>
								)}

								{/* Pacing */}
								{pacingInfo && (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Timer className="w-5 h-5 text-romance-600" />
											<Heading level="h3" size="subsection">
												Pacing
											</Heading>
										</div>
										<div className="pl-7 space-y-1">
											<p className="font-medium text-slate-700">
												{pacingInfo.label}
											</p>
											<p className="text-sm text-slate-600">
												{pacingInfo.description}
											</p>
										</div>
									</div>
								)}

								{/* Scene Length */}
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<FileText className="w-5 h-5 text-romance-600" />
										<Heading level="h3" size="subsection">
											Scene Length
										</Heading>
									</div>
									<div className="pl-7 space-y-1">
										<p className="font-medium text-slate-700">
											{sceneLengthInfo.label}
										</p>
										<p className="text-sm text-slate-600">
											{sceneLengthInfo.description} ({sceneLengthInfo.wordCount}
											)
										</p>
									</div>
								</div>

								{/* Genres */}
								{preferences.genres && preferences.genres.length > 0 && (
									<div className="space-y-2">
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
														className="px-3 py-1 bg-romance-50 border border-romance-200 rounded-full text-sm text-romance-700 font-medium"
													>
														{GENRE_LABELS[genre]}
													</span>
												))}
											</div>
										</div>
									</div>
								)}

								{/* Tropes */}
								{preferences.tropes && preferences.tropes.length > 0 && (
									<div className="space-y-2">
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
														className="px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-sm text-pink-700 font-medium"
													>
														{TROPE_LABELS[trope]}
													</span>
												))}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</PageContainer>
		</PageBackground>
	);
}
