import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Heart, Sparkles } from "lucide-react";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Container } from "~/components/ui/Container";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const currentYear = new Date().getFullYear();

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-1 bg-linear-to-br from-romance-50 via-white to-romance-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				{/* Theme Toggle */}
				<Container>
					<div className="flex justify-end pt-4">
						<ThemeToggle />
					</div>
				</Container>

				<Container>
					<Stack gap="xl" className="py-16">
						{/* Hero Section */}
						<Stack gap="md" className="text-center max-w-4xl mx-auto">
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
							<Text size="xl" variant="secondary">
								Experience AI-powered romance novels that adapt to your choices.
								Every decision shapes your perfect love story.
							</Text>
							<Stack direction="horizontal" gap="md" align="center">
								<Link to="/auth/signup">
									<Button variant="primary" size="lg">
										Get Started
									</Button>
								</Link>
								<Link to="/auth/login">
									<Button variant="outline" size="lg">
										Sign In
									</Button>
								</Link>
							</Stack>
						</Stack>

						{/* Features */}
						<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
							<Stack gap="sm" className="text-center p-6">
								<div className="flex justify-center">
									<BookOpen className="w-12 h-12 text-romance-500 dark:text-romance-400" />
								</div>
								<Heading level="h3" size="subsection">
									Interactive Stories
								</Heading>
								<Text>
									Make choices that shape the narrative and influence your
									characters' journey
								</Text>
							</Stack>

							<Stack gap="sm" className="text-center p-6">
								<div className="flex justify-center">
									<Sparkles className="w-12 h-12 text-romance-500 dark:text-romance-400" />
								</div>
								<Heading level="h3" size="subsection">
									AI-Powered
								</Heading>
								<Text>
									Every scene is uniquely generated based on your preferences
									and decisions
								</Text>
							</Stack>

							<Stack gap="sm" className="text-center p-6">
								<div className="flex justify-center">
									<Heart className="w-12 h-12 text-romance-500 dark:text-romance-400" />
								</div>
								<Heading level="h3" size="subsection">
									Your Preferences
								</Heading>
								<Text>
									Choose your favorite tropes, spice level, and pacing for a
									personalized experience
								</Text>
							</Stack>
						</div>
					</Stack>
				</Container>
			</div>

			{/* Simple Footer */}
			<footer className="bg-slate-900 dark:bg-gray-950 text-slate-300 dark:text-gray-400 py-8">
				<Container>
					<Stack gap="sm" className="max-w-4xl mx-auto text-center">
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
						<Text size="sm" variant="ondark">
							AI-powered romance novels tailored to your preferences. Discover
							your next favorite story.
						</Text>
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
							<Link
								to="/cookies"
								className="hover:text-romance-400 dark:hover:text-romance-300 transition-colors"
							>
								Cookie Policy
							</Link>
						</div>
						<Text size="sm" variant="ondark">
							© {currentYear} Choose the Heat. Made with{" "}
							<Heart
								className="w-4 h-4 inline text-romance-500"
								fill="currentColor"
							/>{" "}
							for romance readers.
						</Text>
					</Stack>
				</Container>
			</footer>
		</div>
	);
}
