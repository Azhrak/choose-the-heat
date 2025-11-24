import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
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
import { Pagination } from "~/components/Pagination";
import { TropeFilter } from "~/components/TropeFilter";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTemplatesQuery } from "~/hooks/useTemplatesQuery";
import type { Trope } from "~/lib/types/preferences";

export const Route = createFileRoute("/browse")({
	component: BrowsePage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			page: Number(search.page) || 1,
			search: (search.search as string) || "",
			tropes: (search.tropes as string) || "",
		};
	},
});

function BrowsePage() {
	const navigate = Route.useNavigate();
	const { page, search: searchQuery, tropes: tropesParam } = Route.useSearch();

	// Parse tropes from URL parameter
	const selectedTropes: Trope[] = tropesParam
		? (tropesParam.split(",") as Trope[])
		: [];

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	// Fetch templates with pagination
	const { data, isLoading, error } = useTemplatesQuery({
		tropes: selectedTropes,
		search: searchQuery,
		page,
		limit: 15,
	});

	// Handler to update URL search parameters
	const updateSearchParams = (updates: {
		page?: number;
		search?: string;
		tropes?: string;
	}) => {
		navigate({
			search: (prev) => ({
				...prev,
				...updates,
			}),
		});
	};

	// Handler for trope filter changes
	const handleTropeChange = (tropes: Trope[]) => {
		updateSearchParams({
			tropes: tropes.length > 0 ? tropes.join(",") : "",
			page: 1, // Reset to first page when filters change
		});
	};

	// Handler for search query changes
	const handleSearchChange = (value: string) => {
		updateSearchParams({
			search: value,
			page: 1, // Reset to first page when search changes
		});
	};

	// Handler for page changes
	const handlePageChange = (newPage: number) => {
		updateSearchParams({ page: newPage });
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
								onChange={(e) => handleSearchChange(e.target.value)}
								className="pl-12"
							/>
						</div>
					</div>
					{/* Trope Filters */}
					<TropeFilter
						selectedTropeKeys={selectedTropes}
						onChange={handleTropeChange}
					/>
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

							{/* Pagination and Stats */}
							{data.templates.length > 0 && data.pagination && (
								<div className="space-y-6">
									{/* Stats */}
									<div className="text-center">
										<p className="text-slate-600">
											Showing{" "}
											{(data.pagination.page - 1) * data.pagination.limit + 1}-
											{Math.min(
												data.pagination.page * data.pagination.limit,
												data.pagination.totalCount,
											)}{" "}
											of {data.pagination.totalCount}{" "}
											{data.pagination.totalCount === 1
												? "template"
												: "templates"}
										</p>
									</div>

									{/* Pagination Controls */}
									<Pagination
										currentPage={data.pagination.page}
										totalPages={data.pagination.totalPages}
										onPageChange={handlePageChange}
									/>
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
