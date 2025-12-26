import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Heading } from "~/components/Heading";
import { Stack } from "~/components/ui/Stack";

export const Route = createFileRoute("/subscription/success")({
	component: SubscriptionSuccessPage,
});

function SubscriptionSuccessPage() {
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [sessionData, setSessionData] = useState<{
		tier?: string;
		amount?: number;
		currency?: string;
	} | null>(null);

	// Get session_id from URL
	const searchParams = new URLSearchParams(window.location.search);
	const sessionId = searchParams.get("session_id");

	useEffect(() => {
		if (!sessionId) {
			setStatus("error");
			return;
		}

		// Verify checkout session
		const verifySession = async () => {
			try {
				const response = await fetch(
					`/api/checkout/success?session_id=${sessionId}`,
				);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to verify session");
				}

				setSessionData({
					tier: data.metadata?.tier,
					amount: data.amountTotal,
					currency: data.currency,
				});
				setStatus("success");

				// Redirect to subscription page after 5 seconds
				setTimeout(() => {
					navigate({ to: "/subscription" });
				}, 5000);
			} catch (error) {
				console.error("Failed to verify session:", error);
				setStatus("error");
			}
		};

		verifySession();
	}, [sessionId, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
			<div className="max-w-md w-full">
				<Stack gap="md">
					{status === "loading" && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
							<Loader2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
							<Heading level="h2" className="mb-2">
								Processing your subscription...
							</Heading>
							<p className="text-gray-600 dark:text-gray-400">
								Please wait while we confirm your payment
							</p>
						</div>
					)}

					{status === "success" && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
							<div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
							</div>
							<Heading level="h2" className="mb-2">
								Payment Successful!
							</Heading>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								Your subscription has been activated.
							</p>

							{sessionData && (
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-sm">
									{sessionData.tier && (
										<p className="mb-2">
											<span className="font-semibold">Plan:</span>{" "}
											<span className="capitalize">{sessionData.tier}</span>
										</p>
									)}
									{sessionData.amount && sessionData.currency && (
										<p>
											<span className="font-semibold">Amount:</span> $
											{sessionData.amount.toFixed(2)}{" "}
											{sessionData.currency.toUpperCase()}
										</p>
									)}
								</div>
							)}

							<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
								You will be redirected to your subscription page in 5 seconds...
							</p>

							<button
								type="button"
								onClick={() => navigate({ to: "/subscription" })}
								className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
							>
								Go to Subscription Page
							</button>
						</div>
					)}

					{status === "error" && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
							<div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<span className="text-3xl">✕</span>
							</div>
							<Heading level="h2" className="mb-2">
								Verification Failed
							</Heading>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								We couldn't verify your payment session. Please check your
								subscription status or contact support if you were charged.
							</p>

							<button
								type="button"
								onClick={() => navigate({ to: "/subscription" })}
								className="w-full py-3 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors"
							>
								Go to Subscription Page
							</button>
						</div>
					)}
				</Stack>
			</div>
		</div>
	);
}
