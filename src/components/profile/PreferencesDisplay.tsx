import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";

interface PreferencesDisplayProps {
	preferences: any;
}

export function PreferencesDisplay({ preferences }: PreferencesDisplayProps) {
	if (!preferences) {
		return (
			<div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
				<div className="flex items-center gap-2 mb-6">
					<Settings className="w-5 h-5 text-romance-500" />
					<h2 className="text-2xl font-bold text-slate-900">
						Reading Preferences
					</h2>
				</div>

				<p className="text-slate-600 mb-4">
					Set up your reading preferences to get personalized story
					recommendations
				</p>

				<Link
					to="/preferences"
					className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
				>
					Set Up Preferences
				</Link>
			</div>
		);
	}

	let prefs: any;
	try {
		prefs =
			typeof preferences === "string" ? JSON.parse(preferences) : preferences;
	} catch {
		return null;
	}

	return (
		<div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
			<div className="flex items-center gap-2 mb-6">
				<Settings className="w-5 h-5 text-romance-500" />
				<h2 className="text-2xl font-bold text-slate-900">
					Reading Preferences
				</h2>
			</div>

			<div className="space-y-4 mb-6">
				<div>
					<h3 className="font-semibold text-slate-700 mb-2">Favorite Genres</h3>
					<div className="flex flex-wrap gap-2">
						{(prefs.genres || []).length > 0 ? (
							(prefs.genres || []).map((genre: string) => (
								<span
									key={genre}
									className="px-3 py-1 bg-romance-100 text-romance-700 rounded-full text-sm"
								>
									{genre
										.split("-")
										.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
										.join(" ")}
								</span>
							))
						) : (
							<span className="text-slate-500">None set</span>
						)}
					</div>
				</div>

				<div>
					<h3 className="font-semibold text-slate-700 mb-2">Favorite Tropes</h3>
					<div className="flex flex-wrap gap-2">
						{(prefs.tropes || []).length > 0 ? (
							(prefs.tropes || []).map((trope: string) => (
								<span
									key={trope}
									className="px-3 py-1 bg-romance-100 text-romance-700 rounded-full text-sm"
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
							<span className="text-slate-500">None set</span>
						)}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<div>
						<h3 className="font-semibold text-slate-700 mb-1">Spice Level</h3>
						<p className="text-slate-600">
							{(() => {
								const level = prefs.spiceLevel || 3;
								return `Level ${level} ${"🔥".repeat(level)}`;
							})()}
						</p>
					</div>

					<div>
						<h3 className="font-semibold text-slate-700 mb-1">Pacing</h3>
						<p className="text-slate-600">
							{(prefs.pacing || "slow-burn")
								.split("-")
								.map(
									(word: string) =>
										word.charAt(0).toUpperCase() + word.slice(1),
								)
								.join(" ")}
						</p>
					</div>

					<div>
						<h3 className="font-semibold text-slate-700 mb-1">Scene Length</h3>
						<p className="text-slate-600">
							{(() => {
								const length = prefs.sceneLength || "medium";
								return length.charAt(0).toUpperCase() + length.slice(1);
							})()}
						</p>
					</div>
				</div>
			</div>

			<Link
				to="/preferences"
				className="inline-flex items-center px-6 py-3 border-2 border-romance-600 text-romance-600 rounded-lg font-semibold hover:bg-romance-50 transition-colors"
			>
				Update Preferences
			</Link>
		</div>
	);
}
