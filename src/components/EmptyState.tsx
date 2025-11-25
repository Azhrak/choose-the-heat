import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "~/components/ui/Card";
import { LinkButton } from "~/components/ui/LinkButton";
import { Stack } from "~/components/ui/Stack";
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
			<Stack gap="md">
				<p className="text-slate-600 dark:text-slate-300">{description}</p>
				{action && (
					<LinkButton to={action.href} variant="primary">
						{action.label}
					</LinkButton>
				)}
				{children}
			</Stack>
		</Card>
	);
}
