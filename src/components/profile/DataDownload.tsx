import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { Alert } from "~/components/ui/Alert";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { useDownloadUserData } from "~/hooks/useDownloadUserData";

export function DataDownload() {
	const downloadData = useDownloadUserData();
	const [success, setSuccess] = useState("");

	const handleDownload = async () => {
		setSuccess("");
		try {
			await downloadData.mutateAsync();
			setSuccess("Your data has been downloaded successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			// Error handling is done through the mutation
			console.error("Download error:", error);
		}
	};

	return (
		<Card>
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<Download className="w-5 h-5 text-romance-500" />
					<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
						Download Your Data
					</h2>
				</div>

				<Stack gap="sm">
					<p className="text-slate-700 dark:text-gray-300">
						Download all your personal data in JSON format. This includes your
						profile information, story metadata, templates used, and choices
						made.
					</p>

					<div className="text-sm text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg">
						<div className="space-y-2">
							<p className="font-semibold">What's included:</p>
							<ul className="list-disc list-inside space-y-1">
								<li>Profile information (name, email, preferences)</li>
								<li>Story metadata (titles, progress, status)</li>
								<li>Templates you've used</li>
								<li>Choices you've made in your stories</li>
							</ul>
						</div>
						<p className="mt-3 font-semibold">What's NOT included:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>Story scene content (the actual generated text)</li>
							<li>Password or authentication data</li>
						</ul>
					</div>

					<Alert message={success} variant="success" />

					<Button
						onClick={handleDownload}
						loading={downloadData.isPending}
						variant="secondary"
						className="w-full sm:w-auto"
					>
						<Download className="w-4 h-4 mr-2" />
						Download My Data
					</Button>
				</Stack>
			</div>
		</Card>
	);
}
