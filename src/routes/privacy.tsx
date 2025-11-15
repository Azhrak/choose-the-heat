import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "~/components/Footer";
import { Heading } from "~/components/Heading";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicy,
});

function PrivacyPolicy() {
	return (
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-4xl mx-auto space-y-8">
					<div className="space-y-8">
						{/* Back Button */}
						<Link
							to="/"
							className="inline-flex items-center gap-2 text-romance-600 hover:text-romance-700 font-medium"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>

						{/* Header */}
						<div className="bg-white rounded-lg shadow-sm p-8 space-y-4">
							<Heading level="h1" size="page">
								Privacy Policy
							</Heading>
							<p className="text-slate-600">Last updated: November 15, 2025</p>
						</div>
					</div>

					{/* Content */}
					<div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
						<section className="space-y-4">
							<Heading level="h2" size="section">
								1. Information We Collect
							</Heading>
							<p className="text-slate-700 mb-4">
								We collect information that you provide directly to us when you
								create an account, use our services, or communicate with us.
								This includes:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>Account information (email address, username, password)</li>
								<li>
									Profile information (reading preferences, favorite tropes,
									spice level)
								</li>
								<li>
									Story data (generated stories, reading history, bookmarks)
								</li>
								<li>Usage information (how you interact with our service)</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								2. How We Use Your Information
							</Heading>
							<p className="text-slate-700">
								We use the information we collect to:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>Provide, maintain, and improve our services</li>
								<li>
									Generate personalized romance novels based on your preferences
								</li>
								<li>Communicate with you about updates and new features</li>
								<li>Protect against fraudulent or illegal activity</li>
								<li>Comply with legal obligations</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								3. AI-Generated Content
							</Heading>
							<p className="text-slate-700 mb-4">
								Choose the Heat uses artificial intelligence to generate
								personalized romance novels. The content generated is based on:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>Your selected preferences and story templates</li>
								<li>Your choices within interactive stories</li>
								<li>General romance novel conventions and tropes</li>
							</ul>
							<p className="text-slate-700 mt-4">
								We do not use your personal information or reading history to
								train AI models or share it with third-party AI providers beyond
								what is necessary to generate your requested content.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								4. Data Storage and Security
							</Heading>
							<p className="text-slate-700 mb-4">
								We take reasonable measures to protect your information from
								unauthorized access, use, or disclosure. Your data is stored
								securely and encrypted both in transit and at rest. However, no
								method of transmission over the internet is 100% secure.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								5. Data Sharing
							</Heading>
							<p className="text-slate-700">
								We do not sell your personal information. We may share your
								information only in the following circumstances:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>
									With AI service providers to generate your requested content
								</li>
								<li>When required by law or to protect our legal rights</li>
								<li>With your explicit consent</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								6. Your Rights and Choices
							</Heading>
							<p className="text-slate-700">You have the right to:</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>Access, update, or delete your account information</li>
								<li>Export your data in a portable format</li>
								<li>Opt out of promotional communications</li>
								<li>Request deletion of your generated stories</li>
								<li>Close your account at any time</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								7. Cookies and Tracking
							</Heading>
							<p className="text-slate-700">
								We use cookies and similar tracking technologies to maintain
								your session, remember your preferences, and analyze how you use
								our service. You can control cookies through your browser
								settings.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								8. Children's Privacy
							</Heading>
							<p className="text-slate-700">
								Our service is intended for users 18 years of age and older. We
								do not knowingly collect information from children under 18. If
								you believe we have collected information from a child, please
								contact us immediately.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								9. Changes to This Policy
							</Heading>
							<p className="text-slate-700">
								We may update this Privacy Policy from time to time. We will
								notify you of any material changes by posting the new policy on
								this page and updating the "Last updated" date.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								10. Contact Us
							</Heading>
							<p className="text-slate-700">
								If you have questions or concerns about this Privacy Policy or
								our data practices, please contact us at:
							</p>
							<p className="text-slate-700">
								<strong>Email:</strong> privacy@choosetheheat.com
							</p>
						</section>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
