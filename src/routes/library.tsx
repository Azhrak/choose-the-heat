import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { EmptyState } from "~/components/EmptyState";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Header } from "~/components/Header";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { PageContainer } from "~/components/PageContainer";
import { StoryProgressBar } from "~/components/StoryProgressBar";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useUserStoriesQuery } from "~/hooks/useUserStoriesQuery";
import { useDeleteStoryMutation } from "~/hooks/useDeleteStoryMutation";

export const Route = createFileRoute("/library")({
	component: LibraryPage,
});

function LibraryPage() {
	const [activeTab, setActiveTab] = useState<"in-progress" | "completed">(
		"in-progress",
	);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	const { data, isLoading, error } = useUserStoriesQuery(activeTab);

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
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<Header currentPath="/library" userRole={profileData?.role} />

			<PageContainer maxWidth="2xl">
				<h1 className="text-4xl font-bold text-slate-900 mb-8">My Library</h1>

				{/* Tabs */}
				<div className="flex gap-4 mb-8">
					<button
						onClick={() => setActiveTab("in-progress")}
						className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
							activeTab === "in-progress"
								? "bg-romance-600 text-white"
								: "bg-white text-slate-700 hover:bg-slate-50"
						}`}
					>
						<div className="flex items-center gap-2">
							<Clock className="w-5 h-5" />
							In Progress</div></button>
					<button
						onClick={() => setActiveTab("completed")}
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
		</div>				{/* Loading State */}
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
							<div
								key={story.id}
								className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
							>
								{/* Cover */}
								<div
									className={`h-40 bg-linear-to-br ${story.template.cover_gradient} flex items-center justify-center`}
								>
									<BookOpen className="w-16 h-16 text-white opacity-50" />
								</div>

								{/* Content */}
								<div className="p-6">
									<h3 className="text-xl font-bold text-slate-900 mb-1">
										{story.story_title || story.template.title}
									</h3>
									<p className="text-xs text-slate-500 mb-3">
										Started{" "}
										{new Date(story.created_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</p>
									<p className="text-sm text-slate-600 mb-4 line-clamp-2">
										{story.template.description}
									</p>

									{/* Progress */}
									<div className="mb-4">
										<StoryProgressBar
											currentScene={story.current_scene}
											totalScenes={story.template.estimated_scenes}
										/>
									</div>

									{/* Actions */}
									<div className="flex gap-2">
										<Link
											to="/story/$id/read"
											params={{ id: story.id }}
											className="flex-1 px-4 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors text-center"
										>
											{activeTab === "in-progress"
												? "Continue Reading"
												: "Read Again"}
										</Link>
										<Button onClick={() => handleDeleteClick(story.id, story.story_title || story.template.title)} loading={deletingId === story.id} variant="danger" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100" title="Delete story">
											<Trash2 className="w-5 h-5" />
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</PageContainer>
		</div>
	);
}
