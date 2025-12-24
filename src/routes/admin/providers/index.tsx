import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { AIProviderManagement } from "~/components/admin/AIProviderManagement";
import { NoPermissions } from "~/components/admin/NoPermissions";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";

export const Route = createFileRoute("/admin/providers/")({
	component: ProvidersPage,
});

function ProvidersPage() {
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	if (userLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (!userData) {
		return null;
	}

	// Only admins can access this page
	if (userData.role !== "admin") {
		return (
			<NoPermissions message="You don't have permission to access provider management. This area is restricted to administrators only." />
		);
	}

	return (
		<AdminLayout currentPath="/admin/providers" userRole={userData.role}>
			<AIProviderManagement />
		</AdminLayout>
	);
}
