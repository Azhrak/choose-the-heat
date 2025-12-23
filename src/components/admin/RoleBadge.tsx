import type { UserRole } from "~/lib/db/types";
import { cn } from "~/lib/utils";

interface RoleBadgeProps {
	role: UserRole;
	className?: string;
}

const roleConfig = {
	user: {
		label: "User",
		className: "bg-slate-100 text-slate-800 border-slate-300",
	},
	editor: {
		label: "Editor",
		className: "bg-blue-100 text-blue-800 border-blue-300",
	},
	admin: {
		label: "Admin",
		className: "bg-purple-100 text-purple-800 border-purple-300",
	},
};

/**
 * RoleBadge - Badge component for user roles
 * Follows props object pattern (no destructuring)
 *
 * @param props.role - User role (user, editor, admin)
 * @param props.className - Additional CSS classes
 */
export function RoleBadge(props: RoleBadgeProps) {
	const config = roleConfig[props.role];

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
