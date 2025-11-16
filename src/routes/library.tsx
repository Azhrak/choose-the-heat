import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Clock, Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "~/components/EmptyState";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { StoryCard } from "~/components/StoryCard";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useDeleteStoryMutation } from "~/hooks/useDeleteStoryMutation";
import { useToggleFavoriteMutation } from "~/hooks/useToggleFavoriteMutation";
import { useUserStoriesQuery } from "~/hooks/useUserStoriesQuery";

export const Route = createFileRoute("/library")({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			tab: (search.tab as string) === "completed" ? "completed" : "in-progress",
			favorites: !!(search.favorites === "true" || search.favorites === true),
		};
	},
	component: LibraryPage,
});

function LibraryPage() {
	const navigate = useNavigate({ from: "/library" });
	const { tab: activeTab, favorites: showFavorites } = Route.useSearch();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(
		null,
	);

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	const { data, isLoading, error } = useUserStoriesQuery(
		activeTab as "in-progress" | "completed",
		showFavorites,
	);

	const deleteStory = useDeleteStoryMutation();
	const toggleFavorite = useToggleFavoriteMutation();

	const handleDeleteClick = (storyId: string, storyTitle: string) => {
		if (
			window.confirm(
				`Are you sure you want to delete "${storyTitle}"? This action cannot be undone.`,
			)
		) {
			setDeletingId(storyId);
			deleteStory.mutate(storyId, {
				onSuccess: () => {
					setDeletingId(null);
				},
				onError: (error) => {
					console.error("Failed to delete story:", error);
					setDeletingId(null);
					alert("Failed to delete story. Please try again.");
				},
			});
		}
	};

	const handleToggleFavorite = (storyId: string, isFavorite: boolean) => {
		setTogglingFavoriteId(storyId);
		toggleFavorite.mutate(
			{ storyId, isFavorite },
			{
				onSuccess: () => {
					setTogglingFavoriteId(null);
				},
				onError: (error) => {
					console.error("Failed to toggle favorite:", error);
					setTogglingFavoriteId(null);
					alert("Failed to update favorite status. Please try again.");
				},
			},
		);
	};

	const stories = data?.stories || [];

	return (
		<PageBackground className="flex flex-col min-h-screen">
			<Header currentPath="/library" userRole={profileData?.role} />

			<PageContainer maxWidth="2xl" className="flex-1">
				<div className="space-y-8">
					<Heading level="h1" size="page">
						My Library
					</Heading>

					{/* Tabs and Favorites Filter */}
					<div className="space-y-4">
						{/* Status Tabs */}
						<div className="flex gap-4">
							<button
								type="button"
								onClick={() =>
									navigate({
										search: { tab: "in-progress", favorites: showFavorites },
									})
								}
								className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
									activeTab === "in-progress"
										? "bg-romance-600 text-white"
										: "bg-white text-slate-700 hover:bg-slate-50"
								}`}
							>
								<div className="flex items-center gap-2">
									<Clock className="w-5 h-5" />
									In Progress
								</div>
							</button>
							<button
								type="button"
								onClick={() =>
									navigate({
										search: { tab: "completed", favorites: showFavorites },
									})
								}
								className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
									activeTab === "completed"
										? "bg-romance-600 text-white"
										: "bg-white text-slate-700 hover:bg-slate-50"
								}`}
							>
								<div className="flex items-center gap-2">
									<Sparkles className="w-5 h-5" />
									Completed
								</div>
							</button>
						</div>

						{/* Favorites Filter */}
						<label className="flex items-center gap-3 cursor-pointer w-fit">
							<input
								type="checkbox"
								checked={showFavorites}
								onChange={() =>
									navigate({
										search: { tab: activeTab, favorites: !showFavorites },
									})
								}
								className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
							/>
							<span className="flex items-center gap-2 text-slate-700 font-medium">
								<Heart
									className={`w-4 h-4 ${showFavorites ? "fill-red-600 text-red-600" : "text-slate-400"}`}
								/>
								Show favorites only
							</span>
						</label>
					</div>
					{/* Loading State */}
					{isLoading && <LoadingSpinner />}
					{/* Error State */}
					{error && (
						<ErrorMessage message="Failed to load stories" variant="centered" />
					)}
					{/* Empty State */}
					{!isLoading && !error && stories.length === 0 && (
						<EmptyState
							icon={BookOpen}
							title={
								showFavorites
									? `No Favorite ${activeTab === "in-progress" ? "In Progress" : "Completed"} Stories`
									: activeTab === "in-progress"
										? "No Stories in Progress"
										: "No Completed Stories"
							}
							description={
								showFavorites
									? "Mark stories as favorites by clicking the heart icon"
									: "Start your first romance adventure from the Browse page"
							}
							action={
								showFavorites
									? undefined
									: { label: "Browse Stories", href: "/browse" }
							}
						/>
					)}
					{/* Stories Grid */}
					{!isLoading && !error && stories.length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{stories.map((story) => (
								<StoryCard
									key={story.id}
									id={story.id}
									storyTitle={story.story_title}
									templateTitle={story.template.title}
									templateDescription={story.template.description}
									baseTropes={story.template.base_tropes}
									coverGradient={story.template.cover_gradient}
									createdAt={story.created_at}
									currentScene={story.current_scene}
									totalScenes={story.template.estimated_scenes}
									status={activeTab as "in-progress" | "completed"}
									isFavorite={!!story.favorited_at}
									branchedFromStoryId={story.branched_from_story_id}
									branchedAtScene={story.branched_at_scene}
									parentStoryTitle={story.parentStory?.story_title}
									onDelete={handleDeleteClick}
									onToggleFavorite={handleToggleFavorite}
									isDeleting={deletingId === story.id}
									isTogglingFavorite={togglingFavoriteId === story.id}
								/>
							))}
						</div>
					)}
				</div>
			</PageContainer>
			<Footer />
		</PageBackground>
	);
}
