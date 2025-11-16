import { Link } from "@tanstack/react-router";
import { Home, LogOut } from "lucide-react";

interface AlreadyLoggedInNoticeProps {
	userName: string;
	logoutLoading: boolean;
	onLogout: () => void;
}

export function AlreadyLoggedInNotice({
	userName,
	logoutLoading,
	onLogout,
}: AlreadyLoggedInNoticeProps) {
	return (
		<div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg space-y-3">
			<p className="text-sm text-blue-900 dark:text-blue-200">
				You are already logged in as <strong>{userName}</strong>
			</p>
			<div className="flex gap-2">
				<Link
					to="/browse"
					className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
				>
					<Home className="w-4 h-4" />
					Go Home
				</Link>
				<button
					type="button"
					onClick={onLogout}
					disabled={logoutLoading}
					className="flex-1 px-3 py-2 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
				>
					<LogOut className="w-4 h-4" />
					{logoutLoading ? "Logging out..." : "Logout"}
				</button>
			</div>
		</div>
	);
}
