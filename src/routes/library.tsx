import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BookOpen,
	Clock,
	Heart,
	Loader2,
	LogOut,
	Sparkles,
	User,
} from "lucide-react";
import { useState } from "react";

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

	const stories = data?.stories || [];

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-romance-50 via-white to-romance-100">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Heart className="w-8 h-8 text-romance-600" fill="currentColor" />
						<span className="text-xl font-bold text-slate-900">
							Spicy Tales
						</span>
					</div>
					<nav className="flex items-center gap-4">
						<Link
							to="/browse"
							className="text-slate-700 hover:text-romance-600 font-medium"
						>
							Browse
						</Link>
						<Link
							to="/library"
							className="text-slate-700 hover:text-romance-600 font-medium"
						>
							My Library
						</Link>
						<Link
							to="/profile"
							className="flex items-center gap-2 text-slate-700 hover:text-romance-600 font-medium"
						>
							<User className="w-4 h-4" />
							Profile
						</Link>
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-romance-600 font-medium"
						>
							<LogOut className="w-4 h-4" />
							Logout
						</button>
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-6xl mx-auto">
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
					{isLoading && (
						<div className="flex justify-center items-center py-20">
							<Loader2 className="w-8 h-8 text-romance-600 animate-spin" />
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
							<p className="text-red-800">Failed to load stories</p>
						</div>
					)}

					{/* Empty State */}
					{!isLoading && !error && stories.length === 0 && (
						<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
							<BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-slate-900 mb-4">
								{activeTab === "in-progress"
									? "No Stories in Progress"
									: "No Completed Stories"}
							</h2>
							<p className="text-slate-600 mb-6">
								Start your first romance adventure from the Browse page
							</p>
							<Link
								to="/browse"
								className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
							>
								Browse Stories
							</Link>
						</div>
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
										className={`h-40 bg-gradient-to-br ${story.template.cover_gradient} flex items-center justify-center`}
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
											<button
												disabled
												className="flex-1 px-4 py-2 bg-slate-300 text-slate-600 rounded-lg font-medium cursor-not-allowed"
												title="Reading interface coming soon"
											>
												{activeTab === "in-progress" ? "Continue" : "Read Again"}
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
