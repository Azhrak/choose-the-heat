import type { ReactNode } from "react";

interface PageBackgroundProps {
	children: ReactNode;
	className?: string;
}

/**
 * PageBackground - A reusable wrapper component for the standard page background gradient
 * Follows props object pattern (no destructuring)
 *
 * Provides the consistent romance-themed gradient background used across the application.
 * Includes min-h-screen by default and can be extended with additional className props.
 *
 * @param props.children - Content to render inside background
 * @param props.className - Additional CSS classes
 *
 * @example
 * <PageBackground>
 *   <Header />
 *   <main>Content here</main>
 *   <Footer />
 * </PageBackground>
 *
 * @example With additional classes
 * <PageBackground className="flex items-center justify-center">
 *   <LoginForm />
 * </PageBackground>
 */
export function PageBackground(props: PageBackgroundProps) {
	const className = props.className || "";
	const baseClasses =
		"min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors";
	const combinedClasses = className
		? `${baseClasses} ${className}`
		: baseClasses;

	return <div className={combinedClasses}>{props.children}</div>;
}
