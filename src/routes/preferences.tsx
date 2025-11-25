import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "~/components/Footer";
import { FullPageLoader } from "~/components/FullPageLoader";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import {
	GenresSection,
	PacingSection,
	PovCharacterGenderSection,
	SceneLengthSection,
	SpiceLevelSection,
	TropesSection,
} from "~/components/preferences";
import { Alert } from "~/components/ui/Alert";
import { LinkButton } from "~/components/ui/LinkButton";
import { Stack } from "~/components/ui/Stack";
import { useUpdatePreferencesMutation } from "~/hooks/useUpdatePreferencesMutation";
import { useUserPreferencesQuery } from "~/hooks/useUserPreferencesQuery";
import { ApiError } from "~/lib/api/client";
import type {
	Genre,
	PacingOption,
	PovCharacterGender,
	SceneLengthOption,
	SpiceLevel,
	Trope,
	UserPreferences,
} from "~/lib/types/preferences";

export const Route = createFileRoute("/preferences")({
	component: PreferencesPage,
});

function PreferencesPage() {
	const navigate = useNavigate();
	const {
		data: preferencesData,
		isLoading,
		error: queryError,
	} = useUserPreferencesQuery();
	const updatePreferences = useUpdatePreferencesMutation();

	const [preferences, setPreferences] = useState<UserPreferences>({
		genres: [],
		tropes: [],
		spiceLevel: 3,
		pacing: "slow-burn",
		sceneLength: "medium",
		povCharacterGender: "female",
	});
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Load existing preferences when data arrives
	useEffect(() => {
		if (preferencesData) {
			setPreferences(preferencesData);
		}
	}, [preferencesData]);

	// Handle authentication errors
	useEffect(() => {
		if (queryError instanceof ApiError && queryError.status === 401) {
			navigate({ to: "/auth/login" });
		}
	}, [queryError, navigate]);

	const handleGenreToggle = (genre: Genre) => {
		setPreferences((prev) => ({
			...prev,
			genres: prev.genres.includes(genre)
				? prev.genres.filter((g) => g !== genre)
				: [...prev.genres, genre],
		}));
		setSuccess(false);
	};

	const handleTropeToggle = (trope: Trope) => {
		setPreferences((prev) => ({
			...prev,
			tropes: prev.tropes.includes(trope)
				? prev.tropes.filter((t) => t !== trope)
				: [...prev.tropes, trope],
		}));
		setSuccess(false);
	};

	const handleSpiceLevelChange = (level: SpiceLevel) => {
		setPreferences((prev) => ({ ...prev, spiceLevel: level }));
		setSuccess(false);
	};

	const handlePacingChange = (pacing: PacingOption) => {
		setPreferences((prev) => ({ ...prev, pacing }));
		setSuccess(false);
	};

	const handleSceneLengthChange = (sceneLength: SceneLengthOption) => {
		setPreferences((prev) => ({ ...prev, sceneLength }));
		setSuccess(false);
	};

	const handlePovCharacterGenderChange = (
		povCharacterGender: PovCharacterGender,
	) => {
		setPreferences((prev) => ({ ...prev, povCharacterGender }));
		setSuccess(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		// Validate
		if (preferences.genres.length === 0) {
			setError("Please select at least one genre");
			return;
		}

		if (preferences.tropes.length === 0) {
			setError("Please select at least one trope");
			return;
		}

		try {
			await updatePreferences.mutateAsync(preferences);
			// Show success message
			setSuccess(true);
			// Auto-hide success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message || "Failed to save preferences");
			} else {
				setError("An error occurred");
			}
		}
	};

	if (isLoading) {
		return <FullPageLoader message="Loading your preferences..." />;
	}

	return (
		<PageBackground>
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<Stack gap="lg">
						<Stack gap="sm">
							<LinkButton
								to="/profile"
								variant="ghost"
								className="text-slate-600 hover:text-romance-600"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Profile
							</LinkButton>
							<div className="flex items-center gap-4">
								<Settings className="w-10 h-10 text-romance-500" />
								<div className="space-y-1">
									<Heading level="h1">Novel Generation Preferences</Heading>
									<p className="text-slate-600">
										Customize how AI generates stories for you
									</p>
								</div>
							</div>
						</Stack>
						{/* Success Message */}
						{success && (
							<div className="flex items-center gap-3">
								<CheckCircle2 className="w-5 h-5 text-green-700 dark:text-green-300" />
								<Alert
									message="Your preferences have been saved successfully!"
									variant="success"
									className="flex-1"
								/>
							</div>
						)}
						{/* Error Message */}
						<Alert message={error} variant="error" /> {/* Form */}
						<form onSubmit={handleSubmit} className="space-y-8">
							<GenresSection
								selectedGenres={preferences.genres}
								onToggle={handleGenreToggle}
							/>

							<TropesSection
								selectedTropes={preferences.tropes}
								onToggle={handleTropeToggle}
							/>

							<SpiceLevelSection
								selectedLevel={preferences.spiceLevel}
								onSelect={handleSpiceLevelChange}
							/>

							<PacingSection
								selectedPacing={preferences.pacing}
								onSelect={handlePacingChange}
							/>

							<SceneLengthSection
								selectedLength={preferences.sceneLength || "medium"}
								onSelect={handleSceneLengthChange}
							/>

							<PovCharacterGenderSection
								selectedGender={preferences.povCharacterGender || "female"}
								onSelect={handlePovCharacterGenderChange}
							/>

							{/* Save Button */}
							<div className="flex justify-end gap-4">
								<LinkButton
									to="/profile"
									variant="outline"
									className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200"
								>
									Cancel
								</LinkButton>
								<button
									type="submit"
									disabled={updatePreferences.isPending}
									className="px-8 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{updatePreferences.isPending ? (
										<>
											<Settings className="w-5 h-5 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<CheckCircle2 className="w-5 h-5" />
											Save Preferences
										</>
									)}
								</button>
							</div>
						</form>
					</Stack>
				</div>
			</div>
			<Footer />
		</PageBackground>
	);
}
