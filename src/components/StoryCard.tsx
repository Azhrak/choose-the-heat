import { Link } from "@tanstack/react-router";
import { BookOpen, GitBranch, Heart, Info, Trash2 } from "lucide-react";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { StoryProgressBar } from "~/components/StoryProgressBar";
import { LinkButton } from "~/components/ui/LinkButton";
import { useTropeMap } from "~/hooks/useTropesQuery";

interface StoryCardProps {
	id: string;
	storyTitle: string | null;
	templateTitle: string;
	templateDescription: string;
	baseTropes: string[];
	coverGradient: string;
	coverUrl?: string | null;
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

/**
 * StoryCard - Displays user story with progress and actions
 * Follows props object pattern (no destructuring)
 *
 * @param props.id - Story ID
 * @param props.storyTitle - Custom story title
 * @param props.templateTitle - Template title
 * @param props.templateDescription - Template description
 * @param props.baseTropes - Story tropes
 * @param props.coverGradient - Cover gradient class
 * @param props.coverUrl - Optional cover image URL
 * @param props.createdAt - Creation timestamp
 * @param props.currentScene - Current scene number
 * @param props.totalScenes - Total scenes
 * @param props.status - Story status
 * @param props.isFavorite - Whether favorited
 * @param props.branchedFromStoryId - Parent story ID if branched
 * @param props.branchedAtScene - Branch point scene number
 * @param props.parentStoryTitle - Parent story title
 * @param props.onDelete - Delete callback
 * @param props.onToggleFavorite - Toggle favorite callback
 * @param props.isDeleting - Delete loading state
 * @param props.isTogglingFavorite - Favorite loading state
 */
export function StoryCard(props: StoryCardProps) {
	const tropeMap = useTropeMap();
	const displayTitle = props.storyTitle || props.templateTitle;
	const isBranch = !!props.branchedFromStoryId;

	return (
		<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-black/20 overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-shadow h-full flex flex-col">
			{/* Cover */}
			<Link
				to="/story/$id/read"
				params={{ id: props.id }}
				search={{ scene: props.currentScene }}
			>
				{props.coverUrl ? (
					<div className="h-40 relative cursor-pointer hover:opacity-95 transition-opacity overflow-hidden">
						<img
							src={props.coverUrl}
							alt={displayTitle}
							className="w-full h-full object-cover object-top"
						/>
						{/* Favorite button overlay */}
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								props.onToggleFavorite(props.id, !props.isFavorite);
							}}
							disabled={props.isTogglingFavorite}
							className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50 cursor-pointer z-10"
							title={
								props.isFavorite ? "Remove from favorites" : "Add to favorites"
							}
						>
							<Heart
								className={`w-5 h-5 transition-colors ${
									props.isFavorite
										? "fill-red-500 text-red-500"
										: "text-slate-600 hover:text-red-500"
								}`}
							/>
						</button>
					</div>
				) : (
					<div
						className={`h-40 bg-linear-to-br ${props.coverGradient} flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity relative`}
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
								props.onToggleFavorite(props.id, !props.isFavorite);
							}}
							disabled={props.isTogglingFavorite}
							className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50 cursor-pointer z-10"
							title={
								props.isFavorite ? "Remove from favorites" : "Add to favorites"
							}
						>
							<Heart
								className={`w-5 h-5 transition-colors ${
									props.isFavorite
										? "fill-red-500 text-red-500"
										: "text-slate-600 hover:text-red-500"
								}`}
							/>
						</button>
					</div>
				)}
			</Link>

			{/* Content */}
			<div className="p-6 space-y-3 flex flex-col flex-1">
				<div className="space-y-1">
					<Heading level="h3" size="section">
						{displayTitle}
					</Heading>
					<p className="text-xs text-slate-500 dark:text-slate-400">
						Started{" "}
						{new Date(props.createdAt).toLocaleDateString("en-US", {
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
								{props.branchedFromStoryId && (
									<Link
										to="/story/$id/read"
										params={{ id: props.branchedFromStoryId }}
										search={{ scene: props.branchedAtScene ?? undefined }}
										className="hover:underline font-medium"
									>
										{props.parentStoryTitle || "Original Story"}
									</Link>
								)}{" "}
								(Scene {props.branchedAtScene})
							</p>
						</div>
					</div>
				)}

				<p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
					{props.templateDescription}
				</p>

				{/* Tropes */}
				<div className="flex flex-wrap gap-2">
					{props.baseTropes.slice(0, 3).map((trope) => (
						<span
							key={trope}
							className="px-2 py-1 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full text-xs text-romance-700 dark:text-pink-200 font-medium"
						>
							{tropeMap[trope] || trope}
						</span>
					))}
				</div>

				{/* Progress or Scene Count */}
				{props.status === "in-progress" ? (
					<StoryProgressBar
						currentScene={props.currentScene}
						totalScenes={props.totalScenes}
						status={props.status}
					/>
				) : (
					<div className="text-sm text-slate-600 py-2">
						{props.totalScenes} scenes
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-2 mt-auto">
					<LinkButton
						to="/story/$id/read"
						params={{ id: props.id }}
						search={{ scene: props.currentScene }}
						variant="primary"
						size="md"
						className="flex-1"
					>
						{props.status === "in-progress" ? "Continue Reading" : "Read Again"}
					</LinkButton>
					<LinkButton
						to="/story/$id/info"
						params={{ id: props.id }}
						variant="secondary"
						size="sm"
						title="Story info"
					>
						<Info className="w-5 h-5" />
					</LinkButton>
					<Button
						onClick={() => props.onDelete(props.id, displayTitle)}
						loading={props.isDeleting}
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
