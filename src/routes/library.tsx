import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "~/components/EmptyState";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Header } from "~/components/Header";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { PageContainer } from "~/components/PageContainer";
import type { UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/library")({
	component: LibraryPage,
});

interface Template {
	id: string;
	title: string;
	description: string;
	base_tropes: string[];
	estimated_scenes: number;
	cover_gradient: string;
}

interface UserStory {
	id: string;
	user_id: string;
	template_id: string;
	story_title: string | null;
	current_scene: number;
	status: "in-progress" | "completed";
	created_at: string;
	updated_at: string;
	template: Template;
}

function LibraryPage() {
	const [activeTab, setActiveTab] = useState<"in-progress" | "completed">(
		"in-progress",
	);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const queryClient = useQueryClient();

	// Fetch current user profile
	const { data: profileData } = useQuery({
		queryKey: ["currentUser"],
		queryFn: async () => {
			const response = await fetch("/api/profile", {
				credentials: "include",
			});
			if (!response.ok) return null;
			return response.json() as Promise<{ role: UserRole }>;
		},
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["user-stories", activeTab],
		queryFn: async () => {
			const response = await fetch(`/api/stories/user?status=${activeTab}`, {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch stories");
			return response.json() as Promise<{ stories: UserStory[] }>;
		},
	});

	const deleteStory = useMutation({
		mutationFn: async (storyId: string) => {
			const response = await fetch(`/api/stories/${storyId}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete story");
			}
			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch stories
			queryClient.invalidateQueries({ queryKey: ["user-stories"] });
			setDeletingId(null);
		},
		onError: (error) => {
			console.error("Failed to delete story:", error);
			setDeletingId(null);
			alert("Failed to delete story. Please try again.");
		},
	});

	const handleDeleteClick = (storyId: string, storyTitle: string) => {
		if (
			window.confirm(
				`Are you sure you want to delete "${storyTitle}"? This action cannot be undone.`,
			)
		) {
			setDeletingId(storyId);
			deleteStory.mutate(storyId);
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
							In Progress
						</div>
					</button>
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
										<div className="flex justify-between text-sm text-slate-600 mb-2">
											<span>
												Scene {story.current_scene} of{" "}
												{story.template.estimated_scenes}
											</span>
											<span>
												{Math.round(
													(story.current_scene /
														story.template.estimated_scenes) *
														100,
												)}
												%
											</span>
										</div>
										<div className="w-full bg-slate-200 rounded-full h-2">
											<div
												className="bg-romance-600 h-2 rounded-full transition-all"
												style={{
													width: `${Math.min(
														(story.current_scene /
															story.template.estimated_scenes) *
															100,
														100,
													)}%`,
												}}
											></div>
										</div>
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
										<button
											onClick={() =>
												handleDeleteClick(
													story.id,
													story.story_title || story.template.title,
												)
											}
											disabled={deletingId === story.id}
											className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											title="Delete story"
										>
											{deletingId === story.id ? (
												<div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
											) : (
												<Trash2 className="w-5 h-5" />
											)}
										</button>
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
