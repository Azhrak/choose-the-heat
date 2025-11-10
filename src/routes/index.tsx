import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<div className="container mx-auto px-4 py-16">
				{/* Hero Section */}
				<div className="text-center max-w-4xl mx-auto mb-16">
					<div className="flex justify-center mb-6">
						<Heart className="w-20 h-20 text-romance-500" fill="currentColor" />
					</div>
					<h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
						Your Story, Your Way
					</h1>
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
						<h3 className="text-xl font-semibold mb-2">Interactive Stories</h3>
						<p className="text-slate-600">
							Make choices that shape the narrative and influence your
							characters' journey
						</p>
					</div>

					<div className="text-center p-6">
						<div className="flex justify-center mb-4">
							<Sparkles className="w-12 h-12 text-romance-500" />
						</div>
						<h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
						<p className="text-slate-600">
							Every scene is uniquely generated based on your preferences and
							decisions
						</p>
					</div>

					<div className="text-center p-6">
						<div className="flex justify-center mb-4">
							<Heart className="w-12 h-12 text-romance-500" />
						</div>
						<h3 className="text-xl font-semibold mb-2">Your Preferences</h3>
						<p className="text-slate-600">
							Choose your favorite tropes, spice level, and pacing for a
							personalized experience
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
