import type { TemplateStatus } from "~/lib/db/types";
import { cn } from "~/lib/utils";

interface StatusBadgeProps {
	status: TemplateStatus;
	className?: string;
}

const statusConfig = {
	draft: {
		label: "Draft",
		className: "bg-yellow-100 text-yellow-800 border-yellow-300",
	},
	published: {
		label: "Published",
		className: "bg-green-100 text-green-800 border-green-300",
	},
	archived: {
		label: "Archived",
		className: "bg-gray-100 text-gray-800 border-gray-300",
	},
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<span
			className={cn(
				"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
				config.className,
				className,
			)}
		>
			{config.label}
		</span>
	);
}
