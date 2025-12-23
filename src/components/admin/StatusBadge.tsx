import type { TemplateStatus } from "~/lib/db/types";
import { cn } from "~/lib/utils";

interface StatusBadgeProps {
	status: TemplateStatus;
	className?: string;
}

const statusConfig = {
	draft: {
		label: "Draft",
		className:
			"bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
	},
	published: {
		label: "Published",
		className:
			"bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700",
	},
	archived: {
		label: "Archived",
		className:
			"bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600",
	},
};

/**
 * StatusBadge - Badge component for template status
 * Follows props object pattern (no destructuring)
 *
 * @param props.status - Template status (draft, published, archived)
 * @param props.className - Additional CSS classes
 */
export function StatusBadge(props: StatusBadgeProps) {
	const config = statusConfig[props.status];

	return (
		<span
			className={cn(
				"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
				config.className,
				props.className,
			)}
		>
			{config.label}
		</span>
	);
}
