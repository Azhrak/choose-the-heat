import { useNavigate } from "@tanstack/react-router";
import { Button } from "~/components/Button";

interface NoPermissionsProps {
	title?: string;
	message?: string;
	backTo?: "/admin" | "/browse";
	backLabel?: string;
}

export function NoPermissions({
	title = "Access Denied",
	message = "You don't have permission to access this page.",
	backTo = "/browse",
	backLabel,
}: NoPermissionsProps) {
	const navigate = useNavigate();

	const defaultBackLabel =
		backTo === "/admin" ? "Back to Dashboard" : "Back to Browse";

	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-50">
			<div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 text-center">
				<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-8 h-8 text-red-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
				<p className="text-slate-600 mb-6">{message}</p>
				<button
					type="button"
					onClick={() => navigate({ to: backTo })}
					className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
				>
					{backLabel || defaultBackLabel}
				</button>
			</div>
		</div>
	);
}
