import { Link } from "@tanstack/react-router";
import { BookOpen, Sparkles } from "lucide-react";
import { TROPE_LABELS } from "~/lib/types/preferences";

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
	return (
		<div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
			{/* Gradient Cover */}
			<div
				className={`h-48 bg-linear-to-br ${coverGradient} flex items-center justify-center`}
			>
				<BookOpen
					className="w-20 h-20 text-white opacity-80"
					strokeWidth={1.5}
				/>
			</div>

			{/* Content */}
			<div className="p-6">
				<h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
				<p className="text-slate-600 mb-4 line-clamp-3">{description}</p>

				{/* Tropes */}
				<div className="flex flex-wrap gap-2 mb-4">
					{baseTropes.map((trope) => (
						<span
							key={trope}
							className="px-3 py-1 bg-romance-50 border border-romance-200 rounded-full text-sm text-romance-700 font-medium"
						>
							{TROPE_LABELS[trope as keyof typeof TROPE_LABELS] || trope}
						</span>
					))}
				</div>

				{/* Stats */}
				<div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
					<div className="flex items-center gap-1">
						<Sparkles className="w-4 h-4" />
						<span>{estimatedScenes} scenes</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
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
						className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-center"
					>
						Start Reading
					</Link>
				</div>
			</div>
		</div>
	);
}
