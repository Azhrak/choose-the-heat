import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Clock, Sparkles } from "lucide-react";
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
import { useUserStoriesQuery } from "~/hooks/useUserStoriesQuery";

export const Route = createFileRoute("/library")({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			tab: (search.tab as string) === "completed" ? "completed" : "in-progress",
		};
	},
	component: LibraryPage,
});

function LibraryPage() {
	const navigate = useNavigate({ from: "/library" });
	const { tab: activeTab } = Route.useSearch();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	const { data, isLoading, error } = useUserStoriesQuery(
		activeTab as "in-progress" | "completed",
	);

	const deleteStory = useDeleteStoryMutation();

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

	const stories = data?.stories || [];

	return (
		<PageBackground className="flex flex-col min-h-screen">
			<Header currentPath="/library" userRole={profileData?.role} />

			<PageContainer maxWidth="2xl" className="flex-1">
				<div className="space-y-8">
					<Heading level="h1" size="page">
						My Library
					</Heading>
					{/* Tabs */}
					<div className="flex gap-4">
						<button
							type="button"
							onClick={() => navigate({ search: { tab: "in-progress" } })}
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
							onClick={() => navigate({ search: { tab: "completed" } })}
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
					</div>{" "}
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
								activeTab === "in-progress"
									? "No Stories in Progress"
									: "No Completed Stories"
							}
							description="Start your first romance adventure from the Browse page"
							action={{ label: "Browse Stories", href: "/browse" }}
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
									branchedFromStoryId={story.branched_from_story_id}
									branchedAtScene={story.branched_at_scene}
									parentStoryTitle={story.parentStory?.story_title}
									onDelete={handleDeleteClick}
									isDeleting={deletingId === story.id}
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
