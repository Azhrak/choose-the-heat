import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { AlreadyLoggedInNotice } from "~/components/AlreadyLoggedInNotice";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
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
						<Heart className="w-12 h-12 text-romance-600" fill="currentColor" />
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
					<button
						type="button"
						onClick={handleGoogleLogin}
						className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
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

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-slate-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-slate-500">
								Or continue with email
							</span>
						</div>
					</div>

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
