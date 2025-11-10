import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2, LogOut, Search, User } from "lucide-react";
import { useState } from "react";
import { NovelCard } from "~/components/NovelCard";
import { TROPE_LABELS, TROPES, type Trope } from "~/lib/types/preferences";

export const Route = createFileRoute("/browse")({
	component: BrowsePage,
});

interface NovelTemplate {
	id: string;
	title: string;
	description: string;
	base_tropes: string[];
	estimated_scenes: number;
	cover_gradient: string;
}

function BrowsePage() {
	const [selectedTropes, setSelectedTropes] = useState<Trope[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

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

	// Build query params
	const queryParams = new URLSearchParams();
	if (selectedTropes.length > 0) {
		queryParams.set("tropes", selectedTropes.join(","));
	}
	if (searchQuery) {
		queryParams.set("search", searchQuery);
	}

	// Fetch templates
	const { data, isLoading, error } = useQuery({
		queryKey: ["templates", selectedTropes, searchQuery],
		queryFn: async () => {
			const url = `/api/templates${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
			const response = await fetch(url, {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch templates");
			return response.json() as Promise<{ templates: NovelTemplate[] }>;
		},
	});

	const toggleTrope = (trope: Trope) => {
		setSelectedTropes((prev) =>
			prev.includes(trope) ? prev.filter((t) => t !== trope) : [...prev, trope],
		);
	};

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
				<div className="max-w-7xl mx-auto">
					{/* Welcome Section */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-slate-900 mb-4">
							Choose Your Romance Adventure
						</h1>
						<p className="text-lg text-slate-600">
							Select a story template and start your personalized journey
						</p>
					</div>

					{/* Search Bar */}
					<div className="mb-6">
						<div className="relative max-w-2xl mx-auto">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input
								type="text"
								placeholder="Search for novels..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-romance-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Trope Filters */}
					<div className="mb-8">
						<h2 className="text-sm font-semibold text-slate-700 mb-3">
							Filter by Tropes:
						</h2>
						<div className="flex flex-wrap gap-2">
							{TROPES.map((trope) => (
								<button
									key={trope}
									onClick={() => toggleTrope(trope)}
									className={`px-4 py-2 rounded-lg font-medium transition-colors ${
										selectedTropes.includes(trope)
											? "bg-romance-600 text-white"
											: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
									}`}
								>
									{TROPE_LABELS[trope]}
								</button>
							))}
						</div>
						{selectedTropes.length > 0 && (
							<button
								onClick={() => setSelectedTropes([])}
								className="mt-3 text-sm text-romance-600 hover:text-romance-700 font-medium"
							>
								Clear filters
							</button>
						)}
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="flex justify-center items-center py-20">
							<Loader2 className="w-8 h-8 text-romance-600 animate-spin" />
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
							<p className="text-red-800">
								Failed to load templates. Please try again later.
							</p>
						</div>
					)}

					{/* Templates Grid */}
					{!isLoading && !error && data && (
						<>
							{data.templates.length === 0 ? (
								<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
									<p className="text-slate-600 text-lg">
										No templates found matching your criteria. Try adjusting
										your filters!
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{data.templates.map((template) => (
										<NovelCard
											key={template.id}
											id={template.id}
											title={template.title}
											description={template.description}
											baseTropes={template.base_tropes}
											estimatedScenes={template.estimated_scenes}
											coverGradient={template.cover_gradient}
										/>
									))}
								</div>
							)}

							{/* Stats */}
							{data.templates.length > 0 && (
								<div className="mt-12 text-center">
									<p className="text-slate-600">
										Showing {data.templates.length}{" "}
										{data.templates.length === 1 ? "template" : "templates"}
									</p>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
