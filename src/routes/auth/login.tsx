import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { AlreadyLoggedInNotice } from "~/components/AlreadyLoggedInNotice";
import { Button } from "~/components/Button";
import { DividerWithText } from "~/components/DividerWithText";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { GoogleAuthButton } from "~/components/GoogleAuthButton";
import { Heading } from "~/components/Heading";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { ApiError, api } from "~/lib/api/client";

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { data: currentUser } = useCurrentUserQuery();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [logoutLoading, setLogoutLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const data = await api.post<{ user?: { hasPreferences: boolean } }>(
				"/api/auth/login",
				{ email, password },
			);
			// Redirect based on whether user has completed onboarding
			const redirectTo = data.user?.hasPreferences
				? "/browse"
				: "/auth/onboarding";
			navigate({ to: redirectTo });
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message || "Login failed");
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = () => {
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
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100 flex items-center justify-center px-4">
			<div className="max-w-md w-full space-y-8">
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
						<Heading level="h1">Welcome Back</Heading>
						<p className="text-slate-600">Sign in to continue your story</p>
					</div>
				</div>

				<div className="space-y-4">
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

					{/* Google Sign In */}
					<GoogleAuthButton onClick={handleGoogleLogin} />

					<DividerWithText text="Or continue with email" />

					{/* Email/Password Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
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
						/>

						<Button type="submit" loading={loading} className="w-full">
							Sign In
						</Button>
					</form>
				</div>

				{/* Sign Up Link */}
				<p className="text-center text-sm text-slate-600">
					Don't have an account?{" "}
					<Link
						to="/auth/signup"
						className="text-romance-600 font-medium hover:text-romance-700"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
