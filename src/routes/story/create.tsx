import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	Heart,
	Loader2,
	LogOut,
	User,
} from "lucide-react";

export const Route = createFileRoute("/story/create")({
	component: StoryCreatePage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			templateId: (search.templateId as string) || "",
		};
	},
});

interface Template {
	id: string;
	title: string;
	description: string;
	base_tropes: string[];
	estimated_scenes: number;
	cover_gradient: string;
}

function StoryCreatePage() {
	const { templateId } = Route.useSearch();
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
	const { data, isLoading } = useQuery({
		queryKey: ["template", templateId],
		queryFn: async () => {
			const response = await fetch(`/api/templates/${templateId}`, {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch template");
			return response.json() as Promise<{ template: Template }>;
		},
		enabled: !!templateId,
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
				<div className="max-w-3xl mx-auto">
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

					{/* Story Creation (Coming Soon) */}
					{!isLoading && template && (
						<div className="bg-white rounded-2xl shadow-xl p-8">
							<div className="text-center mb-8">
								<BookOpen className="w-16 h-16 text-romance-500 mx-auto mb-4" />
								<h1 className="text-3xl font-bold text-slate-900 mb-4">
									Create Your Story
								</h1>
								<p className="text-lg text-slate-600">
									You've selected:{" "}
									<span className="font-semibold">{template.title}</span>
								</p>
							</div>

							<div className="bg-romance-50 border border-romance-200 rounded-lg p-8 mb-8">
								<h2 className="text-xl font-bold text-slate-900 mb-4">
									Coming Soon!
								</h2>
								<p className="text-slate-700 mb-4">
									The story creation and reading interface is being developed in
									the next phase. This will include:
								</p>
								<ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
									<li>Customize story preferences (override your defaults)</li>
									<li>Name your protagonist</li>
									<li>Start reading AI-generated scenes</li>
									<li>Make choices that shape your unique story</li>
									<li>Save your progress automatically</li>
								</ul>
								<p className="text-slate-600 text-sm">
									For now, you can explore other templates or manage your
									profile settings.
								</p>
							</div>

							<div className="flex gap-4">
								<Link
									to="/browse"
									className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-center"
								>
									Browse More Templates
								</Link>
								<Link
									to="/template/$id"
									params={{ id: templateId }}
									className="flex-1 px-6 py-3 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors text-center"
								>
									View Template Details
								</Link>
							</div>
						</div>
					)}

					{/* No Template Selected */}
					{!isLoading && !templateId && (
						<div className="bg-white rounded-2xl shadow-xl p-8 text-center">
							<h2 className="text-2xl font-bold text-slate-900 mb-4">
								No Template Selected
							</h2>
							<p className="text-slate-600 mb-6">
								Please select a template from the browse page to create your
								story.
							</p>
							<Link
								to="/browse"
								className="inline-block px-6 py-3 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700"
							>
								Browse Templates
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
