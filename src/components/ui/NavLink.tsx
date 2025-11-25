import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface NavLinkProps {
	to: string;
	activeClassName?: string;
	className?: string;
	matchSubpaths?: boolean;
	children: ReactNode;
}

export function NavLink({
	to,
	activeClassName = "text-romance-600 dark:text-romance-300",
	className = "text-slate-700 dark:text-slate-200 hover:text-romance-600 dark:hover:text-romance-300 font-medium transition-colors",
	matchSubpaths = false,
	children,
}: NavLinkProps) {
	const router = useRouterState();
	const currentPath = router.location.pathname;

	const isActive = matchSubpaths
		? currentPath.startsWith(to)
		: currentPath === to;

	return (
		<Link
			to={to}
			className={`${className} ${isActive ? activeClassName : ""}`.trim()}
		>
			{children}
		</Link>
	);
}
