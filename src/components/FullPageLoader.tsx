import { Loader2 } from "lucide-react";

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
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100 flex items-center justify-center">
			<div className="text-center">
				<Loader2 className="w-12 h-12 text-romance-600 animate-spin mx-auto mb-4" />
				<div className="text-lg text-slate-600">{message}</div>
			</div>
		</div>
	);
}
