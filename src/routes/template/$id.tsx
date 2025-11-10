import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	Heart,
	Loader2,
	LogOut,
	Sparkles,
	User,
} from "lucide-react";
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

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	// Fetch template details
	const { data, isLoading, error } = useQuery({
		queryKey: ["template", id],
		queryFn: async () => {
			const response = await fetch(`/api/templates/${id}`, {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error("Template not found");
				}
				throw new Error("Failed to fetch template");
			}
			const result = await response.json();
			// Parse options JSON string
			return {
				...result,
				template: {
					...result.template,
					choicePoints: result.template.choicePoints.map((cp: any) => ({
						...cp,
						options:
							typeof cp.options === "string"
								? JSON.parse(cp.options)
								: cp.options,
					})),
				},
			} as { template: Template };
		},
	});

	const template = data?.template;

	return (
		<div className="min-h-screen bg-gradient-to-br from-romance-50 via-white to-romance-100">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Heart className="w-8 h-8 text-romance-600" fill="currentColor" />
						<span className="text-xl font-bold text-slate-900">
							Spicy Tales
						</span>
					</div>
					<nav className="flex items-center gap-4">
						<Link
							to="/browse"
							className="text-slate-700 hover:text-romance-600 font-medium"
						>
							Browse
						</Link>
						<Link
							to="/library"
							className="text-slate-700 hover:text-romance-600 font-medium"
						>
							My Library
						</Link>
						<Link
							to="/profile"
							className="flex items-center gap-2 text-slate-700 hover:text-romance-600 font-medium"
						>
							<User className="w-4 h-4" />
							Profile
						</Link>
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-romance-600 font-medium"
						>
							<LogOut className="w-4 h-4" />
							Logout
						</button>
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-5xl mx-auto">
					{/* Back Button */}
					<button
						onClick={() => navigate({ to: "/browse" })}
						className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Browse
					</button>

					{/* Loading State */}
					{isLoading && (
						<div className="flex justify-center items-center py-20">
							<Loader2 className="w-8 h-8 text-romance-600 animate-spin" />
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
							<p className="text-red-800 text-lg mb-4">
								{error.message || "Failed to load template"}
							</p>
							<Link
								to="/browse"
								className="inline-block px-6 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700"
							>
								Return to Browse
							</Link>
						</div>
					)}

					{/* Template Details */}
					{!isLoading && !error && template && (
						<>
							{/* Hero Section */}
							<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
								<div
									className={`h-64 bg-gradient-to-br ${template.cover_gradient} flex items-center justify-center`}
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
												<div className="flex-shrink-0 w-10 h-10 bg-romance-100 rounded-full flex items-center justify-center">
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
				</div>
			</div>
		</div>
	);
}
