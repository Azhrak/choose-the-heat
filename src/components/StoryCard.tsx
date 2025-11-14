import { Link } from "@tanstack/react-router";
import { BookOpen, Info, Trash2 } from "lucide-react";
import { Button } from "~/components/Button";
import { StoryProgressBar } from "~/components/StoryProgressBar";

interface StoryCardProps {
	id: string;
	storyTitle: string | null;
	templateTitle: string;
	templateDescription: string;
	coverGradient: string;
	createdAt: string;
	currentScene: number;
	totalScenes: number;
	status: "in-progress" | "completed";
	onDelete: (id: string, title: string) => void;
	isDeleting: boolean;
}

export function StoryCard({
	id,
	storyTitle,
	templateTitle,
	templateDescription,
	coverGradient,
	createdAt,
	currentScene,
	totalScenes,
	status,
	onDelete,
	isDeleting,
}: StoryCardProps) {
	const displayTitle = storyTitle || templateTitle;

	return (
		<div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
			{/* Cover */}
			<Link to="/story/$id/read" params={{ id }}>
				<div
					className={`h-40 bg-linear-to-br ${coverGradient} flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity`}
				>
					<BookOpen className="w-16 h-16 text-white opacity-50" />
				</div>
			</Link>

			{/* Content */}
			<div className="p-6">
				<h3 className="text-xl font-bold text-slate-900 mb-1">
					{displayTitle}
				</h3>
				<p className="text-xs text-slate-500 mb-3">
					Started{" "}
					{new Date(createdAt).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</p>
				<p className="text-sm text-slate-600 mb-4 line-clamp-2">
					{templateDescription}
				</p>

				{/* Progress */}
				<div className="mb-4">
					<StoryProgressBar
						currentScene={currentScene}
						totalScenes={totalScenes}
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<Link
						to="/story/$id/read"
						params={{ id }}
						className="flex-1 px-4 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors text-center"
					>
						{status === "in-progress" ? "Continue Reading" : "Read Again"}
					</Link>
					<Link
						to="/story/$id/info"
						params={{ id }}
						className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center"
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
