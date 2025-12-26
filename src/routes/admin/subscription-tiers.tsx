import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	CheckCircle2,
	DollarSign,
	RefreshCw,
	Users,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { DataTable } from "~/components/admin/DataTable";
import { NoPermissions } from "~/components/admin/NoPermissions";
import { StatCard } from "~/components/admin/StatCard";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import {
	useAdminTiersQuery,
	useSyncTiersToStripeMutation,
} from "~/hooks/useAdminSubscriptionTiersQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";

export const Route = createFileRoute("/admin/subscription-tiers")({
	component: SubscriptionTiersPage,
});

function SubscriptionTiersPage() {
	const navigate = useNavigate();
	const [syncMessage, setSyncMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	// Fetch current user to check role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch tiers and stats
	const { data, isLoading: tiersLoading, error } = useAdminTiersQuery();

	// Sync mutation
	const syncMutation = useSyncTiersToStripeMutation();

	if (userLoading || tiersLoading) {
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

	if (!data) {
		return null;
	}

	const { tiers, stats } = data;
	const { role } = userData;

	// Transform tiers to add id field for DataTable
	const tiersWithId = tiers.map((tier) => ({
		...tier,
		id: tier.tier, // Use tier enum as id
	}));

	// Handle sync to Stripe
	const handleSyncToStripe = async () => {
		try {
			setSyncMessage(null);
			await syncMutation.mutateAsync();
			setSyncMessage({
				type: "success",
				text: "Successfully synced all tiers to Stripe!",
			});
			setTimeout(() => setSyncMessage(null), 5000);
		} catch (error) {
			setSyncMessage({
				type: "error",
				text:
					error instanceof Error
						? error.message
						: "Failed to sync tiers to Stripe",
			});
			setTimeout(() => setSyncMessage(null), 5000);
		}
	};

	// Handle row click to navigate to edit page
	const handleRowClick = (tier: (typeof tiers)[0]) => {
		navigate({ to: `/admin/subscription-tiers/${tier.tier}/edit` });
	};

	return (
		<AdminLayout currentPath="/admin/subscription-tiers" userRole={role}>
			<Stack gap="md">
				<div className="flex flex-col gap-2">
					<Heading level="h1">Subscription Tiers</Heading>
					<Text>
						Manage subscription tier pricing, limits, and Stripe
						synchronization.
					</Text>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
					<StatCard
						title="Total Users"
						value={stats.total}
						icon={Users}
						color="bg-purple-500"
					/>
					<StatCard
						title="Free Tier"
						value={stats.free}
						icon={Users}
						color="bg-slate-500"
					/>
					<StatCard
						title="Basic Tier"
						value={stats.basic}
						icon={DollarSign}
						color="bg-blue-500"
					/>
					<StatCard
						title="Premium Tier"
						value={stats.premium}
						icon={DollarSign}
						color="bg-purple-600"
					/>
					<StatCard
						title="Premium Plus"
						value={stats.premium_plus}
						icon={DollarSign}
						color="bg-orange-500"
					/>
				</div>

				{/* Sync to Stripe Button */}
				<div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4">
					<div>
						<h3 className="font-medium text-slate-900 dark:text-gray-100">
							Stripe Synchronization
						</h3>
						<p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
							Create or update products and prices in Stripe for all tiers
						</p>
					</div>
					<button
						type="button"
						onClick={handleSyncToStripe}
						disabled={syncMutation.isPending}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
					>
						<RefreshCw
							className={`w-4 h-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
						/>
						{syncMutation.isPending ? "Syncing..." : "Sync to Stripe"}
					</button>
				</div>

				{/* Sync Message */}
				{syncMessage && (
					<div
						className={`p-4 rounded-lg ${
							syncMessage.type === "success"
								? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
								: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
						}`}
					>
						<p
							className={`text-sm ${
								syncMessage.type === "success"
									? "text-green-800 dark:text-green-200"
									: "text-red-800 dark:text-red-200"
							}`}
						>
							{syncMessage.text}
						</p>
					</div>
				)}

				{/* Tiers Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
					<DataTable
						data={tiersWithId}
						columns={[
							{
								header: "Tier",
								accessor: (t) => t.name,
								className: "font-medium text-slate-900 dark:text-gray-100",
								key: "name",
							},
							{
								header: "Monthly Price",
								accessor: (t) => `$${Number(t.price_monthly).toFixed(2)}`,
								className: "text-slate-600 dark:text-gray-400",
								key: "price_monthly",
							},
							{
								header: "Yearly Price",
								accessor: (t) =>
									t.price_yearly
										? `$${Number(t.price_yearly).toFixed(2)}`
										: "N/A",
								className: "text-slate-600 dark:text-gray-400",
								key: "price_yearly",
							},
							{
								header: "Text Gen/Day",
								accessor: (t) =>
									t.text_generations_per_day === -1
										? "Unlimited"
										: t.text_generations_per_day,
								className: "text-slate-600 dark:text-gray-400",
								key: "text_gen",
							},
							{
								header: "Voice Gen/Day",
								accessor: (t) =>
									t.voice_generations_per_day === -1
										? "Unlimited"
										: t.voice_generations_per_day,
								className: "text-slate-600 dark:text-gray-400",
								key: "voice_gen",
							},
							{
								header: "Stripe Status",
								accessor: (t) =>
									t.stripe_product_id ? (
										<span className="flex items-center gap-1 text-green-600 dark:text-green-400">
											<CheckCircle2 className="w-4 h-4" />
											Synced
										</span>
									) : (
										<span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
											<XCircle className="w-4 h-4" />
											Not Synced
										</span>
									),
								key: "stripe_status",
							},
							{
								header: "Status",
								accessor: (t) => (
									<span
										className={
											t.is_active
												? "text-green-600 dark:text-green-400 font-medium"
												: "text-slate-400 dark:text-gray-500"
										}
									>
										{t.is_active ? "Active" : "Inactive"}
									</span>
								),
								key: "status",
							},
						]}
						onRowClick={handleRowClick}
						emptyMessage="No subscription tiers found."
					/>
				</div>

				<div className="text-sm text-slate-600 dark:text-gray-400">
					<p>
						<strong>Note:</strong> Click on a tier to edit its details. Changes
						to pricing will automatically create new Stripe prices (old prices
						are archived).
					</p>
				</div>
			</Stack>
		</AdminLayout>
	);
}
