import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Heart, Sparkles } from "lucide-react";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Header } from "~/components/Header";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { PageContainer } from "~/components/PageContainer";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTemplateQuery } from "~/hooks/useTemplateQuery";
import { TROPE_LABELS } from "~/lib/types/preferences";

export const Route = createFileRoute("/template/$id")({
	component: TemplateDetailPage,
});

interface ChoiceOption {
	id: string;
	text: string;
	tone: string;
	impact: string;
}

interface ChoicePoint {
	id: string;
	scene_number: number;
	prompt_text: string;
	options: ChoiceOption[];
}

interface Template {
	id: string;
	title: string;
	description: string;
	base_tropes: string[];
	estimated_scenes: number;
	cover_gradient: string;
	choicePoints: ChoicePoint[];
}

function TemplateDetailPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	// Fetch template details
	const { data, isLoading, error } = useTemplateQuery(id);

	const template = data?.template;

	return (
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<Header currentPath="" userRole={profileData?.role} />

			<PageContainer maxWidth="xl">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/browse" })}
					className="mb-6"
				>
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
						<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
							<div
								className={`h-64 bg-linear-to-br ${template.cover_gradient} flex items-center justify-center`}
							>
								<BookOpen
									className="w-32 h-32 text-white opacity-80"
									strokeWidth={1.5}
								/>
							</div>

							<div className="p-8">
								<h1 className="text-4xl font-bold text-slate-900 mb-4">
									{template.title}
								</h1>
								<p className="text-lg text-slate-700 mb-6 leading-relaxed">
									{template.description}
								</p>

								{/* Tropes */}
								<div className="mb-6">
									<h3 className="text-sm font-semibold text-slate-700 mb-3">
										Tropes:
									</h3>
									<div className="flex flex-wrap gap-2">
										{template.base_tropes.map((trope) => (
											<span
												key={trope}
												className="px-4 py-2 bg-romance-50 border border-romance-200 rounded-full text-romance-700 font-medium"
											>
												{TROPE_LABELS[trope as keyof typeof TROPE_LABELS] ||
													trope}
											</span>
										))}
									</div>
								</div>

								{/* Stats */}
								<div className="flex items-center gap-6 mb-8 text-slate-600">
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
						<div className="bg-white rounded-2xl shadow-xl p-8">
							<h2 className="text-2xl font-bold text-slate-900 mb-6">
								Key Decision Points
							</h2>
							<p className="text-slate-600 mb-6">
								Throughout your story, you'll make choices that shape the
								narrative. Here's a preview of some key moments:
							</p>

							<div className="space-y-6">
								{template.choicePoints.map((choice) => (
									<div
										key={choice.id}
										className="border border-slate-200 rounded-lg p-6 hover:border-romance-300 transition-colors"
									>
										<div className="flex items-start gap-4">
											<div className="shrink-0 w-10 h-10 bg-romance-100 rounded-full flex items-center justify-center">
												<span className="text-romance-700 font-bold">
													{choice.scene_number}
												</span>
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-semibold text-slate-900 mb-3">
													{choice.prompt_text}
												</h3>
												<div className="space-y-2">
													{choice.options.map((option) => (
														<div
															key={option.id}
															className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
														>
															<div className="w-2 h-2 bg-romance-500 rounded-full"></div>
															<span className="text-slate-700">
																{option.text}
															</span>
															<span className="ml-auto text-xs text-slate-500 bg-white px-2 py-1 rounded">
																{option.tone}
															</span>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

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
								<p className="text-slate-500 text-sm mt-3">
									Your choices will create a unique story experience
								</p>
							</div>
						</div>
					</>
				)}
			</PageContainer>
		</div>
	);
}
