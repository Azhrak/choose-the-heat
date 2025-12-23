import { Archive, ArchiveRestore, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "~/components/admin";
import type { TemplateStatus } from "~/lib/api/types";

interface TemplateStatusManagerProps {
	currentStatus: TemplateStatus;
	onStatusChange: (status: TemplateStatus) => void;
	isLoading?: boolean;
}

/**
 * TemplateStatusManager - UI for changing template status
 * Follows props object pattern (no destructuring)
 *
 * @param props.currentStatus - Current template status
 * @param props.onStatusChange - Callback when status changes
 * @param props.isLoading - Loading state (default: false)
 */
export function TemplateStatusManager(props: TemplateStatusManagerProps) {
	const isLoading = props.isLoading || false;
	const [showDialog, setShowDialog] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<TemplateStatus | null>(
		null,
	);

	const handleStatusClick = (status: TemplateStatus) => {
		setPendingStatus(status);
		setShowDialog(true);
	};

	const confirmStatusChange = () => {
		if (pendingStatus) {
			props.onStatusChange(pendingStatus);
			setShowDialog(false);
			setPendingStatus(null);
		}
	};

	const getStatusDialogMessage = () => {
		if (!pendingStatus) return "";

		switch (pendingStatus) {
			case "draft":
				return "This will unpublish the template and hide it from public view.";
			case "published":
				return "This will make the template visible to all users.";
			case "archived":
				return "This will archive the template and hide it from public view. Existing user stories will remain accessible.";
			default:
				return "";
		}
	};

	return (
		<>
			<div className="flex flex-wrap gap-3">
				{props.currentStatus !== "draft" && (
					<button
						type="button"
						onClick={() => handleStatusClick("draft")}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<EyeOff className="w-4 h-4" />
						Set as Draft
					</button>
				)}
				{props.currentStatus !== "published" && (
					<button
						type="button"
						onClick={() => handleStatusClick("published")}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Eye className="w-4 h-4" />
						Publish
					</button>
				)}
				{props.currentStatus !== "archived" && (
					<button
						type="button"
						onClick={() => handleStatusClick("archived")}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Archive className="w-4 h-4" />
						Archive
					</button>
				)}
				{props.currentStatus === "archived" && (
					<button
						type="button"
						onClick={() => handleStatusClick("published")}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<ArchiveRestore className="w-4 h-4" />
						Unarchive
					</button>
				)}
			</div>

			<ConfirmDialog
				isOpen={showDialog}
				onClose={() => {
					setShowDialog(false);
					setPendingStatus(null);
				}}
				onConfirm={confirmStatusChange}
				title={`Change status to ${pendingStatus}?`}
				message={getStatusDialogMessage()}
				confirmText="Change Status"
				loading={isLoading}
			/>
		</>
	);
}
