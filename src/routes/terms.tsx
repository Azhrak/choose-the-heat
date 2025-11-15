import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "~/components/Footer";
import { Heading } from "~/components/Heading";

export const Route = createFileRoute("/terms")({
	component: TermsOfService,
});

function TermsOfService() {
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
								Terms of Service
							</Heading>
							<p className="text-slate-600">Last updated: November 15, 2025</p>
						</div>
					</div>

					{/* Content */}
					<div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
						<section className="space-y-4">
							<Heading level="h2" size="section">
								1. Acceptance of Terms
							</Heading>
							<p className="text-slate-700">
								By accessing or using Choose the Heat, you agree to be bound by
								these Terms of Service and all applicable laws and regulations.
								If you do not agree with any of these terms, you are prohibited
								from using or accessing this service.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								2. Age Requirement
							</Heading>
							<p className="text-slate-700">
								You must be at least 18 years old to use Choose the Heat. By
								using this service, you represent and warrant that you are at
								least 18 years of age. The content generated may contain mature
								themes, including romantic and sexual content, which is intended
								for adult audiences only.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								3. User Accounts
							</Heading>
							<p className="text-slate-700">
								To access certain features of Choose the Heat, you must create
								an account. You agree to:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>Provide accurate and complete information</li>
								<li>Maintain the security of your password</li>
								<li>
									Accept responsibility for all activities under your account
								</li>
								<li>Notify us immediately of any unauthorized use</li>
								<li>Not share your account with others</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								4. AI-Generated Content
							</Heading>
							<p className="text-slate-700">
								Choose the Heat uses artificial intelligence to generate romance
								novels. You acknowledge and agree that:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>
									AI-generated content may vary in quality and consistency
								</li>
								<li>
									Content is generated based on your preferences and may contain
									mature themes
								</li>
								<li>
									We do not guarantee that generated content will meet your
									expectations
								</li>
								<li>
									You are responsible for reviewing content before reading or
									sharing
								</li>
								<li>
									Generated stories are for personal entertainment use only
								</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								5. Intellectual Property Rights
							</Heading>
							<p className="text-slate-700">
								The stories generated for you through Choose the Heat are
								provided for your personal use. You agree that:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>
									Stories are licensed to you for personal, non-commercial use
								</li>
								<li>
									You may not republish, sell, or distribute generated content
									commercially
								</li>
								<li>
									Choose the Heat retains all rights to the service, templates,
									and underlying technology
								</li>
								<li>
									Our logo, branding, and interface elements are protected by
									copyright and trademark laws
								</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								6. Acceptable Use Policy
							</Heading>
							<p className="text-slate-700">
								You agree not to use Choose the Heat to:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>
									Generate content that is illegal, harmful, or violates others'
									rights
								</li>
								<li>
									Attempt to reverse engineer, hack, or exploit the service
								</li>
								<li>
									Use automated systems to access the service without permission
								</li>
								<li>Circumvent any usage limits or restrictions</li>
								<li>
									Impersonate others or misrepresent your affiliation with any
									person or entity
								</li>
								<li>
									Interfere with or disrupt the service or servers connected to
									it
								</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								7. Content Guidelines
							</Heading>
							<p className="text-slate-700">
								While Choose the Heat allows mature romantic content, we
								prohibit content that:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>Depicts or promotes illegal activities</li>
								<li>Involves minors in any sexual or romantic context</li>
								<li>Promotes violence, hate speech, or discrimination</li>
								<li>Violates any applicable laws or regulations</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								8. Service Availability
							</Heading>
							<p className="text-slate-700">
								We strive to provide reliable service but do not guarantee
								uninterrupted access. We reserve the right to:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>Modify or discontinue the service at any time</li>
								<li>Implement usage limits or restrictions</li>
								<li>Perform maintenance that may temporarily affect access</li>
								<li>
									Remove or modify features without prior notice (though we'll
									try to notify you)
								</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								9. Payments and Subscriptions
							</Heading>
							<p className="text-slate-700">
								If you purchase a subscription or paid features:
							</p>
							<ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
								<li>All fees are charged in advance and are non-refundable</li>
								<li>
									Subscriptions automatically renew unless canceled before the
									renewal date
								</li>
								<li>Prices may change with 30 days' notice</li>
								<li>You are responsible for all applicable taxes</li>
							</ul>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								10. Disclaimers and Limitation of Liability
							</Heading>
							<p className="text-slate-700">
								Choose the Heat is provided "as is" without warranties of any
								kind. We disclaim all warranties, express or implied, including
								warranties of merchantability and fitness for a particular
								purpose.
							</p>
							<p className="text-slate-700">
								To the fullest extent permitted by law, Choose the Heat shall
								not be liable for any indirect, incidental, special,
								consequential, or punitive damages, or any loss of profits or
								revenues.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								11. Indemnification
							</Heading>
							<p className="text-slate-700">
								You agree to indemnify and hold harmless Choose the Heat, its
								officers, directors, employees, and agents from any claims,
								damages, losses, liabilities, and expenses arising from your use
								of the service or violation of these terms.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								12. Termination
							</Heading>
							<p className="text-slate-700">
								We may terminate or suspend your account immediately, without
								prior notice, for conduct that we believe violates these Terms
								of Service or is harmful to other users, us, or third parties,
								or for any other reason.
							</p>
							<p className="text-slate-700">
								You may terminate your account at any time through your account
								settings or by contacting us.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								13. Governing Law
							</Heading>
							<p className="text-slate-700">
								These Terms shall be governed by and construed in accordance
								with applicable laws, without regard to conflict of law
								principles. Any disputes shall be resolved through binding
								arbitration.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								14. Changes to Terms
							</Heading>
							<p className="text-slate-700">
								We reserve the right to modify these Terms at any time. We will
								provide notice of material changes by posting the updated terms
								and updating the "Last updated" date. Your continued use after
								such changes constitutes acceptance of the new terms.
							</p>
						</section>

						<section className="space-y-4">
							<Heading level="h2" size="section">
								15. Contact Information
							</Heading>
							<p className="text-slate-700">
								If you have questions about these Terms of Service, please
								contact us at:
							</p>
							<p className="text-slate-700">
								<strong>Email:</strong> legal@choosetheheat.com
							</p>
						</section>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
