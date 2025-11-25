import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		href: string;
	};
	className?: string;
	children?: ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className = "",
	children,
}: EmptyStateProps) {
	return (
		<Card className={cn("text-center space-y-4", className)} padding="lg">
			<Icon className="w-16 h-16 text-slate-300 mx-auto" />
			<h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
				{title}
			</h2>
			<div className="space-y-6">
				<p className="text-slate-600 dark:text-slate-300">{description}</p>
				{action && (
					<Link
						to={action.href}
						className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
					>
						{action.label}
					</Link>
				)}
				{children}
			</div>
		</Card>
	);
}
