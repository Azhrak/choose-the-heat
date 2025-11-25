import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Stack } from "~/components/ui/Stack";

interface BulkAction {
	label: string;
	icon: LucideIcon;
	onClick: () => void;
	variant?: "primary" | "secondary" | "danger" | "ghost";
	requiresAdmin?: boolean;
}

interface BulkActionsToolbarProps {
	selectedCount: number;
	onClearSelection: () => void;
	actions: BulkAction[];
	isLoading?: boolean;
	itemLabel: string;
	userRole?: string;
	error?: string | null;
	accentColor?: "romance" | "purple" | "blue" | "green";
}

const accentColorClasses = {
	romance:
		"bg-romance-50 dark:bg-romance-900/20 border-romance-200 dark:border-romance-700",
	purple:
		"bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
	blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
	green:
		"bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
};

export function BulkActionsToolbar({
	selectedCount,
	onClearSelection,
	actions,
	isLoading = false,
	itemLabel,
	userRole,
	error,
	accentColor = "romance",
}: BulkActionsToolbarProps) {
	if (selectedCount === 0) {
		return null;
	}

	const filteredActions = actions.filter(
		(action) => !action.requiresAdmin || userRole === "admin",
	);

	return (
		<Stack gap="sm">
			<div
				className={`${accentColorClasses[accentColor]} border rounded-lg p-4 flex items-center justify-between`}
			>
				<div className="flex items-center gap-4">
					<span className="text-sm font-medium text-slate-900 dark:text-gray-100">
						{selectedCount} {itemLabel}
						{selectedCount !== 1 ? "s" : ""} selected
					</span>
					<Button size="sm" variant="ghost" onClick={onClearSelection}>
						<X className="w-4 h-4" />
						Clear
					</Button>
				</div>
				<div className="flex gap-2">
					{filteredActions.map((action) => (
						<Button
							key={action.label}
							size="sm"
							variant={action.variant || "secondary"}
							onClick={action.onClick}
							disabled={isLoading}
							loading={isLoading}
						>
							<action.icon className="w-4 h-4" />
							{action.label}
						</Button>
					))}
				</div>
			</div>

			{error && <ErrorMessage message={error} />}
		</Stack>
	);
}
