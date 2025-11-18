import { Link } from "@tanstack/react-router";
import { BookOpen, Sparkles } from "lucide-react";
import { useTropeMap } from "~/hooks/useTropesQuery";

interface NovelCardProps {
	id: string;
	title: string;
	description: string;
	baseTropes: string[];
	estimatedScenes: number;
	coverGradient: string;
}

export function NovelCard({
	id,
	title,
	description,
	baseTropes,
	estimatedScenes,
	coverGradient,
}: NovelCardProps) {
	const tropeMap = useTropeMap();

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-black/20 overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-shadow duration-300 h-full flex flex-col">
			{/* Gradient Cover */}
			<Link to="/template/$id" params={{ id }}>
				<div
					className={`h-48 bg-linear-to-br ${coverGradient} flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity relative`}
				>
					{/* Dark mode overlay to tone down bright gradients */}
					<div className="absolute inset-0 bg-black/20 dark:block hidden" />
					<BookOpen
						className="w-20 h-20 text-white opacity-80 relative z-10"
						strokeWidth={1.5}
					/>
				</div>
			</Link>{" "}
			{/* Content */}
			<div className="p-6 space-y-4 flex flex-col flex-1">
				<div className="space-y-3">
					<h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
						{title}
					</h3>
					<p className="text-slate-600 dark:text-slate-300 line-clamp-3">
						{description}
					</p>
				</div>

				{/* Tropes */}
				<div className="flex flex-wrap gap-2">
					{baseTropes.map((trope) => (
						<span
							key={trope}
							className="px-3 py-1 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full text-sm text-romance-700 dark:text-pink-200 font-medium"
						>
							{tropeMap[trope] || trope}
						</span>
					))}
				</div>

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
					<div className="flex items-center gap-1">
						<Sparkles className="w-4 h-4" />
						<span>{estimatedScenes} scenes</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 mt-auto">
					<Link
						to="/template/$id"
						params={{ id }}
						className="flex-1 px-4 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors text-center"
					>
						View Details
					</Link>
					<Link
						to="/story/create"
						search={{ templateId: id }}
						className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
					>
						Start Reading
					</Link>
				</div>
			</div>
		</div>
	);
}
