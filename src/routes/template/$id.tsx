import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Heart, Sparkles } from "lucide-react";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { ControlledAccordion } from "~/components/ui/Accordion";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTemplateQuery } from "~/hooks/useTemplateQuery";
import { useTropeMap } from "~/hooks/useTropesQuery";

export const Route = createFileRoute("/template/$id")({
	component: TemplateDetailPage,
});

function TemplateDetailPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	// Fetch template details
	const { data, isLoading, error } = useTemplateQuery(id);

	const template = data?.template;
	const tropeMap = useTropeMap();

	return (
		<PageBackground>
			<Header currentPath="" userRole={profileData?.role} />

			<PageContainer maxWidth="xl">
				<div className="space-y-8">
					{/* Back Button */}
					<Button variant="ghost" onClick={() => navigate({ to: "/browse" })}>
						<ArrowLeft className="w-5 h-5" />
						Back to Browse
					</Button>

					{/* Loading State */}
					{isLoading && <LoadingSpinner />}

					{/* Error State */}
					{error && (
						<ErrorMessage
							message={error.message || "Failed to load template"}
							variant="centered"
						>
							<Link
								to="/browse"
								className="inline-block px-6 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 mt-4"
							>
								Return to Browse
							</Link>
						</ErrorMessage>
					)}

					{/* Template Details */}
					{!isLoading && !error && template && (
						<>
							{/* Hero Section */}
							<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
								{template.cover_url ? (
									<div className="h-80 sm:h-160 relative overflow-hidden">
										<img
											src={template.cover_url}
											alt={template.title}
											className="w-full h-full object-cover object-top"
										/>
									</div>
								) : (
									<div
										className={`h-64 bg-linear-to-br ${template.cover_gradient} flex items-center justify-center`}
									>
										<BookOpen
											className="w-32 h-32 text-white opacity-80"
											strokeWidth={1.5}
										/>
									</div>
								)}

								<div className="p-8 space-y-4">
									<Heading level="h1" size="page">
										{template.title}
									</Heading>
									<p className="text-lg text-slate-700 dark:text-gray-300 leading-relaxed">
										{template.description}
									</p>{" "}
									{/* Tropes */}
									<div className="space-y-3">
										<Heading
											level="h3"
											size="label"
											className="text-slate-700 dark:text-gray-300"
										>
											Tropes:
										</Heading>
										<div className="flex flex-wrap gap-2">
											{template.base_tropes.map((trope) => (
												<span
													key={trope}
													className="px-4 py-2 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full text-romance-700 dark:text-pink-200 font-medium"
												>
													{tropeMap[trope] || trope}
												</span>
											))}
										</div>
									</div>
									{/* Stats */}
									<div className="flex items-center gap-6 text-slate-600 dark:text-gray-400">
										<div className="flex items-center gap-2">
											<Sparkles className="w-5 h-5 text-romance-600" />
											<span className="font-medium">
												{template.estimated_scenes} scenes
											</span>
										</div>
										<div className="flex items-center gap-2">
											<BookOpen className="w-5 h-5 text-romance-600" />
											<span className="font-medium">
												{template.choicePoints.length} key decisions
											</span>
										</div>
									</div>
									{/* CTA Button */}
									<Link
										to="/story/create"
										search={{ templateId: template.id }}
										className="inline-flex items-center gap-2 px-8 py-4 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors text-lg"
									>
										<Heart className="w-5 h-5" fill="currentColor" />
										Start Your Story
									</Link>
								</div>
							</div>

							{/* Choice Points Preview */}
							<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 space-y-6">
								<div className="space-y-2">
									<Heading level="h2" size="section">
										Key Decision Points
									</Heading>
									<p className="text-slate-600 dark:text-gray-400">
										Throughout your story, you'll make choices that shape the
										narrative. Here's a preview of some key moments:
									</p>
								</div>

								<ControlledAccordion
									items={template.choicePoints
										.filter(
											(choice) =>
												choice.scene_number < template.estimated_scenes,
										)
										.map((choice) => ({
											id: choice.id,
											title: (
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full flex items-center justify-center">
														<span className="text-sm sm:text-base text-romance-700 dark:text-pink-200 font-bold">
															{choice.scene_number}
														</span>
													</div>
													<span className="text-base sm:text-lg font-medium text-slate-700 dark:text-gray-300">
														Decision at Scene {choice.scene_number}
													</span>
												</div>
											),
											content: (
												<div className="space-y-4">
													<Heading level="h3" size="subsection">
														{choice.prompt_text}
													</Heading>
													<div className="space-y-2">
														{choice.options.map((option) => (
															<div
																key={option.id}
																className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-50 dark:bg-gray-700/50 rounded-lg"
															>
																<div className="flex items-center gap-2 flex-1 min-w-0">
																	<div className="w-2 h-2 shrink-0 bg-romance-500 rounded-full"></div>
																	<span className="text-sm sm:text-base text-slate-700 dark:text-gray-300 wrap-break-word">
																		{option.text}
																	</span>
																</div>
																<span className="text-xs text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-2 py-1 rounded self-start sm:self-auto sm:ml-auto shrink-0">
																	{option.tone}
																</span>
															</div>
														))}
													</div>
												</div>
											),
										}))}
									allowMultiple={true}
									showToggleAll={true}
								/>

								{/* Bottom CTA */}
								<div className="mt-8 text-center">
									<Link
										to="/story/create"
										search={{ templateId: template.id }}
										className="inline-flex items-center gap-2 px-8 py-4 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors text-lg"
									>
										<Heart className="w-5 h-5" fill="currentColor" />
										Start Your Story
									</Link>
									<p className="text-slate-500 dark:text-gray-400 text-sm mt-3">
										Your choices will create a unique story experience
									</p>
								</div>
							</div>
						</>
					)}
				</div>
			</PageContainer>
		</PageBackground>
	);
}
