import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "~/components/Footer";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { Card } from "~/components/ui/Card";
import { Container } from "~/components/ui/Container";
import { Stack } from "~/components/ui/Stack";
import {
	SESSION_COOKIE_NAME,
	SESSION_EXPIRY_DAYS,
} from "~/lib/auth/session-constants";

export const Route = createFileRoute("/cookies")({
	component: CookiePolicy,
});

function CookiePolicy() {
	return (
		<PageBackground>
			<Container size="md" className="py-12">
				<Stack gap="lg">
					<Stack gap="lg">
						{/* Back Button */}
						<Link
							to="/"
							className="inline-flex items-center gap-2 text-romance-600 dark:text-romance-400 hover:text-romance-700 dark:hover:text-romance-300 font-medium"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
						{/* Header */}
						<Card>
							<Stack gap="md">
								<Heading level="h1" size="page">
									Cookie Policy
								</Heading>
								<p className="text-slate-600 dark:text-slate-400">
									Last updated: November 17, 2025
								</p>
							</Stack>
						</Card>
					</Stack>

					{/* Content */}
					<Card>
						<Stack gap="lg">
							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										1. What Are Cookies?
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										Cookies are small text files that are placed on your device
										(computer, tablet, or mobile phone) when you visit a
										website. They help websites remember information about your
										visit, like your preferences and login status, making your
										experience more convenient and personalized.
									</p>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										2. Cookies We Use
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										Choose the Heat uses only strictly necessary cookies to
										provide our core service. We do not use tracking, analytics,
										or advertising cookies.
									</p>

									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
											<thead className="bg-slate-50 dark:bg-slate-700">
												<tr>
													<th className="px-4 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
														Cookie Name
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
														Purpose
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
														Duration
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
														Category
													</th>
												</tr>
											</thead>
											<tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
												<tr>
													<td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100">
														{SESSION_COOKIE_NAME}
													</td>
													<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
														Maintains your authentication session, keeps you
														logged in, and stores your account preferences
													</td>
													<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
														{SESSION_EXPIRY_DAYS} days
													</td>
													<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
														Strictly Necessary
													</td>
												</tr>
												<tr>
													<td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100">
														oauth_state
													</td>
													<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
														Protects against CSRF attacks during Google Sign-In
														process
													</td>
													<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
														10 minutes
													</td>
													<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
														Strictly Necessary (Security)
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										3. Strictly Necessary Cookies
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										These cookies are essential for the operation of our
										website. They enable core functionality such as:
									</p>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											<strong>Authentication:</strong> Keeping you logged in as
											you navigate between pages
										</li>
										<li>
											<strong>Security:</strong> Protecting your account from
											unauthorized access and CSRF attacks
										</li>
										<li>
											<strong>Session management:</strong> Remembering your
											preferences and settings during your visit
										</li>
									</ul>
									<p className="text-slate-700 dark:text-slate-300">
										Under GDPR regulations, strictly necessary cookies can be
										used without explicit consent because they are essential to
										provide the service you have requested. However, we still
										inform you about their use as part of our commitment to
										transparency.
									</p>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										4. Third-Party Cookies
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										We do not use third-party cookies for tracking or
										advertising. When you use Google Sign-In, the OAuth
										authentication process is handled server-side, and Google
										does not set cookies directly on our domain.
									</p>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										5. Analytics and Marketing Cookies
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										<strong>
											We do not use analytics or marketing cookies.
										</strong>{" "}
										We do not track your browsing behavior, build user profiles,
										or share your data with advertising networks. Your privacy
										is important to us.
									</p>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										6. Managing Cookies
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										Since our cookies are strictly necessary for the service to
										function, disabling them will prevent you from:
									</p>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>Logging into your account</li>
										<li>Creating or accessing personalized stories</li>
										<li>Saving your preferences and settings</li>
										<li>Using Google Sign-In</li>
									</ul>
									<p className="text-slate-700 dark:text-slate-300 font-semibold mt-4">
										Browser-Level Control
									</p>
									<p className="text-slate-700 dark:text-slate-300">
										You can configure your browser to block or delete cookies,
										but this will prevent the website from functioning properly.
										Here's how to manage cookies in popular browsers:
									</p>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											<strong>Chrome:</strong> Settings → Privacy and security →
											Cookies and other site data
										</li>
										<li>
											<strong>Firefox:</strong> Settings → Privacy & Security →
											Cookies and Site Data
										</li>
										<li>
											<strong>Safari:</strong> Preferences → Privacy → Manage
											Website Data
										</li>
										<li>
											<strong>Edge:</strong> Settings → Cookies and site
											permissions → Manage and delete cookies
										</li>
									</ul>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										7. Cookie Attributes
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										For your security and privacy, our cookies use the following
										attributes:
									</p>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											<strong>HttpOnly:</strong> Prevents JavaScript from
											accessing the cookie, protecting against XSS attacks
										</li>
										<li>
											<strong>Secure:</strong> Only transmitted over HTTPS
											connections
										</li>
										<li>
											<strong>SameSite=Lax:</strong> Protects against CSRF
											attacks while maintaining functionality
										</li>
									</ul>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										8. Your Rights Under GDPR
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										If you are in the European Economic Area (EEA), you have
										certain rights regarding your data:
									</p>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											<strong>Right to information:</strong> You have the right
											to know what cookies we use (listed above)
										</li>
										<li>
											<strong>Right to access:</strong> You can view your
											account data at any time
										</li>
										<li>
											<strong>Right to deletion:</strong> You can delete your
											account and all associated data in your account settings
										</li>
										<li>
											<strong>Right to data portability:</strong> You can export
											your data (stories, preferences) from your account
										</li>
									</ul>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										9. Updates to This Policy
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										We may update this Cookie Policy from time to time to
										reflect changes in our practices or for legal reasons. When
										we make material changes, we will:
									</p>
									<ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
										<li>
											Update the "Last updated" date at the top of this page
										</li>
										<li>
											Notify you through our cookie consent banner if we add new
											types of cookies
										</li>
										<li>
											Request renewed consent if we begin using optional cookies
										</li>
									</ul>
								</Stack>
							</section>

							<section>
								<Stack gap="md">
									<Heading level="h2" size="section">
										10. Contact Us
									</Heading>
									<p className="text-slate-700 dark:text-slate-300">
										If you have questions or concerns about our use of cookies,
										please contact us at:
									</p>
									<div className="bg-slate-50 dark:bg-slate-700 rounded-md p-4">
										<Stack gap="xs">
											<p className="text-slate-700 dark:text-slate-300">
												<strong>Email:</strong> privacy@choosetheheat.com
											</p>
											<p className="text-slate-700 dark:text-slate-300">
												<strong>Subject line:</strong> Cookie Policy Inquiry
											</p>
										</Stack>
									</div>
								</Stack>
							</section>

							<section>
								<div className="bg-romance-50 dark:bg-romance-900/20 border border-romance-200 dark:border-romance-800 rounded-md p-4">
									<p className="text-sm text-slate-700 dark:text-slate-300">
										<strong>Related Policies:</strong> For more information
										about how we handle your personal data, please see our{" "}
										<Link
											to="/privacy"
											className="text-romance-600 dark:text-romance-600 hover:text-romance-700 dark:hover:text-romance-300 underline font-medium"
										>
											Privacy Policy
										</Link>{" "}
										and{" "}
										<Link
											to="/terms"
											className="text-romance-600 dark:text-romance-600 hover:text-romance-700 dark:hover:text-romance-300 underline font-medium"
										>
											Terms of Service
										</Link>
										.
									</p>
								</div>
							</section>
						</Stack>
					</Card>
				</Stack>
			</Container>
			<Footer />
		</PageBackground>
	);
}
