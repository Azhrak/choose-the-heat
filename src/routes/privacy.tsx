import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "~/components/Footer";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { Card } from "~/components/ui/Card";
import { Container } from "~/components/ui/Container";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import {
	SESSION_COOKIE_NAME,
	SESSION_EXPIRY_DAYS,
} from "~/lib/auth/session-constants";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicy,
});

function PrivacyPolicy() {
	return (
		<PageBackground>
			<Container size="md" className="py-12">
				<Stack gap="lg">
					<Stack gap="lg">
						{/* Back Button */}
						<Link
							to="/"
							className="inline-flex items-center gap-2 text-romance-600 hover:text-romance-700 font-medium"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>

						{/* Header */}
						<Card>
							<Stack gap="md">
								<Heading level="h1" size="page">
									Privacy Policy
								</Heading>
								<Text variant="muted">Last updated: November 15, 2025</Text>
							</Stack>
						</Card>
					</Stack>

					{/* Content */}
					<Card>
						<Stack gap="lg">
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										1. Information We Collect
									</Heading>
									<Stack gap="md">
										<Text>
											We collect information that you provide directly to us
											when you create an account, use our services, or
											communicate with us. This includes:
										</Text>
										<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
											<li>
												Account information (email address, username, password)
											</li>
											<li>
												Profile information (reading preferences, favorite
												tropes, spice level)
											</li>
											<li>
												Story data (generated stories, reading history,
												bookmarks)
											</li>
											<li>
												Usage information (how you interact with our service)
											</li>
										</ul>
									</Stack>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										2. How We Use Your Information
									</Heading>
									<Text>We use the information we collect to:</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>Provide, maintain, and improve our services</li>
										<li>
											Generate personalized romance novels based on your
											preferences
										</li>
										<li>Communicate with you about updates and new features</li>
										<li>Protect against fraudulent or illegal activity</li>
										<li>Comply with legal obligations</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										3. AI-Generated Content
									</Heading>
									<Stack gap="md">
										<Text>
											Choose the Heat uses artificial intelligence to generate
											personalized romance novels. The content generated is
											based on:
										</Text>
										<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
											<li>Your selected preferences and story templates</li>
											<li>Your choices within interactive stories</li>
											<li>General romance novel conventions and tropes</li>
										</ul>
										<Text>
											We do not use your personal information or reading history
											to train AI models or share it with third-party AI
											providers beyond what is necessary to generate your
											requested content.
										</Text>
									</Stack>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										4. Data Storage and Security
									</Heading>
									<Text>
										We take reasonable measures to protect your information from
										unauthorized access, use, or disclosure. Your data is stored
										securely and encrypted both in transit and at rest. However,
										no method of transmission over the internet is 100% secure.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										5. Data Sharing
									</Heading>
									<Text>
										We do not sell your personal information. We may share your
										information only in the following circumstances:
									</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											With AI service providers to generate your requested
											content
										</li>
										<li>When required by law or to protect our legal rights</li>
										<li>With your explicit consent</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										6. Your Rights and Choices
									</Heading>
									<Text>You have the right to:</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>Access, update, or delete your account information</li>
										<li>Export your data in a portable format</li>
										<li>Opt out of promotional communications</li>
										<li>Request deletion of your generated stories</li>
										<li>Close your account at any time</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										7. Cookies and Tracking
									</Heading>
									<Text>
										We use cookies and similar tracking technologies to maintain
										your session and provide you with a secure experience. We
										only use strictly necessary cookies that are essential for
										the service to function.
									</Text>{" "}
									<div className="bg-slate-50 dark:bg-slate-700 rounded-md p-4">
										<Stack gap="sm">
											<Text weight="semibold">Cookies We Use:</Text>
											<Stack gap="xs" className="text-sm">
												<div>
													<span className="font-mono text-slate-900 dark:text-slate-100">
														{SESSION_COOKIE_NAME}
													</span>{" "}
													- Authentication session ({SESSION_EXPIRY_DAYS} days)
												</div>
												<div>
													<span className="font-mono text-slate-900 dark:text-slate-100">
														oauth_state
													</span>{" "}
													- OAuth security token (10 minutes)
												</div>
											</Stack>
										</Stack>
									</div>
									<Text>
										<strong>
											We do not use tracking or analytics cookies.
										</strong>{" "}
										We do not track your browsing behavior across other
										websites, build user profiles for advertising, or share your
										data with advertising networks.
									</Text>
									<Text>
										For detailed information about our cookie practices,
										including how to manage cookies in your browser, please see
										our{" "}
										<Link
											to="/cookies"
											className="text-romance-600 hover:text-romance-700 underline font-medium"
										>
											Cookie Policy
										</Link>
										.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										8. Children's Privacy
									</Heading>
									<Text>
										Our service is intended for users 18 years of age and older.
										We do not knowingly collect information from children under
										18. If you believe we have collected information from a
										child, please contact us immediately.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										9. Changes to This Policy
									</Heading>
									<Text>
										We may update this Privacy Policy from time to time. We will
										notify you of any material changes by posting the new policy
										on this page and updating the "Last updated" date.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										10. Contact Us
									</Heading>
									<Text>
										If you have questions or concerns about this Privacy Policy
										or our data practices, please contact us at:
									</Text>
									<Text>
										<strong>Email:</strong> privacy@choosetheheat.com
									</Text>
								</Stack>
							</section>
						</Stack>
					</Card>
				</Stack>
			</Container>
			<Footer />
		</PageBackground>
	);
}
