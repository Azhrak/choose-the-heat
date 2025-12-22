import { createFileRoute } from "@tanstack/react-router";
import {
	BookOpen,
	GitBranch,
	Heart,
	Palette,
	Sparkles,
	Star,
	Users,
	Volume2,
} from "lucide-react";
import { FeatureSection } from "~/components/about/FeatureSection";
import { Button } from "~/components/Button";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	const { data: currentUser } = useCurrentUserQuery();

	return (
		<PageBackground>
			<Header currentPath="/about" userRole={currentUser?.role} />
			<PageContainer maxWidth="lg">
				<Stack gap="xl">
					{/* Header Section */}
					<div className="text-center">
						<Heading level="h1" size="page" className="mb-4">
							About Choose the Heat
						</Heading>
						<Text variant="secondary" size="lg" className="max-w-2xl mx-auto">
							Your personalized AI-powered interactive romance novel experience
						</Text>
					</div>

					{/* Features Grid */}
					<Stack gap="lg">
						{/* Interactive Story Generation */}
						<FeatureSection
							icon={<Sparkles className="w-8 h-8" />}
							title="AI-Powered Story Generation"
							description="Experience unique, personalized romance stories generated just for you. Our AI creates engaging narratives scene by scene, ensuring every story is tailored to your preferences and choices."
							features={[
								"Scene-by-scene story progression",
								"Dynamic narrative generation based on your choices",
								"Multiple story templates to choose from",
								"Save and continue reading anytime",
							]}
						/>

						{/* Choice Points & Branching */}
						<FeatureSection
							icon={<GitBranch className="w-8 h-8" />}
							title="Interactive Choices & Branching"
							description="Shape your own romance adventure with meaningful choices that impact the story's direction. Create multiple branches and explore different narrative paths."
							features={[
								"Make choices that affect the story outcome",
								"Branch stories to explore alternative paths",
								"Navigate through your story history",
								"Bookmark your favorite moments",
							]}
						/>

						{/* Personalization */}
						<FeatureSection
							icon={<Palette className="w-8 h-8" />}
							title="Complete Personalization"
							description="Customize every aspect of your reading experience to match your preferences perfectly."
							features={[
								"Spice Level (1-5): From sweet and clean to steamy",
								"Pacing: Slow-burn romance or fast-paced passion",
								"Scene Length: Short, medium, or long scenes",
								"POV Character: Choose female, male, or non-binary perspective",
								"Genres & Tropes: Select from a rich variety of romance themes",
							]}
						/>

						{/* Text-to-Speech */}
						<FeatureSection
							icon={<Volume2 className="w-8 h-8" />}
							title="Text-to-Speech Audio"
							description="Listen to your stories with high-quality AI voice narration. Perfect for hands-free reading or multitasking."
							features={[
								"Professional AI voice narration",
								"Full playback controls (play, pause, seek)",
								"Volume adjustment",
								"Audio available for generated scenes",
							]}
						/>

						{/* Story Library */}
						<FeatureSection
							icon={<BookOpen className="w-8 h-8" />}
							title="Personal Story Library"
							description="Keep track of all your stories in one place with powerful organization tools."
							features={[
								"Organize stories by progress (in-progress, completed)",
								"Favorite your best stories",
								"Filter and search capabilities",
								"Progress indicators and scene counts",
							]}
						/>

						{/* Template Browsing */}
						<FeatureSection
							icon={<Star className="w-8 h-8" />}
							title="Template Discovery"
							description="Browse through curated story templates with different themes, settings, and romance tropes."
							features={[
								"Search templates by title or description",
								"Filter by tropes and themes",
								"Preview template details before starting",
								"New templates added regularly",
							]}
						/>

						{/* User Account */}
						<FeatureSection
							icon={<Users className="w-8 h-8" />}
							title="Secure User Accounts"
							description="Your stories and preferences are safely stored and accessible across all your devices."
							features={[
								"Secure authentication (email/password or Google OAuth)",
								"Profile management",
								"Download your account data",
								"Privacy-focused with GDPR compliance",
							]}
						/>
					</Stack>

					{/* Call to Action */}
					<div className="bg-linear-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 rounded-2xl p-8 text-white text-center">
						<Heart className="w-12 h-12 mx-auto mb-4" />
						<Heading level="h2" size="section" className="mb-4 text-white">
							Ready to Start Your Romance Adventure?
						</Heading>
						<Text size="lg" className="mb-6 opacity-90 text-white">
							Create your personalized story and explore endless romantic
							possibilities
						</Text>
						<a href="/browse">
							<Button
								variant="secondary"
								size="lg"
								className="bg-white text-rose-600 hover:bg-gray-100"
							>
								Browse Stories
							</Button>
						</a>
					</div>
				</Stack>
			</PageContainer>
			<Footer />
		</PageBackground>
	);
}
