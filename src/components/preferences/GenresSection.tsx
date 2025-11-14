import { BookOpen } from "lucide-react";
import { GENRE_LABELS, GENRES, type Genre } from "~/lib/types/preferences";

interface GenresSectionProps {
	selectedGenres: Genre[];
	onToggle: (genre: Genre) => void;
}

export function GenresSection({
	selectedGenres,
	onToggle,
}: GenresSectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<div className="flex items-center mb-6">
				<BookOpen className="w-6 h-6 text-romance-500 mr-2" />
				<h2 className="text-2xl font-bold text-slate-900">Genres</h2>
			</div>
			<p className="text-slate-600 mb-6">Select your favorite romance genres</p>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{GENRES.map((genre) => (
					<button
						key={genre}
						type="button"
						onClick={() => onToggle(genre)}
						className={`p-4 rounded-lg border-2 transition-all ${
							selectedGenres.includes(genre)
								? "border-romance-500 bg-romance-50 text-romance-700"
								: "border-slate-200 hover:border-romance-300 text-slate-700"
						}`}
					>
						<div className="font-semibold">{GENRE_LABELS[genre]}</div>
					</button>
				))}
			</div>
		</div>
	);
}
