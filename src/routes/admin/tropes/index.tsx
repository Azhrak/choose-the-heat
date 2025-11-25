import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminLayout, NoPermissions } from "~/components/admin";
import { TropeModal } from "~/components/admin/TropeModal";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { useCreateTropeMutation } from "~/hooks/useCreateTropeMutation";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useDeleteTropeMutation } from "~/hooks/useDeleteTropeMutation";
import { useAdminTropesQuery } from "~/hooks/useTropesQuery";
import { useUpdateTropeMutation } from "~/hooks/useUpdateTropeMutation";

export const Route = createFileRoute("/admin/tropes/")({
	component: TropesListPage,
});

interface Trope {
	id: string;
	key: string;
	label: string;
	description: string | null;
	usageCount?: number;
	created_at: string;
	updated_at: string;
}

function TropesListPage() {
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingTrope, setEditingTrope] = useState<Trope | null>(null);
	const [createError, setCreateError] = useState<string | undefined>();
	const [updateError, setUpdateError] = useState<string | undefined>();

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch tropes with usage stats
	const {
		data: tropesData,
		isLoading: tropesLoading,
		error: tropesError,
	} = useAdminTropesQuery(!!userData);

	// Create mutation
	const createMutation = useCreateTropeMutation();

	// Update mutation
	const updateMutation = useUpdateTropeMutation();

	// Delete mutation
	const deleteMutation = useDeleteTropeMutation();

	const handleCreate = (data: {
		key: string;
		label: string;
		description?: string;
	}) => {
		setCreateError(undefined);
		createMutation.mutate(data, {
			onSuccess: () => {
				setShowAddModal(false);
			},
			onError: (error) => {
				setCreateError(
					error instanceof Error ? error.message : "Failed to create trope",
				);
			},
		});
	};

	const handleUpdate = (
		tropeId: string,
		data: { key: string; label: string; description?: string },
	) => {
		setUpdateError(undefined);
		updateMutation.mutate(
			{ tropeId, data },
			{
				onSuccess: () => {
					setEditingTrope(null);
				},
				onError: (error) => {
					setUpdateError(
						error instanceof Error ? error.message : "Failed to update trope",
					);
				},
			},
		);
	};

	const handleDelete = async (trope: Trope) => {
		if (!window.confirm(`Are you sure you want to delete "${trope.label}"?`)) {
			return;
		}

		deleteMutation.mutate(trope.id, {
			onError: (error) => {
				alert(
					error instanceof Error ? error.message : "Failed to delete trope",
				);
			},
		});
	};

	if (userLoading || tropesLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (tropesError) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<ErrorMessage
					message={
						tropesError instanceof Error
							? tropesError.message
							: "Failed to load tropes"
					}
				/>
			</div>
		);
	}

	if (!userData || !tropesData) {
		return null;
	}

	// Check if user has editor or admin role
	if (userData.role !== "editor" && userData.role !== "admin") {
		return (
			<NoPermissions message="You don't have permission to manage tropes. This area is restricted to editors and administrators only." />
		);
	}

	const { role } = userData;
	const tropes = tropesData.tropes;

	return (
		<AdminLayout currentPath="/admin/tropes" userRole={role}>
			<Stack gap="lg">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-2">
						<Heading level="h1">Tropes</Heading>
						<p className="text-slate-600 dark:text-gray-300">
							Manage story tropes that can be assigned to templates.
						</p>
					</div>
					<Button
						variant="primary"
						onClick={() => setShowAddModal(true)}
						className="flex items-center gap-2"
					>
						<Plus className="w-4 h-4" />
						Add Trope
					</Button>
				</div>

				{/* Tropes Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
						<thead className="bg-slate-50 dark:bg-gray-900">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
									Label
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
									Key
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
									Description
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
									Usage
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
							{tropes.map((trope) => (
								<tr key={trope.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-slate-900 dark:text-gray-100">
											{trope.label}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-slate-500 dark:text-gray-400 font-mono">
											{trope.key}
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-sm text-slate-500 dark:text-gray-400">
											{trope.description || "-"}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-slate-500 dark:text-gray-400">
											{trope.usageCount || 0} template(s)
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex items-center justify-end gap-2">
											<Button
												type="button"
												onClick={() => setEditingTrope(trope)}
												variant="ghost"
												className="p-2 text-romance-600 hover:text-romance-900 dark:text-romance-400 dark:hover:text-romance-300"
												title="Edit trope"
											>
												<Edit2 className="w-4 h-4" />
											</Button>
											{role === "admin" && (
												<Button
													type="button"
													onClick={() => handleDelete(trope)}
													variant="ghost"
													className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
													title="Delete trope"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Add Trope Modal */}
				<TropeModal
					mode="add"
					isOpen={showAddModal}
					onClose={() => {
						setShowAddModal(false);
						setCreateError(undefined);
					}}
					onSubmit={handleCreate}
					isLoading={createMutation.isPending}
					error={createError}
				/>

				{/* Edit Trope Modal */}
				<TropeModal
					mode="edit"
					isOpen={!!editingTrope}
					trope={editingTrope}
					onClose={() => {
						setEditingTrope(null);
						setUpdateError(undefined);
					}}
					onSubmit={handleUpdate}
					isLoading={updateMutation.isPending}
					error={updateError}
				/>
			</Stack>
		</AdminLayout>
	);
}
