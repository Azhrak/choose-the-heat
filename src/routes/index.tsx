import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Heart, Sparkles } from "lucide-react";
import { Heading } from "~/components/Heading";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const currentYear = new Date().getFullYear();

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-1 bg-linear-to-br from-romance-50 via-white to-romance-100">
				<div className="container mx-auto px-4 py-16">
					{/* Hero Section */}
					<div className="text-center max-w-4xl mx-auto mb-16">
						<div className="flex justify-center mb-6">
							<img
								src="/logo-512x512.png"
								alt="Choose the Heat Logo"
								className="w-30 h-30"
							/>
						</div>
						<Heading level="h1" size="hero" className="mb-6">
							Your Story, Your Way
						</Heading>
						<p className="text-xl text-slate-600 mb-8">
							Experience AI-powered romance novels that adapt to your choices.
							Every decision shapes your perfect love story.
						</p>
						<div className="flex gap-4 justify-center">
							<Link
								to="/auth/signup"
								className="px-8 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
							>
								Get Started
							</Link>
							<Link
								to="/auth/login"
								className="px-8 py-3 border-2 border-romance-600 text-romance-600 rounded-lg font-semibold hover:bg-romance-50 transition-colors"
							>
								Sign In
							</Link>
						</div>
					</div>

					{/* Features */}
					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<div className="text-center p-6">
							<div className="flex justify-center mb-4">
								<BookOpen className="w-12 h-12 text-romance-500" />
							</div>
							<Heading level="h3" size="subsection" className="mb-2">
								Interactive Stories
							</Heading>
							<p className="text-slate-600">
								Make choices that shape the narrative and influence your
								characters' journey
							</p>
						</div>

						<div className="text-center p-6">
							<div className="flex justify-center mb-4">
								<Sparkles className="w-12 h-12 text-romance-500" />
							</div>
							<Heading level="h3" size="subsection" className="mb-2">
								AI-Powered
							</Heading>
							<p className="text-slate-600">
								Every scene is uniquely generated based on your preferences and
								decisions
							</p>
						</div>

						<div className="text-center p-6">
							<div className="flex justify-center mb-4">
								<Heart className="w-12 h-12 text-romance-500" />
							</div>
							<Heading level="h3" size="subsection" className="mb-2">
								Your Preferences
							</Heading>
							<p className="text-slate-600">
								Choose your favorite tropes, spice level, and pacing for a
								personalized experience
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Simple Footer */}
			<footer className="bg-slate-900 text-slate-300 py-8">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center space-y-4">
						<div className="flex items-center justify-center gap-2">
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
						<div className="flex gap-4 justify-center text-sm">
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
