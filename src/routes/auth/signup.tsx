import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Home, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { Heading } from "~/components/Heading";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { ApiError, api } from "~/lib/api/client";

export const Route = createFileRoute("/auth/signup")({
	component: SignupPage,
});

function SignupPage() {
	const navigate = useNavigate();
	const { data: currentUser } = useCurrentUserQuery();
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
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100 flex items-center justify-center px-4 py-8">
			<div className="max-w-md w-full">
				{/* Logo */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<Heart className="w-12 h-12 text-romance-600" fill="currentColor" />
					</div>
					<Heading level="h1" className="mb-2">
						Create Account
					</Heading>
					<p className="text-slate-600 mt-2">
						Start your personalized romance journey
					</p>
				</div>

				{/* Already Logged In Notice */}
				{currentUser && (
					<div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-900 mb-3">
							You are already logged in as{" "}
							<strong>{currentUser.name || currentUser.email}</strong>
						</p>
						<div className="flex gap-2">
							<Link
								to="/browse"
								className="flex-1 px-3 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
							>
								<Home className="w-4 h-4" />
								Go Home
							</Link>
							<button
								type="button"
								onClick={handleLogout}
								disabled={logoutLoading}
								className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
							>
								<LogOut className="w-4 h-4" />
								{logoutLoading ? "Logging out..." : "Logout"}
							</button>
						</div>
					</div>
				)}

				{/* Error Message */}
				{error && <ErrorMessage message={error} className="mb-4" />}

				{/* Google Sign Up */}
				<button
					type="button"
					onClick={handleGoogleSignup}
					className="w-full mb-4 px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<title>Google logo</title>
						<path
							fill="currentColor"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="currentColor"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="currentColor"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="currentColor"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					Continue with Google
				</button>

				<div className="relative mb-4">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-slate-300"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-white text-slate-500">
							Or sign up with email
						</span>
					</div>
				</div>

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

				{/* Sign In Link */}
				<p className="mt-6 text-center text-sm text-slate-600">
					Already have an account?{" "}
					<Link
						to="/auth/login"
						className="text-romance-600 font-medium hover:text-romance-700"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
