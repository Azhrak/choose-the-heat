import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";
import type { UserRole } from "~/lib/db/types";

interface AdminLayoutProps {
	children: ReactNode;
	currentPath: string;
	userRole: UserRole;
}

export function AdminLayout({
	children,
	currentPath,
	userRole,
}: AdminLayoutProps) {
	return (
		<div className="flex min-h-screen bg-slate-50">
			{/* Sidebar Navigation */}
			<AdminNav currentPath={currentPath} userRole={userRole} />

			{/* Main Content */}
			<main className="flex-1 p-8">
				<div className="max-w-7xl mx-auto">{children}</div>
			</main>
		</div>
	);
}
