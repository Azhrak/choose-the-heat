import { Loader2 } from "lucide-react";
import { PageBackground } from "./PageBackground";

interface FullPageLoaderProps {
	message?: string;
}

/**
 * Full-page loading component with centered spinner
 * Used for initial page loads and major state transitions
 */
export function FullPageLoader({
	message = "Loading...",
}: FullPageLoaderProps) {
	return (
		<PageBackground className="flex items-center justify-center">
			<div className="text-center space-y-4">
				<Loader2 className="w-12 h-12 text-romance-600 animate-spin mx-auto" />
				<div className="text-lg text-slate-600">{message}</div>
			</div>
		</PageBackground>
	);
}
