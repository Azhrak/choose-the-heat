import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { EmptyState } from "~/components/EmptyState";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Footer } from "~/components/Footer";
import { FormInput } from "~/components/FormInput";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { NovelCard } from "~/components/NovelCard";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTemplatesQuery } from "~/hooks/useTemplatesQuery";
import { useTropesQuery } from "~/hooks/useTropesQuery";
import type { Trope } from "~/lib/types/preferences";

export const Route = createFileRoute("/browse")({
	component: BrowsePage,
});

function BrowsePage() {
	const [selectedTropes, setSelectedTropes] = useState<Trope[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	// Fetch tropes
	const { data: tropesData, isLoading: tropesLoading } = useTropesQuery();

	// Fetch templates
	const { data, isLoading, error } = useTemplatesQuery({
		tropes: selectedTropes,
		search: searchQuery,
	});

	const toggleTrope = (trope: Trope) => {
		setSelectedTropes((prev) =>
			prev.includes(trope) ? prev.filter((t) => t !== trope) : [...prev, trope],
		);
	};

	return (
		<PageBackground>
			<Header currentPath="/browse" userRole={profileData?.role} />

			<PageContainer maxWidth="full">
				<div className="space-y-8">
					{/* Welcome Section */}
					<div className="text-center space-y-4">
						<Heading level="h1" size="page">
							Choose Your Romance Adventure
						</Heading>
						<p className="text-lg text-slate-600">
							Select a story template and start your personalized journey
						</p>
					</div>
					{/* Search Bar */}
					<div>
						<div className="relative max-w-2xl mx-auto">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
							<FormInput
								label=""
								type="text"
								placeholder="Search for novels..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-12"
							/>
						</div>
					</div>{" "}
					{/* Trope Filters */}
					<div className="space-y-3">
						<Heading
							level="h2"
							size="label"
							className="text-slate-700 dark:text-gray-300"
						>
							Filter by Tropes:
						</Heading>
						{tropesLoading ? (
							<div className="flex gap-2">
								<div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
								<div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
								<div className="h-10 w-20 bg-slate-200 rounded animate-pulse" />
							</div>
						) : (
							<div className="flex flex-wrap gap-2">
								{tropesData?.tropes.map((trope) => (
									<button
										type="button"
										key={trope.key}
										onClick={() => toggleTrope(trope.key)}
										className={`px-4 py-2 rounded-lg font-medium transition-colors ${
											selectedTropes.includes(trope.key)
												? "bg-romance-600 text-white"
												: "bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-600"
										}`}
									>
										{trope.label}
									</button>
								))}
							</div>
						)}
						{selectedTropes.length > 0 && (
							<Button
								onClick={() => setSelectedTropes([])}
								variant="ghost"
								size="sm"
								className="text-romance-600 dark:text-romance-400 hover:text-romance-700 dark:hover:text-romance-300"
							>
								Clear filters
							</Button>
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
								<div className="text-center">
									<p className="text-slate-600">
										Showing {data.templates.length}{" "}
										{data.templates.length === 1 ? "template" : "templates"}
									</p>
								</div>
							)}
						</>
					)}
				</div>
			</PageContainer>
			<Footer />
		</PageBackground>
	);
}
