import { Link } from "@tanstack/react-router";
import {
	LayoutDashboard,
	FileText,
	Users,
	ScrollText,
	ArrowLeft,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { UserRole } from "~/lib/db/types";

interface AdminNavProps {
	currentPath: string;
	userRole: UserRole;
}

export function AdminNav({ currentPath, userRole }: AdminNavProps) {
	const isActive = (path: string) => currentPath.startsWith(path);

	const navItems = [
		{
			label: "Dashboard",
			path: "/admin",
			icon: LayoutDashboard,
			roles: ["editor", "admin"] as UserRole[],
		},
		{
			label: "Templates",
			path: "/admin/templates",
			icon: FileText,
			roles: ["editor", "admin"] as UserRole[],
		},
		{
			label: "Users",
			path: "/admin/users",
			icon: Users,
			roles: ["admin"] as UserRole[],
		},
		{
			label: "Audit Logs",
			path: "/admin/audit-logs",
			icon: ScrollText,
			roles: ["admin"] as UserRole[],
		},
	];

	const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

	return (
		<nav className="w-64 bg-white border-r border-slate-200 min-h-screen p-6">
			{/* Back to site link */}
			<Link
				to="/browse"
				className="flex items-center gap-2 text-slate-600 hover:text-romance-600 mb-8 transition-colors"
			>
				<ArrowLeft className="w-4 h-4" />
				<span className="text-sm font-medium">Back to Site</span>
			</Link>

			{/* Navigation title */}
			<h2 className="text-lg font-bold text-slate-900 mb-6">Admin Panel</h2>

			{/* Navigation items */}
			<ul className="space-y-2">
				{visibleItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.path);

					return (
						<li key={item.path}>
							<Link
								to={item.path}
								className={cn(
									"flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors",
									active
										? "bg-romance-50 text-romance-700"
										: "text-slate-700 hover:bg-slate-50",
								)}
							>
								<Icon className="w-5 h-5" />
								{item.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
