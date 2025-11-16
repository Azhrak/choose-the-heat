import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Heart, Sparkles } from "lucide-react";
import { Heading } from "~/components/Heading";
import { ThemeToggle } from "~/components/ThemeToggle";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const currentYear = new Date().getFullYear();

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-1 bg-linear-to-br from-romance-50 via-white to-romance-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				{/* Theme Toggle */}
				<div className="container mx-auto px-4 pt-4">
					<div className="flex justify-end">
						<ThemeToggle />
					</div>
				</div>

				<div className="container mx-auto px-4 py-16">
					<div className="space-y-16">
						{/* Hero Section */}
						<div className="text-center max-w-4xl mx-auto space-y-6">
							<div className="flex justify-center">
								<img
									src="/logo-512x512.png"
									alt="Choose the Heat Logo"
									className="w-30 h-30"
								/>
							</div>
							<Heading level="h1" size="hero">
								Your Story, Your Way
							</Heading>
							<p className="text-xl text-slate-600 dark:text-gray-300">
								Experience AI-powered romance novels that adapt to your choices.
								Every decision shapes your perfect love story.
							</p>
							<div className="flex gap-4 justify-center">
								<Link
									to="/auth/signup"
									className="px-8 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 dark:bg-romance-500 dark:hover:bg-romance-600 transition-colors"
								>
									Get Started
								</Link>
								<Link
									to="/auth/login"
									className="px-8 py-3 border-2 border-romance-600 text-romance-600 rounded-lg font-semibold hover:bg-romance-50 dark:border-romance-400 dark:text-romance-400 dark:hover:bg-gray-800 transition-colors"
								>
									Sign In
								</Link>
							</div>
						</div>

						{/* Features */}
						<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
							<div className="text-center p-6 space-y-4">
								<div className="flex justify-center">
									<BookOpen className="w-12 h-12 text-romance-500 dark:text-romance-400" />
								</div>
								<Heading level="h3" size="subsection">
									Interactive Stories
								</Heading>
								<p className="text-slate-600 dark:text-gray-300">
									Make choices that shape the narrative and influence your
									characters' journey
								</p>
							</div>

							<div className="text-center p-6 space-y-4">
								<div className="flex justify-center">
									<Sparkles className="w-12 h-12 text-romance-500 dark:text-romance-400" />
								</div>
								<Heading level="h3" size="subsection">
									AI-Powered
								</Heading>
								<p className="text-slate-600 dark:text-gray-300">
									Every scene is uniquely generated based on your preferences
									and decisions
								</p>
							</div>

							<div className="text-center p-6 space-y-4">
								<div className="flex justify-center">
									<Heart className="w-12 h-12 text-romance-500 dark:text-romance-400" />
								</div>
								<Heading level="h3" size="subsection">
									Your Preferences
								</Heading>
								<p className="text-slate-600 dark:text-gray-300">
									Choose your favorite tropes, spice level, and pacing for a
									personalized experience
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Simple Footer */}
			<footer className="bg-slate-900 dark:bg-gray-950 text-slate-300 dark:text-gray-400 py-8">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center space-y-4">
						<div className="flex items-center justify-center gap-2">
							<img
								src="/logo-200x200.png"
								alt="Choose the Heat Logo"
								className="w-8 h-8"
							/>
							<span className="text-xl font-bold text-white dark:text-gray-100">
								Choose the Heat
							</span>
						</div>
						<p className="text-sm">
							AI-powered romance novels tailored to your preferences. Discover
							your next favorite story.
						</p>
						<div className="flex gap-4 justify-center text-sm">
							<Link
								to="/privacy"
								className="hover:text-romance-400 dark:hover:text-romance-300 transition-colors"
							>
								Privacy Policy
							</Link>
							<Link
								to="/terms"
								className="hover:text-romance-400 dark:hover:text-romance-300 transition-colors"
							>
								Terms of Service
							</Link>
						</div>
						<p className="text-sm">
							© {currentYear} Choose the Heat. Made with{" "}
							<Heart
								className="w-4 h-4 inline text-romance-500"
								fill="currentColor"
							/>{" "}
							for romance readers.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
