import { useNavigate } from "@tanstack/react-router";
import { Button } from "~/components/Button";
import { Stack } from "~/components/ui/Stack";

interface NoPermissionsProps {
	title?: string;
	message?: string;
	backTo?: "/admin" | "/browse";
	backLabel?: string;
}

/**
 * NoPermissions - Error page for unauthorized access
 * Follows props object pattern (no destructuring)
 *
 * @param props.title - Error page title (default: "Access Denied")
 * @param props.message - Error message (default: "You don't have permission to access this page.")
 * @param props.backTo - Navigation target (default: "/browse")
 * @param props.backLabel - Button label (auto-generated based on backTo if not provided)
 */
export function NoPermissions(props: NoPermissionsProps) {
	const navigate = useNavigate();

	const title = props.title || "Access Denied";
	const message =
		props.message || "You don't have permission to access this page.";
	const backTo = props.backTo || "/browse";
	const backLabel = props.backLabel;

	const defaultBackLabel =
		backTo === "/admin" ? "Back to Dashboard" : "Back to Browse";

	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-50">
			<div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 text-center">
				<Stack gap="sm">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<svg
							className="w-8 h-8 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Warning icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<Stack gap="xs">
						<h1 className="text-2xl font-bold text-slate-900">{title}</h1>
						<p className="text-slate-600">{message}</p>
					</Stack>
					<Button
						type="button"
						onClick={() => navigate({ to: backTo })}
						variant="primary"
						className="w-full"
					>
						{backLabel || defaultBackLabel}
					</Button>
				</Stack>
			</div>
		</div>
	);
}
