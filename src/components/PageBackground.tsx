import type { ReactNode } from "react";

interface PageBackgroundProps {
	children: ReactNode;
	className?: string;
}

/**
 * PageBackground - A reusable wrapper component for the standard page background gradient
 *
 * Provides the consistent romance-themed gradient background used across the application.
 * Includes min-h-screen by default and can be extended with additional className props.
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
export function PageBackground({
	children,
	className = "",
}: PageBackgroundProps) {
	const baseClasses =
		"min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100";
	const combinedClasses = className
		? `${baseClasses} ${className}`
		: baseClasses;

	return <div className={combinedClasses}>{children}</div>;
}
