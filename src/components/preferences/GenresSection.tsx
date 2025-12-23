import { BookOpen } from "lucide-react";
import { Heading } from "~/components/Heading";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { GENRE_LABELS, GENRES, type Genre } from "~/lib/types/preferences";

interface GenresSectionProps {
	selectedGenres: Genre[];
	onToggle: (genre: Genre) => void;
}

/**
 * GenresSection - Genre selection for user preferences
 * Follows props object pattern (no destructuring)
 *
 * @param props.selectedGenres - Currently selected genres
 * @param props.onToggle - Callback when genre toggled
 */
export function GenresSection(props: GenresSectionProps) {
	return (
		<Card padding="md">
			<Stack gap="md">
				<div className="flex items-center">
					<BookOpen className="w-6 h-6 text-romance-500 mr-2" />
					<Heading level="h3" size="section">
						Genres
					</Heading>
				</div>
				<Text>Select your favorite romance genres</Text>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{GENRES.map((genre) => (
						<button
							key={genre}
							type="button"
							onClick={() => props.onToggle(genre)}
							className={`p-4 rounded-lg border-2 transition-all ${
								props.selectedGenres.includes(genre)
									? "border-romance-500 bg-romance-50 dark:bg-romance-500/20 text-romance-700 dark:text-pink-200"
									: "border-slate-200 dark:border-gray-600 hover:border-romance-300 dark:hover:border-romance-500 text-slate-700 dark:text-gray-200"
							}`}
						>
							<div className="font-semibold">{GENRE_LABELS[genre]}</div>
						</button>
					))}
				</div>
			</Stack>
		</Card>
	);
}
