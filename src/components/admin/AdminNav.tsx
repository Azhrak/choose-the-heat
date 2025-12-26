import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Beaker,
	Cpu,
	CreditCard,
	FileText,
	LayoutDashboard,
	ScrollText,
	Settings,
	Tags,
	Users,
} from "lucide-react";
import { Stack } from "~/components/ui/Stack";
import type { UserRole } from "~/lib/db/types";
import { cn } from "~/lib/utils";

interface AdminNavProps {
	currentPath: string;
	userRole: UserRole;
}

/**
 * AdminNav - Sidebar navigation for admin panel
 * Follows props object pattern (no destructuring)
 *
 * @param props.currentPath - Current page path for active state
 * @param props.userRole - User role for conditional navigation items
 */
export function AdminNav(props: AdminNavProps) {
	const isActive = (path: string) => {
		if (path === "/admin") {
			return props.currentPath === "/admin";
		}
		return props.currentPath.startsWith(path);
	};

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
			label: "Tropes",
			path: "/admin/tropes",
			icon: Tags,
			roles: ["editor", "admin"] as UserRole[],
		},
		{
			label: "Users",
			path: "/admin/users",
			icon: Users,
			roles: ["admin"] as UserRole[],
		},
		{
			label: "Subscription Tiers",
			path: "/admin/subscription-tiers",
			icon: CreditCard,
			roles: ["admin"] as UserRole[],
		},
		{
			label: "Audit Logs",
			path: "/admin/audit-logs",
			icon: ScrollText,
			roles: ["admin"] as UserRole[],
		},
		{
			label: "Settings",
			path: "/admin/settings",
			icon: Settings,
			roles: ["admin"] as UserRole[],
		},
		{
			label: "AI Providers",
			path: "/admin/providers",
			icon: Cpu,
			roles: ["admin"] as UserRole[],
		},
		{
			label: "Test Generation",
			path: "/admin/test",
			icon: Beaker,
			roles: ["admin"] as UserRole[],
		},
	];

	const visibleItems = navItems.filter((item) =>
		item.roles.includes(props.userRole),
	);

	return (
		<nav className="w-64 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 min-h-screen p-6">
			<Stack gap="lg">
				{/* Back to site link */}
				<Link
					to="/browse"
					className="flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-romance-600 dark:hover:text-romance-400 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="text-sm font-medium">Back to Site</span>
				</Link>

				<Stack gap="md">
					{/* Navigation title */}
					<h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">
						Admin Panel
					</h2>

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
												? "bg-romance-50 dark:bg-romance-900/20 text-romance-700 dark:text-romance-700"
												: "text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50",
										)}
									>
										<Icon className="w-5 h-5" />
										{item.label}
									</Link>
								</li>
							);
						})}
					</ul>
				</Stack>
			</Stack>
		</nav>
	);
}
