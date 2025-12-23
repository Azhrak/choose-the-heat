import type { ReactNode } from "react";
import type { UserRole } from "~/lib/db/types";
import { AdminNav } from "./AdminNav";

interface AdminLayoutProps {
	children: ReactNode;
	currentPath: string;
	userRole: UserRole;
}

/**
 * AdminLayout - Layout wrapper for admin pages with sidebar navigation
 * Follows props object pattern (no destructuring)
 *
 * @param props.children - Page content to render
 * @param props.currentPath - Current page path for active state
 * @param props.userRole - User role for conditional navigation
 */
export function AdminLayout(props: AdminLayoutProps) {
	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
			{/* Sidebar Navigation */}
			<AdminNav currentPath={props.currentPath} userRole={props.userRole} />

			{/* Main Content */}
			<main className="flex-1 p-8">
				<div className="max-w-7xl mx-auto">{props.children}</div>
			</main>
		</div>
	);
}
