import { Link } from "@tanstack/react-router";
import { BookOpen, GitBranch, Heart, Info, Trash2 } from "lucide-react";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { StoryProgressBar } from "~/components/StoryProgressBar";
import { TROPE_LABELS } from "~/lib/types/preferences";

interface StoryCardProps {
	id: string;
	storyTitle: string | null;
	templateTitle: string;
	templateDescription: string;
	baseTropes: string[];
	coverGradient: string;
	createdAt: string;
	currentScene: number;
	totalScenes: number;
	status: "in-progress" | "completed";
	isFavorite: boolean;
	branchedFromStoryId?: string | null;
	branchedAtScene?: number | null;
	parentStoryTitle?: string | null;
	onDelete: (id: string, title: string) => void;
	onToggleFavorite: (id: string, isFavorite: boolean) => void;
	isDeleting: boolean;
	isTogglingFavorite: boolean;
}

export function StoryCard({
	id,
	storyTitle,
	templateTitle,
	templateDescription,
	baseTropes,
	coverGradient,
	createdAt,
	currentScene,
	totalScenes,
	status,
	isFavorite,
	branchedFromStoryId,
	branchedAtScene,
	parentStoryTitle,
	onDelete,
	onToggleFavorite,
	isDeleting,
	isTogglingFavorite,
}: StoryCardProps) {
	const displayTitle = storyTitle || templateTitle;
	const isBranch = !!branchedFromStoryId;

	return (
		<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-black/20 overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-shadow h-full flex flex-col">
			{/* Cover */}
			<Link
				to="/story/$id/read"
				params={{ id }}
				search={{ scene: currentScene }}
			>
				<div
					className={`h-40 bg-linear-to-br ${coverGradient} flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity relative`}
				>
					{/* Dark mode overlay to tone down bright gradients */}
					<div className="absolute inset-0 bg-black/20 dark:block hidden" />
					<BookOpen className="w-16 h-16 text-white opacity-50 relative z-10" />
					{/* Favorite button overlay */}
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onToggleFavorite(id, !isFavorite);
						}}
						disabled={isTogglingFavorite}
						className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50 cursor-pointer z-10"
						title={isFavorite ? "Remove from favorites" : "Add to favorites"}
					>
						<Heart
							className={`w-5 h-5 transition-colors ${
								isFavorite
									? "fill-red-500 text-red-500"
									: "text-slate-600 hover:text-red-500"
							}`}
						/>
					</button>
				</div>
			</Link>

			{/* Content */}
			<div className="p-6 space-y-3 flex flex-col flex-1">
				<div className="space-y-1">
					<Heading level="h3" size="section">
						{displayTitle}
					</Heading>
					<p className="text-xs text-slate-500 dark:text-slate-400">
						Started{" "}
						{new Date(createdAt).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</p>
				</div>

				{/* Branch indicator */}
				{isBranch && (
					<div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
						<GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
						<div className="flex-1 min-w-0">
							<p className="text-xs text-purple-900 dark:text-purple-200 font-medium">
								Branched Story
							</p>
							<p className="text-xs text-purple-700 dark:text-purple-300 truncate">
								From{" "}
								{branchedFromStoryId && (
									<Link
										to="/story/$id/read"
										params={{ id: branchedFromStoryId }}
										search={{ scene: branchedAtScene ?? undefined }}
										className="hover:underline font-medium"
									>
										{parentStoryTitle || "Original Story"}
									</Link>
								)}{" "}
								(Scene {branchedAtScene})
							</p>
						</div>
					</div>
				)}

				<p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
					{templateDescription}
				</p>

				{/* Tropes */}
				<div className="flex flex-wrap gap-2">
					{baseTropes.slice(0, 3).map((trope) => (
						<span
							key={trope}
							className="px-2 py-1 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full text-xs text-romance-700 dark:text-pink-200 font-medium"
						>
							{TROPE_LABELS[trope as keyof typeof TROPE_LABELS] || trope}
						</span>
					))}
				</div>

				{/* Progress or Scene Count */}
				{status === "in-progress" ? (
					<StoryProgressBar
						currentScene={currentScene}
						totalScenes={totalScenes}
					/>
				) : (
					<div className="text-sm text-slate-600 py-2">
						{totalScenes} scenes
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-2 mt-auto">
					<Link
						to="/story/$id/read"
						params={{ id }}
						search={{ scene: currentScene }}
						className="flex-1 px-4 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors text-center"
					>
						{status === "in-progress" ? "Continue Reading" : "Read Again"}
					</Link>
					<Link
						to="/story/$id/info"
						params={{ id }}
						className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
						title="Story info"
					>
						<Info className="w-5 h-5" />
					</Link>
					<Button
						onClick={() => onDelete(id, displayTitle)}
						loading={isDeleting}
						variant="danger"
						size="sm"
						className="bg-red-50 text-red-600 hover:bg-red-100"
						title="Delete story"
					>
						<Trash2 className="w-5 h-5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
