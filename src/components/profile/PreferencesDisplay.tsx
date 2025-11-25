import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import type { UserPreferences } from "~/lib/types/preferences";

interface PreferencesDisplayProps {
	preferences: UserPreferences | string | null;
}

export function PreferencesDisplay({ preferences }: PreferencesDisplayProps) {
	if (!preferences) {
		return (
			<Card>
				<Stack gap="sm">
					<div className="flex items-center gap-2">
						<Settings className="w-5 h-5 text-romance-500" />
						<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
							Reading Preferences
						</h2>
					</div>

					<p className="text-slate-600 dark:text-gray-400">
						Set up your reading preferences to get personalized story
						recommendations
					</p>

					<Link
						to="/preferences"
						className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
					>
						Set Up Preferences
					</Link>
				</Stack>
			</Card>
		);
	}

	let prefs: UserPreferences;
	try {
		prefs =
			typeof preferences === "string" ? JSON.parse(preferences) : preferences;
	} catch {
		return null;
	}

	return (
		<Card>
			<Stack gap="md">
				<div className="flex items-center gap-2">
					<Settings className="w-5 h-5 text-romance-500" />
					<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
						Reading Preferences
					</h2>
				</div>

				<Stack gap="sm">
					<div className="space-y-2">
						<h3 className="font-semibold text-slate-700 dark:text-gray-300">
							Favorite Genres
						</h3>
						<div className="flex flex-wrap gap-2">
							{(prefs.genres || []).length > 0 ? (
								(prefs.genres || []).map((genre: string) => (
									<span
										key={genre}
										className="px-3 py-1 bg-romance-100 dark:bg-romance-500/20 text-romance-700 dark:text-pink-200 rounded-full text-sm"
									>
										{genre
											.split("-")
											.map(
												(word) => word.charAt(0).toUpperCase() + word.slice(1),
											)
											.join(" ")}
									</span>
								))
							) : (
								<span className="text-slate-500">None set</span>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="font-semibold text-slate-700 dark:text-gray-300">
							Favorite Tropes
						</h3>
						<div className="flex flex-wrap gap-2">
							{(prefs.tropes || []).length > 0 ? (
								(prefs.tropes || []).map((trope: string) => (
									<span
										key={trope}
										className="px-3 py-1 bg-romance-100 dark:bg-romance-500/20 text-romance-700 dark:text-pink-200 rounded-full text-sm"
									>
										{trope
											.split("-")
											.map(
												(word: string) =>
													word.charAt(0).toUpperCase() + word.slice(1),
											)
											.join(" ")}
									</span>
								))
							) : (
								<span className="text-slate-500 dark:text-gray-400">
									None set
								</span>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="space-y-1">
							<h3 className="font-semibold text-slate-700 dark:text-gray-300">
								Spice Level
							</h3>
							<p className="text-slate-600 dark:text-gray-400">
								{(() => {
									const level = prefs.spiceLevel || 3;
									return `Level ${level} ${"🔥".repeat(level)}`;
								})()}
							</p>
						</div>

						<div className="space-y-1">
							<h3 className="font-semibold text-slate-700 dark:text-gray-300">
								Pacing
							</h3>
							<p className="text-slate-600 dark:text-gray-400">
								{(prefs.pacing || "slow-burn")
									.split("-")
									.map(
										(word: string) =>
											word.charAt(0).toUpperCase() + word.slice(1),
									)
									.join(" ")}
							</p>
						</div>

						<div className="space-y-1">
							<h3 className="font-semibold text-slate-700 dark:text-gray-300">
								Scene Length
							</h3>
							<p className="text-slate-600 dark:text-gray-400">
								{(() => {
									const length = prefs.sceneLength || "medium";
									return length.charAt(0).toUpperCase() + length.slice(1);
								})()}
							</p>
						</div>
					</div>
				</Stack>

				<Link
					to="/preferences"
					className="inline-flex items-center px-6 py-3 border-2 border-romance-600 dark:border-romance-500 text-romance-600 dark:text-romance-400 rounded-lg font-semibold hover:bg-romance-50 dark:hover:bg-romance-900/20 transition-colors"
				>
					Update Preferences
				</Link>
			</Stack>
		</Card>
	);
}
