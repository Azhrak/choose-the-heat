import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
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
import { TropeFilter } from "~/components/TropeFilter";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTemplatesQuery } from "~/hooks/useTemplatesQuery";
import type { Trope } from "~/lib/types/preferences";

export const Route = createFileRoute("/browse")({
	component: BrowsePage,
});

function BrowsePage() {
	const [selectedTropes, setSelectedTropes] = useState<Trope[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch current user profile
	const { data: profileData } = useCurrentUserQuery();

	// Fetch templates
	const { data, isLoading, error } = useTemplatesQuery({
		tropes: selectedTropes,
		search: searchQuery,
	});

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
					</div>
					{/* Trope Filters */}
					<TropeFilter
						selectedTropeKeys={selectedTropes}
						onChange={setSelectedTropes}
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
