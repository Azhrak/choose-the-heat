import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Flame,
	Heart,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { RadioButton } from "~/components/RadioButton";
import { ApiError, api } from "~/lib/api/client";
import {
	GENRE_LABELS,
	GENRES,
	type Genre,
	PACING_LABELS,
	PACING_OPTIONS,
	type PacingOption,
	SCENE_LENGTH_LABELS,
	SCENE_LENGTH_OPTIONS,
	type SceneLengthOption,
	SPICE_LABELS,
	type SpiceLevel,
	TROPE_LABELS,
	TROPES,
	type Trope,
	type UserPreferences,
} from "~/lib/types/preferences";

export const Route = createFileRoute("/auth/onboarding")({
	component: OnboardingPage,
});

function OnboardingPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [preferences, setPreferences] = useState<UserPreferences>({
		genres: [],
		tropes: [],
		spiceLevel: 3,
		pacing: "slow-burn",
		sceneLength: "medium",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGenreToggle = (genre: Genre) => {
		setPreferences((prev) => ({
			...prev,
			genres: prev.genres.includes(genre)
				? prev.genres.filter((g) => g !== genre)
				: [...prev.genres, genre],
		}));
	};

	const handleTropeToggle = (trope: Trope) => {
		setPreferences((prev) => ({
			...prev,
			tropes: prev.tropes.includes(trope)
				? prev.tropes.filter((t) => t !== trope)
				: [...prev.tropes, trope],
		}));
	};

	const handleSpiceLevelChange = (level: SpiceLevel) => {
		setPreferences((prev) => ({ ...prev, spiceLevel: level }));
	};

	const handlePacingChange = (pacing: PacingOption) => {
		setPreferences((prev) => ({ ...prev, pacing }));
	};

	const handleSceneLengthChange = (sceneLength: SceneLengthOption) => {
		setPreferences((prev) => ({ ...prev, sceneLength }));
	};

	const canProceedFromStep1 = preferences.genres.length > 0;
	const canProceedFromStep2 = preferences.tropes.length > 0;

	const handleNext = () => {
		if (step === 1 && !canProceedFromStep1) {
			setError("Please select at least one genre");
			return;
		}
		if (step === 2 && !canProceedFromStep2) {
			setError("Please select at least one trope");
			return;
		}
		setError(null);
		setStep((s) => Math.min(s + 1, 3));
	};

	const handleBack = () => {
		setError(null);
		setStep((s) => Math.max(s - 1, 1));
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await api.post("/api/preferences", preferences);
			// Redirect to browse page
			navigate({ to: "/browse" });
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message || "Failed to save preferences");
			} else {
				setError("An error occurred");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<PageBackground>
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-3xl mx-auto">
					<div className="space-y-8">
						{/* Header */}
						<div className="text-center space-y-4">
							<Heart
								className="w-16 h-16 text-romance-500 mx-auto"
								fill="currentColor"
							/>
							<div className="space-y-2">
								<Heading level="h1" size="page">
									Let's Personalize Your Experience
								</Heading>
								<p className="text-slate-600">
									Tell us what you love, and we'll craft stories just for you
								</p>
							</div>
						</div>{" "}
						{/* Progress Stepper */}
						<div className="flex items-center justify-center">
							{[1, 2, 3].map((s) => (
								<div key={s} className="flex items-center">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
											s === step
												? "bg-romance-600 text-white"
												: s < step
													? "bg-romance-400 text-white"
													: "bg-slate-200 text-slate-500"
										}`}
									>
										{s}
									</div>
									{s < 3 && (
										<div
											className={`w-16 h-1 mx-2 transition-colors ${
												s < step ? "bg-romance-400" : "bg-slate-200"
											}`}
										/>
									)}
								</div>
							))}
						</div>
						{/* Error Message */}
						{error && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
								{error}
							</div>
						)}
						{/* Step Content */}
						<div className="bg-white rounded-2xl shadow-lg p-8">
							{step === 1 && (
								<div className="space-y-6">
									<div className="flex items-center">
										<BookOpen className="w-6 h-6 text-romance-500 mr-2" />
										<Heading level="h2" size="section">
											Choose Your Genres
										</Heading>
									</div>
									<p className="text-slate-600">Select all that interest you</p>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										{GENRES.map((genre) => (
											<button
												key={genre}
												type="button"
												onClick={() => handleGenreToggle(genre)}
												className={`p-4 rounded-lg border-2 transition-all ${
													preferences.genres.includes(genre)
														? "border-romance-500 bg-romance-50 text-romance-700"
														: "border-slate-200 hover:border-romance-300 text-slate-700"
												}`}
											>
												<div className="font-semibold">
													{GENRE_LABELS[genre]}
												</div>
											</button>
										))}
									</div>
								</div>
							)}

							{step === 2 && (
								<div className="space-y-6">
									<div className="flex items-center">
										<Heart className="w-6 h-6 text-romance-500 mr-2" />
										<Heading level="h2" size="section">
											Pick Your Tropes
										</Heading>
									</div>
									<p className="text-slate-600">
										What romance tropes make your heart race?
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{TROPES.map((trope) => (
											<button
												type="button"
												key={trope}
												onClick={() => handleTropeToggle(trope)}
												className={`p-4 rounded-lg border-2 transition-all text-left ${
													preferences.tropes.includes(trope)
														? "border-romance-500 bg-romance-50 text-romance-700"
														: "border-slate-200 hover:border-romance-300 text-slate-700"
												}`}
											>
												<div className="font-semibold">
													{TROPE_LABELS[trope]}
												</div>
											</button>
										))}
									</div>
								</div>
							)}

							{step === 3 && (
								<div className="space-y-8">
									<div className="flex items-center">
										<Flame className="w-6 h-6 text-romance-500 mr-2" />
										<Heading level="h2" size="section">
											Set Your Preferences
										</Heading>
									</div>{" "}
									{/* Spice Level */}
									<div className="space-y-4">
										<Heading level="h3" size="subsection">
											Spice Level
										</Heading>
										<div className="space-y-3">
											{([1, 2, 3, 4, 5] as SpiceLevel[]).map((level) => (
												<button
													type="button"
													key={level}
													onClick={() => handleSpiceLevelChange(level)}
													className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
														preferences.spiceLevel === level
															? "border-romance-500 bg-romance-50"
															: "border-slate-200 hover:border-romance-300"
													}`}
												>
													<div className="flex items-center justify-between">
														<div>
															<div className="flex items-center gap-2">
																<span className="font-semibold text-slate-900">
																	{SPICE_LABELS[level].label}
																</span>
																<div className="flex gap-1">
																	{Array.from({ length: level }).map(() => (
																		<Flame
																			key={level}
																			className="w-4 h-4 text-romance-500"
																			fill="currentColor"
																		/>
																	))}
																</div>
															</div>
															<p className="text-sm text-slate-600">
																{SPICE_LABELS[level].description}
															</p>
														</div>
														<div
															className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
																preferences.spiceLevel === level
																	? "border-romance-500 bg-romance-500"
																	: "border-slate-300"
															}`}
														>
															{preferences.spiceLevel === level && (
																<div className="w-2 h-2 bg-white rounded-full" />
															)}
														</div>
													</div>
												</button>
											))}
										</div>
									</div>
									{/* Pacing */}
									<div className="space-y-4">
										<Heading level="h3" size="subsection">
											Relationship Pacing
										</Heading>
										<div className="space-y-3">
											{PACING_OPTIONS.map((pacing) => (
												<RadioButton
													key={pacing}
													selected={preferences.pacing === pacing}
													onClick={() => handlePacingChange(pacing)}
												>
													<div className="font-semibold text-slate-900">
														{PACING_LABELS[pacing].label}
													</div>
													<p className="text-sm text-slate-600">
														{PACING_LABELS[pacing].description}
													</p>
												</RadioButton>
											))}
										</div>
									</div>
									{/* Scene Length */}
									<div className="space-y-4">
										<Heading level="h3" size="subsection">
											Scene Length
										</Heading>
										<div className="space-y-3">
											{SCENE_LENGTH_OPTIONS.map((length) => (
												<RadioButton
													key={length}
													selected={preferences.sceneLength === length}
													onClick={() => handleSceneLengthChange(length)}
												>
													<div className="font-semibold text-slate-900">
														{SCENE_LENGTH_LABELS[length].label}
													</div>
													<p className="text-sm text-slate-600">
														{SCENE_LENGTH_LABELS[length].description}
													</p>
													<p className="text-xs text-slate-500 mt-1">
														{SCENE_LENGTH_LABELS[length].wordCount}
													</p>
												</RadioButton>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
						{/* Navigation Buttons */}
						<div className="flex justify-between">
							<Button
								onClick={handleBack}
								disabled={step === 1}
								variant="secondary"
								className={step === 1 ? "invisible" : ""}
							>
								<ChevronLeft className="w-5 h-5" />
								Back
							</Button>

							{step < 3 ? (
								<Button onClick={handleNext} variant="primary">
									Next
									<ChevronRight className="w-5 h-5" />
								</Button>
							) : (
								<Button
									onClick={handleSubmit}
									loading={isSubmitting}
									variant="primary"
								>
									Complete Setup
									<ChevronRight className="w-5 h-5" />
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</PageBackground>
	);
}
