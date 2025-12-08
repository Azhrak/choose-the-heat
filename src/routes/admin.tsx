import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ToastProvider } from "~/components/admin/ToastContext";

export const Route = createFileRoute("/admin")({
	component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
	return (
		<ToastProvider>
			<Outlet />
		</ToastProvider>
	);
}
