import { Link } from "@tanstack/react-router";
import { BookOpen, Sparkles } from "lucide-react";
import { LinkButton } from "~/components/ui/LinkButton";
import { useTropeMap } from "~/hooks/useTropesQuery";

interface NovelCardProps {
	id: string;
	title: string;
	description: string;
	baseTropes: string[];
	estimatedScenes: number;
	coverGradient: string;
	coverUrl?: string | null;
}

export function NovelCard(props: NovelCardProps) {
	const tropeMap = useTropeMap();

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-black/20 overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-shadow duration-300 h-full flex flex-col">
			{/* Cover Image or Gradient */}
			<Link to="/template/$id" params={{ id: props.id }}>
				{props.coverUrl ? (
					<div className="h-48 relative cursor-pointer hover:opacity-95 transition-opacity overflow-hidden">
						<img
							src={props.coverUrl}
							alt={props.title}
							className="w-full h-full object-cover object-top"
						/>
					</div>
				) : (
					<div
						className={`h-48 bg-linear-to-br ${props.coverGradient} flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity relative`}
					>
						{/* Dark mode overlay to tone down bright gradients */}
						<div className="absolute inset-0 bg-black/20 dark:block hidden" />
						<BookOpen
							className="w-20 h-20 text-white opacity-80 relative z-10"
							strokeWidth={1.5}
						/>
					</div>
				)}
			</Link>
			{/* Content */}
			<div className="p-6 space-y-4 flex flex-col flex-1">
				<div className="space-y-3">
					<h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
						{props.title}
					</h3>
					<p className="text-slate-600 dark:text-slate-300 line-clamp-3">
						{props.description}
					</p>
				</div>

				{/* Tropes */}
				<div className="flex flex-wrap gap-2">
					{props.baseTropes.map((trope) => (
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
						<span>{props.estimatedScenes} scenes</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 mt-auto">
					<LinkButton
						to="/template/$id"
						params={{ id: props.id }}
						variant="primary"
						size="md"
						className="flex-1"
					>
						View Details
					</LinkButton>
					<LinkButton
						to="/story/create"
						search={{ templateId: props.id }}
						variant="secondary"
						size="md"
						className="flex-1"
					>
						Start Reading
					</LinkButton>
				</div>
			</div>
		</div>
	);
}
