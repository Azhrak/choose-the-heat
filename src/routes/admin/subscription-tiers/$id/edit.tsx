import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { NoPermissions } from "~/components/admin/NoPermissions";
import { SubscriptionTierEditor } from "~/components/admin/SubscriptionTierEditor";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { useAdminTierQuery } from "~/hooks/useAdminSubscriptionTiersQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import type { SubscriptionTier } from "~/lib/db/types";

export const Route = createFileRoute("/admin/subscription-tiers/$id/edit")({
	component: EditSubscriptionTierPage,
});

function EditSubscriptionTierPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	// Fetch current user to check role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch tier data
	const {
		data: tierData,
		isLoading: tierLoading,
		error,
	} = useAdminTierQuery(id as SubscriptionTier);

	if (userLoading || tierLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<ErrorMessage
					message={error instanceof Error ? error.message : "An error occurred"}
				/>
			</div>
		);
	}

	if (!userData) {
		return null;
	}

	// Check if user is admin
	if (userData.role !== "admin") {
		return (
			<NoPermissions
				title="Admin Access Required"
				message="Subscription tier management is restricted to administrators only."
				backTo="/admin"
			/>
		);
	}

	if (!tierData) {
		return null;
	}

	const { role } = userData;
	const { tier } = tierData;

	return (
		<AdminLayout currentPath="/admin/subscription-tiers" userRole={role}>
			<Stack gap="md">
				{/* Back Button */}
				<button
					type="button"
					onClick={() => navigate({ to: "/admin/subscription-tiers" })}
					className="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 transition-colors w-fit"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Subscription Tiers
				</button>

				<div className="flex flex-col gap-2">
					<Heading level="h1">Edit Subscription Tier: {tier.name}</Heading>
					<p className="text-sm text-slate-600 dark:text-gray-400">
						Tier ID: <code className="font-mono">{tier.tier}</code>
					</p>
				</div>

				{/* Editor Component */}
				<SubscriptionTierEditor tier={tier} />
			</Stack>
		</AdminLayout>
	);
}
