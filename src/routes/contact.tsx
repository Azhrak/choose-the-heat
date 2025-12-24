import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Mail, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "~/components/Button";
import { Footer } from "~/components/Footer";
import { FormInput } from "~/components/FormInput";
import { FormTextarea } from "~/components/FormTextarea";
import { Header } from "~/components/Header";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { PageContainer } from "~/components/PageContainer";
import { Alert } from "~/components/ui/Alert";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";

export const Route = createFileRoute("/contact")({
	component: ContactPage,
});

function ContactPage() {
	const { data: currentUser } = useCurrentUserQuery();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
		// Honeypot field - hidden from users, bots will fill it
		website: "",
	});

	const [status, setStatus] = useState<
		"idle" | "submitting" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Bot protection: Check honeypot field
		if (formData.website) {
			// This is likely a bot submission, silently fail
			console.warn("Honeypot triggered - possible bot submission");
			setStatus("success");
			return;
		}

		// Validation
		if (!formData.name || !formData.email || !formData.message) {
			setStatus("error");
			setErrorMessage("Please fill in all required fields");
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setStatus("error");
			setErrorMessage("Please enter a valid email address");
			return;
		}

		setStatus("submitting");

		// TODO: Implement actual message sending
		// For now, just simulate a delay
		setTimeout(() => {
			setStatus("success");
			// Reset form
			setFormData({
				name: "",
				email: "",
				subject: "",
				message: "",
				website: "",
			});
		}, 1000);
	};

	return (
		<PageBackground>
			<Header currentPath="/contact" userRole={currentUser?.role} />
			<PageContainer maxWidth="md">
				<Stack gap="lg">
					{/* Header Section */}
					<div className="text-center">
						<Mail className="w-16 h-16 text-rose-500 mx-auto mb-4" />
						<Heading level="h1" size="page" className="mb-4">
							Get in Touch
						</Heading>
						<Text variant="secondary" size="lg" className="max-w-2xl mx-auto">
							Have a question, suggestion, or feedback? We'd love to hear from
							you!
						</Text>
					</div>

					{/* Contact Form */}
					<Card padding="lg">
						{status === "success" ? (
							<div className="text-center py-8">
								<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
								<Heading level="h2" size="section" className="mb-2">
									Message Sent!
								</Heading>
								<Text variant="secondary" className="mb-6">
									Thank you for reaching out. We'll get back to you as soon as
									possible.
								</Text>
								<button
									type="button"
									onClick={() => setStatus("idle")}
									className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
								>
									Send another message
								</button>
							</div>
						) : (
							<form onSubmit={handleSubmit}>
								<Stack gap="md">
									{/* Name */}
									<FormInput
										label="Name"
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Your name"
										required
									/>

									{/* Email */}
									<FormInput
										label="Email"
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										placeholder="your.email@example.com"
										required
									/>

									{/* Subject */}
									<FormInput
										label="Subject"
										type="text"
										value={formData.subject}
										onChange={(e) =>
											setFormData({ ...formData, subject: e.target.value })
										}
										placeholder="What's this about?"
									/>

									{/* Message */}
									<FormTextarea
										label="Message"
										value={formData.message}
										onChange={(e) =>
											setFormData({ ...formData, message: e.target.value })
										}
										rows={6}
										placeholder="Tell us what's on your mind..."
										required
									/>

									{/* Honeypot field - hidden from users */}
									<div className="hidden" aria-hidden="true">
										<label htmlFor="website">Website</label>
										<input
											type="text"
											id="website"
											name="website"
											value={formData.website}
											onChange={(e) =>
												setFormData({ ...formData, website: e.target.value })
											}
											tabIndex={-1}
											autoComplete="off"
										/>
									</div>

									{/* Error Message */}
									{status === "error" && (
										<Alert variant="error">{errorMessage}</Alert>
									)}

									{/* Submit Button */}
									<Button
										type="submit"
										variant="primary"
										size="lg"
										disabled={status === "submitting"}
										className="w-full"
									>
										{status === "submitting" ? (
											<>
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												Sending...
											</>
										) : (
											<>
												<Send className="w-5 h-5" />
												Send Message
											</>
										)}
									</Button>

									<Text variant="muted" size="xs" className="text-center">
										We typically respond within 24-48 hours
									</Text>
								</Stack>
							</form>
						)}
					</Card>

					{/* Additional Info */}
					<div className="text-center">
						<Text variant="secondary" size="sm">
							For urgent matters or account issues, please check our{" "}
							<a
								href="/terms"
								className="text-rose-600 dark:text-rose-400 hover:underline"
							>
								Terms of Service
							</a>{" "}
							and{" "}
							<a
								href="/privacy"
								className="text-rose-600 dark:text-rose-400 hover:underline"
							>
								Privacy Policy
							</a>
						</Text>
					</div>
				</Stack>
			</PageContainer>
			<Footer />
		</PageBackground>
	);
}
