import { Link } from "@tanstack/react-router";
import { LogOut, Menu, Shield, User, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { NavLink } from "~/components/ui/NavLink";
import { api } from "~/lib/api/client";
import type { UserRole } from "~/lib/db/types";

interface HeaderProps {
	currentPath?: string;
	userRole?: UserRole;
}

export function Header({ currentPath = "", userRole }: HeaderProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isEditorOrAdmin = userRole === "editor" || userRole === "admin";

	const handleLogout = async () => {
		try {
			await api.post("/api/auth/logout");
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const isActive = (path: string) => currentPath === path;

	return (
		<header className="bg-white dark:bg-slate-950 shadow-sm dark:shadow-black/30 border-b border-transparent dark:border-slate-800 transition-colors">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link to="/browse" className="flex items-center gap-2">
						<img
							src="/logo-200x200.png"
							alt="Choose the Heat Logo"
							className="w-8 h-8"
						/>
						<span className="text-xl font-bold text-slate-900 dark:text-white">
							Choose the Heat
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-4">
						<NavLink to="/browse">Browse</NavLink>
						<NavLink to="/library">My Library</NavLink>
						{isEditorOrAdmin && (
							<NavLink
								to="/admin"
								matchSubpaths
								className="flex items-center gap-2"
							>
								<Shield className="w-4 h-4" />
								Admin Panel
							</NavLink>
						)}
						<NavLink to="/profile" className="flex items-center gap-2">
							<User className="w-4 h-4" />
							Profile
						</NavLink>
						<ThemeToggle />
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-romance-600 dark:hover:text-romance-300 font-medium transition-colors cursor-pointer"
							type="button"
						>
							<LogOut className="w-4 h-4" />
							Logout
						</button>
					</nav>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-romance-600 dark:hover:text-romance-300 transition-colors"
						type="button"
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? (
							<X className="w-6 h-6" />
						) : (
							<Menu className="w-6 h-6" />
						)}
					</button>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<nav className="md:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-800 pt-4">
						<div className="flex flex-col gap-3">
							<Link
								to="/browse"
								onClick={() => setMobileMenuOpen(false)}
								className={`px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-romance-50 dark:hover:bg-slate-700 hover:text-romance-600 dark:hover:text-romance-400 font-medium transition-colors ${
									isActive("/browse")
										? "bg-romance-50 dark:bg-slate-700 text-romance-600 dark:text-romance-400"
										: ""
								}`}
							>
								Browse
							</Link>
							<Link
								to="/library"
								onClick={() => setMobileMenuOpen(false)}
								className={`px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-romance-50 dark:hover:bg-slate-700 hover:text-romance-600 dark:hover:text-romance-400 font-medium transition-colors ${
									isActive("/library")
										? "bg-romance-50 dark:bg-slate-700 text-romance-600 dark:text-romance-400"
										: ""
								}`}
							>
								My Library
							</Link>
							{isEditorOrAdmin && (
								<Link
									to="/admin"
									onClick={() => setMobileMenuOpen(false)}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-romance-50 dark:hover:bg-slate-800 hover:text-romance-600 dark:hover:text-romance-300 font-medium transition-colors ${
										isActive("/admin") || currentPath.startsWith("/admin")
											? "bg-romance-50 dark:bg-slate-800 text-romance-600 dark:text-romance-300"
											: ""
									}`}
								>
									<Shield className="w-4 h-4" />
									Admin Panel
								</Link>
							)}
							<Link
								to="/profile"
								onClick={() => setMobileMenuOpen(false)}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-romance-50 dark:hover:bg-slate-700 hover:text-romance-600 dark:hover:text-romance-400 font-medium transition-colors ${
									isActive("/profile")
										? "bg-romance-50 dark:bg-slate-700 text-romance-600 dark:text-romance-400"
										: ""
								}`}
							>
								<User className="w-4 h-4" />
								Profile
							</Link>
							<div className="px-4 py-2">
								<ThemeToggle className="w-full justify-start" />
							</div>
							<button
								onClick={() => {
									setMobileMenuOpen(false);
									handleLogout();
								}}
								className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-romance-50 dark:hover:bg-slate-700 hover:text-romance-600 dark:hover:text-romance-400 font-medium transition-colors text-left"
								type="button"
							>
								<LogOut className="w-4 h-4" />
								Logout
							</button>
						</div>
					</nav>
				)}
			</div>
		</header>
	);
}
