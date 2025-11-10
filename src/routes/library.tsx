import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Heart, LogOut, User } from "lucide-react";

export const Route = createFileRoute("/library")({
	component: LibraryPage,
});

function LibraryPage() {
	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-romance-50 via-white to-romance-100">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Heart className="w-8 h-8 text-romance-600" fill="currentColor" />
						<span className="text-xl font-bold text-slate-900">
							Spicy Tales
						</span>
					</div>
					<nav className="flex items-center gap-4">
						<Link
							to="/browse"
							className="text-slate-700 hover:text-romance-600 font-medium"
						>
							Browse
						</Link>
						<Link
							to="/library"
							className="text-slate-700 hover:text-romance-600 font-medium"
						>
							My Library
						</Link>
						<Link
							to="/profile"
							className="flex items-center gap-2 text-slate-700 hover:text-romance-600 font-medium"
						>
							<User className="w-4 h-4" />
							Profile
						</Link>
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-romance-600 font-medium"
						>
							<LogOut className="w-4 h-4" />
							Logout
						</button>
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-4xl font-bold text-slate-900 mb-8">My Library</h1>

					{/* Empty State */}
					<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
						<BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-slate-900 mb-4">
							No Stories Yet
						</h2>
						<p className="text-slate-600 mb-6">
							Start your first romance adventure from the Browse page
						</p>
						<Link
							to="/browse"
							className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
						>
							Browse Stories
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
