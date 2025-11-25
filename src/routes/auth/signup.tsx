import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlreadyLoggedInNotice } from "~/components/AlreadyLoggedInNotice";
import { Button } from "~/components/Button";
import { DividerWithText } from "~/components/DividerWithText";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { GoogleAuthButton } from "~/components/GoogleAuthButton";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
import { Stack } from "~/components/ui/Stack";
import { useCookieConsent } from "~/hooks/useCookieConsent";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { ApiError, api } from "~/lib/api/client";

export const Route = createFileRoute("/auth/signup")({
	component: SignupPage,
});

function SignupPage() {
	const navigate = useNavigate();
	const { data: currentUser } = useCurrentUserQuery();
	const { hasConsent } = useCookieConsent();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [logoutLoading, setLogoutLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!hasConsent) {
			setError(
				"Please accept our cookie policy to create an account. Click the 'Accept' button in the cookie notice at the bottom of the page.",
			);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			await api.post("/api/auth/signup", { email, name, password });
			// Redirect to onboarding
			navigate({ to: "/auth/onboarding" });
		} catch (err) {
			if (err instanceof ApiError) {
				// Handle different error formats from API
				const errorWithDetails = err as ApiError & { details?: unknown[] };
				if (
					errorWithDetails.details &&
					Array.isArray(errorWithDetails.details)
				) {
					// If details is an array of Zod error objects
					const errorMessages = errorWithDetails.details.map(
						(detail: unknown) => {
							if (typeof detail === "string") {
								return detail;
							}
							// Zod error object format
							return (detail as { message?: string }).message || String(detail);
						},
					);
					setError(errorMessages.join(". "));
				} else {
					setError(err.message || "Signup failed");
				}
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignup = () => {
		if (!hasConsent) {
			setError(
				"Please accept our cookie policy to create an account. Click the 'Accept' button in the cookie notice at the bottom of the page.",
			);
			return;
		}
		window.location.href = "/api/auth/google";
	};

	const handleLogout = async () => {
		setLogoutLoading(true);
		try {
			await api.post("/api/auth/logout", {});
			window.location.href = "/";
		} catch (err) {
			console.error("Logout failed:", err);
			setLogoutLoading(false);
		}
	};

	return (
		<PageBackground className="flex items-center justify-center px-4 py-8">
			<div className="max-w-md w-full">
				<div className="space-y-8">
					{/* Logo */}
					<div className="text-center space-y-4">
						<div className="flex justify-center">
							<img
								src="/logo-512x512.png"
								alt="Choose the Heat Logo"
								className="w-12 h-12"
							/>
						</div>
						<div className="space-y-2">
							<Heading level="h1">Create Account</Heading>
							<p className="text-slate-600 dark:text-gray-300">
								Start your personalized romance journey
							</p>
						</div>
					</div>
					<Stack gap="sm">
						{/* Already Logged In Notice */}
						{currentUser && (
							<AlreadyLoggedInNotice
								userName={currentUser.name || currentUser.email}
								logoutLoading={logoutLoading}
								onLogout={handleLogout}
							/>
						)}
						{/* Error Message */}
						{error && <ErrorMessage message={error} />}
						{/* Google Sign Up */}
						<GoogleAuthButton onClick={handleGoogleSignup} />

						<DividerWithText text="Or sign up with email" />
						{/* Email/Password Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							<FormInput
								label="Name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>

							<FormInput
								label="Email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>

							<FormInput
								label="Password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								helperText="At least 8 characters with uppercase, lowercase, and numbers"
							/>

							<FormInput
								label="Confirm Password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>

							<Button type="submit" loading={loading} className="w-full">
								Create Account
							</Button>
						</form>
					</Stack>
					{/* Sign In Link */}
					<p className="text-center text-sm text-slate-600 dark:text-gray-300">
						Already have an account?{" "}
						<Link
							to="/auth/login"
							className="text-romance-600 dark:text-romance-400 font-medium hover:text-romance-700 dark:hover:text-romance-300"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</PageBackground>
	);
}
