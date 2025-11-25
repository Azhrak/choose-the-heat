import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "~/components/Footer";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { Card } from "~/components/ui/Card";
import { Container } from "~/components/ui/Container";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";

export const Route = createFileRoute("/terms")({
	component: TermsOfService,
});

function TermsOfService() {
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
									Terms of Service
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
										1. Acceptance of Terms
									</Heading>
									<Text>
										By accessing or using Choose the Heat, you agree to be bound
										by these Terms of Service and all applicable laws and
										regulations. If you do not agree with any of these terms,
										you are prohibited from using or accessing this service.
									</Text>
								</Stack>
							</section>{" "}
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										2. Age Requirement
									</Heading>
									<Text>
										You must be at least 18 years old to use Choose the Heat. By
										using this service, you represent and warrant that you are
										at least 18 years of age. The content generated may contain
										mature themes, including romantic and sexual content, which
										is intended for adult audiences only.
									</Text>
								</Stack>
							</section>{" "}
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										3. User Accounts
									</Heading>
									<Text>
										To access certain features of Choose the Heat, you must
										create an account. You agree to:
									</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>Provide accurate and complete information</li>
										<li>Maintain the security of your password</li>
										<li>
											Accept responsibility for all activities under your
											account
										</li>
										<li>Notify us immediately of any unauthorized use</li>
										<li>Not share your account with others</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										4. AI-Generated Content
									</Heading>
									<Text>
										Choose the Heat uses artificial intelligence to generate
										romance novels. You acknowledge and agree that:
									</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											AI-generated content may vary in quality and consistency
										</li>
										<li>
											Content is generated based on your preferences and may
											contain mature themes
										</li>
										<li>
											We do not guarantee that generated content will meet your
											expectations
										</li>
										<li>
											You are responsible for reviewing content before reading
											or sharing
										</li>
										<li>
											Generated stories are for personal entertainment use only
										</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										5. Intellectual Property Rights
									</Heading>
									<Text>
										The stories generated for you through Choose the Heat are
										provided for your personal use. You agree that:
									</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											Stories are licensed to you for personal, non-commercial
											use
										</li>
										<li>
											You may not republish, sell, or distribute generated
											content commercially
										</li>
										<li>
											Choose the Heat retains all rights to the service,
											templates, and underlying technology
										</li>
										<li>
											Our logo, branding, and interface elements are protected
											by copyright and trademark laws
										</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										6. Acceptable Use Policy
									</Heading>
									<Text>You agree not to use Choose the Heat to:</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											Generate content that is illegal, harmful, or violates
											others' rights
										</li>
										<li>
											Attempt to reverse engineer, hack, or exploit the service
										</li>
										<li>
											Use automated systems to access the service without
											permission
										</li>
										<li>Circumvent any usage limits or restrictions</li>
										<li>
											Impersonate others or misrepresent your affiliation with
											any person or entity
										</li>
										<li>
											Interfere with or disrupt the service or servers connected
											to it
										</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										7. Content Guidelines
									</Heading>
									<Text>
										While Choose the Heat allows mature romantic content, we
										prohibit content that:
									</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>Depicts or promotes illegal activities</li>
										<li>Involves minors in any sexual or romantic context</li>
										<li>Promotes violence, hate speech, or discrimination</li>
										<li>Violates any applicable laws or regulations</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										8. Service Availability
									</Heading>
									<Text>
										We strive to provide reliable service but do not guarantee
										uninterrupted access. We reserve the right to:
									</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>Modify or discontinue the service at any time</li>
										<li>Implement usage limits or restrictions</li>
										<li>
											Perform maintenance that may temporarily affect access
										</li>
										<li>
											Remove or modify features without prior notice (though
											we'll try to notify you)
										</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										9. Payments and Subscriptions
									</Heading>
									<Text>If you purchase a subscription or paid features:</Text>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											All fees are charged in advance and are non-refundable
										</li>
										<li>
											Subscriptions automatically renew unless canceled before
											the renewal date
										</li>
										<li>Prices may change with 30 days' notice</li>
										<li>You are responsible for all applicable taxes</li>
									</ul>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										10. Disclaimers and Limitation of Liability
									</Heading>
									<Text>
										Choose the Heat is provided "as is" without warranties of
										any kind. We disclaim all warranties, express or implied,
										including warranties of merchantability and fitness for a
										particular purpose.
									</Text>
									<Text>
										To the fullest extent permitted by law, Choose the Heat
										shall not be liable for any indirect, incidental, special,
										consequential, or punitive damages, or any loss of profits
										or revenues.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										11. Indemnification
									</Heading>
									<Text>
										You agree to indemnify and hold harmless Choose the Heat,
										its officers, directors, employees, and agents from any
										claims, damages, losses, liabilities, and expenses arising
										from your use of the service or violation of these terms.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										12. Termination
									</Heading>
									<Text>
										We may terminate or suspend your account immediately,
										without prior notice, for conduct that we believe violates
										these Terms of Service or is harmful to other users, us, or
										third parties, or for any other reason.
									</Text>
									<Text>
										You may terminate your account at any time through your
										account settings or by contacting us.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										13. Governing Law
									</Heading>
									<Text>
										These Terms shall be governed by and construed in accordance
										with applicable laws, without regard to conflict of law
										principles. Any disputes shall be resolved through binding
										arbitration.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										14. Changes to Terms
									</Heading>
									<Text>
										We reserve the right to modify these Terms at any time. We
										will provide notice of material changes by posting the
										updated terms and updating the "Last updated" date. Your
										continued use after such changes constitutes acceptance of
										the new terms.
									</Text>
								</Stack>
							</section>
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										15. Contact Information
									</Heading>
									<Text>
										If you have questions about these Terms of Service, please
										contact us at:
									</Text>
									<Text>
										<strong>Email:</strong> legal@choosetheheat.com
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
