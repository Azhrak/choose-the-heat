import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "~/components/EmptyState";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Header } from "~/components/Header";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { NovelCard } from "~/components/NovelCard";
import { PageContainer } from "~/components/PageContainer";
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
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<Header currentPath="/browse" />

			<PageContainer maxWidth="full">
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
				{isLoading && <LoadingSpinner />}

				{/* Error State */}
				{error && (
					<ErrorMessage
						message="Failed to load templates. Please try again later."
						variant="centered"
					/>
				)}

				{/* Templates Grid */}
				{!isLoading && !error && data && (
					<>
						{data.templates.length === 0 ? (
							<EmptyState
								icon={Search}
								title="No Templates Found"
								description="No templates found matching your criteria. Try adjusting your filters!"
							/>
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
			</PageContainer>
		</div>
	);
}
