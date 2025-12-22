import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Stack } from "~/components/ui/Stack";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-slate-900 dark:bg-black text-slate-300 dark:text-slate-400 mt-auto border-t border-slate-800 dark:border-slate-900">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Brand Section */}
					<Stack gap="sm">
						<div className="flex items-center gap-2">
							<img
								src="/logo-200x200.png"
								alt="Choose the Heat Logo"
								className="w-8 h-8"
							/>
							<span className="text-xl font-bold text-white">
								Choose the Heat
							</span>
						</div>
						<p className="text-sm">
							AI-powered romance novels tailored to your preferences. Discover
							your next favorite story.
						</p>
					</Stack>

					{/* Quick Links */}
					<Stack gap="sm">
						<h3 className="text-white font-semibold">Quick Links</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									to="/browse"
									className="hover:text-romance-400 transition-colors"
								>
									Browse Stories
								</Link>
							</li>
							<li>
								<Link
									to="/library"
									className="hover:text-romance-400 transition-colors"
								>
									My Library
								</Link>
							</li>
							<li>
								<Link
									to="/profile"
									className="hover:text-romance-400 transition-colors"
								>
									Profile
								</Link>
							</li>
							<li>
								<Link
									to="/preferences"
									className="hover:text-romance-400 transition-colors"
								>
									Preferences
								</Link>
							</li>
							<li>
								<Link
									to="/subscription"
									className="hover:text-romance-400 transition-colors"
								>
									Subscription
								</Link>
							</li>
							<li>
								<Link
									to="/about"
									className="hover:text-romance-400 transition-colors"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="hover:text-romance-400 transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</Stack>

					{/* About */}
					<Stack gap="sm">
						<h3 className="text-white font-semibold">About</h3>
						<p className="text-sm">
							Choose the Heat uses advanced AI to generate personalized romance
							novels. Each story is unique and crafted to match your reading
							preferences.
						</p>
					</Stack>
				</div>
				{/* Bottom Bar */}
				<div className="border-t border-slate-800 mt-8 pt-6 text-sm text-center md:text-left">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p>
							© {currentYear} Choose the Heat. Made with{" "}
							<Heart
								className="w-4 h-4 inline text-romance-500"
								fill="currentColor"
							/>{" "}
							for romance readers.
						</p>
						<div className="flex gap-4">
							<Link
								to="/privacy"
								className="hover:text-romance-400 transition-colors"
							>
								Privacy Policy
							</Link>
							<Link
								to="/terms"
								className="hover:text-romance-400 transition-colors"
							>
								Terms of Service
							</Link>
							<Link
								to="/cookies"
								className="hover:text-romance-400 transition-colors"
							>
								Cookie Policy
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
