import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { NoPermissions } from "~/components/admin/NoPermissions";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormTextarea } from "~/components/FormTextarea";
import { Heading } from "~/components/Heading";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";

export const Route = createFileRoute("/admin/templates/bulk-import")({
	component: BulkImportPage,
});

const EXAMPLE_JSON = [
	{
		title: "Bound by Starlight",
		description:
			"A cynical astronomer discovers her research partner is a star-born immortal. As cosmic forces threaten Earth, their connection becomes humanity's only hope.",
		base_tropes: ["paranormal", "fated-mates", "enemies-to-lovers"],
		estimated_scenes: 16,
		cover_gradient: "from-blue-600 to-indigo-800",
		choice_points: [
			{
				scene_number: 3,
				prompt_text:
					"He reveals his true nature by manipulating starlight in front of you. What's your first instinct?",
				options: [
					{
						id: "option-1",
						text: "Demand scientific proof and evidence",
						tone: "skeptical",
						impact: "rational",
					},
					{
						id: "option-2",
						text: "Back away and call for help",
						tone: "fearful",
						impact: "defensive",
					},
					{
						id: "option-3",
						text: "Reach out to touch the light",
						tone: "curious",
						impact: "bold",
					},
				],
			},
			{
				scene_number: 6,
				prompt_text:
					"He says you're his destined mate—the reason he came to Earth. How do you react?",
				options: [
					{
						id: "option-1",
						text: "Reject the idea of predetermined fate",
						tone: "defiant",
						impact: "independent",
					},
					{
						id: "option-2",
						text: "Admit you've felt an inexplicable pull toward him",
						tone: "honest",
						impact: "vulnerable",
					},
					{
						id: "option-3",
						text: "Ask what being his mate would actually mean",
						tone: "practical",
						impact: "cautious",
					},
				],
			},
			{
				scene_number: 10,
				prompt_text:
					"To save Earth, you must merge consciousness with him temporarily. Do you trust him enough?",
				options: [
					{
						id: "option-1",
						text: "Agree without hesitation—humanity depends on it",
						tone: "brave",
						impact: "heroic",
					},
					{
						id: "option-2",
						text: "Set boundaries about what he can access in your mind",
						tone: "guarded",
						impact: "cautious",
					},
					{
						id: "option-3",
						text: "Ask him to prove he won't hurt you first",
						tone: "wary",
						impact: "defensive",
					},
				],
			},
			{
				scene_number: 13,
				prompt_text:
					"During the merge, he experiences your loneliness and pain. You feel his cosmic isolation. What do you share?",
				options: [
					{
						id: "option-1",
						text: "Open yourself completely to him",
						tone: "trusting",
						impact: "intimate",
					},
					{
						id: "option-2",
						text: "Show him only what's necessary for the mission",
						tone: "controlled",
						impact: "reserved",
					},
					{
						id: "option-3",
						text: "Let emotion guide the connection naturally",
						tone: "surrendering",
						impact: "vulnerable",
					},
				],
			},
		],
	},
];

function BulkImportPage() {
	const { data: currentUser, isLoading: userLoading } = useCurrentUserQuery();
	const [jsonInput, setJsonInput] = useState("");
	const [isImporting, setIsImporting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [showTemplate, setShowTemplate] = useState(false);

	if (userLoading) {
		return (
			<AdminLayout currentPath="/admin/templates" userRole="user">
				<div className="p-6">Loading...</div>
			</AdminLayout>
		);
	}

	if (currentUser?.role !== "editor" && currentUser?.role !== "admin") {
		return <NoPermissions />;
	}

	const { role } = currentUser;

	const copyTemplate = () => {
		navigator.clipboard.writeText(JSON.stringify(EXAMPLE_JSON, null, 2));
		alert("Template copied to clipboard!");
	};

	const handleImport = async () => {
		setError(null);
		setSuccess(null);

		if (!jsonInput.trim()) {
			setError("Please paste JSON data to import");
			return;
		}

		try {
			// Validate JSON
			const parsedData = JSON.parse(jsonInput);

			if (!Array.isArray(parsedData)) {
				setError("JSON must be an array of templates");
				return;
			}

			setIsImporting(true);

			const response = await fetch("/api/admin/templates/bulk-import", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ templates: parsedData }),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Import failed");
			}

			setSuccess(
				`Successfully imported ${result.imported} template(s) with ${result.totalChoicePoints} choice point(s)`,
			);
			setJsonInput("");
		} catch (err) {
			if (err instanceof SyntaxError) {
				setError("Invalid JSON format. Please check your input.");
			} else {
				setError(err instanceof Error ? err.message : "Import failed");
			}
		} finally {
			setIsImporting(false);
		}
	};

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<div className="p-6 max-w-6xl">
				<div className="flex flex-col gap-2 mb-6">
					<Heading level="h1">Bulk Import Templates</Heading>
					<p className="text-gray-600">
						Import multiple story templates with choice points using JSON format
					</p>
				</div>

				<div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<Heading level="h2">JSON Template</Heading>
						<div className="space-x-2">
							<Button
								variant="secondary"
								onClick={() => setShowTemplate(!showTemplate)}
							>
								{showTemplate ? "Hide Template" : "Show Template"}
							</Button>
							<Button variant="secondary" onClick={copyTemplate}>
								Copy Template
							</Button>
						</div>
					</div>

					{showTemplate && (
						<div className="bg-gray-50 rounded border border-gray-200 p-4 overflow-auto">
							<pre className="text-sm text-gray-800">
								{JSON.stringify(EXAMPLE_JSON, null, 2)}
							</pre>
						</div>
					)}

					<div className="mt-4 text-sm text-gray-600">
						<p className="font-medium mb-2">Template Structure:</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>
								<code className="bg-gray-100 px-1 rounded">title</code>:
								Template name (1-255 characters)
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">description</code>:
								Story description
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">base_tropes</code>:
								Array of trope strings
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">
									estimated_scenes
								</code>
								: Number between 1-100
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">cover_gradient</code>
								: Tailwind gradient class (e.g., "from-blue-600 to-indigo-800")
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">choice_points</code>:
								Array of choice points (optional)
							</li>
						</ul>

						<p className="font-medium mb-2 mt-4">Choice Point Structure:</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>
								<code className="bg-gray-100 px-1 rounded">scene_number</code>:
								Scene number (must be within estimated_scenes)
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">prompt_text</code>:
								The question/prompt for the reader
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">options</code>: Array
								of 2-4 options
							</li>
						</ul>

						<p className="font-medium mb-2 mt-4">Option Structure:</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>
								<code className="bg-gray-100 px-1 rounded">id</code>: Unique
								identifier for the option
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">text</code>: Option
								text
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">tone</code>:
								Emotional tone (e.g., "skeptical", "brave")
							</li>
							<li>
								<code className="bg-gray-100 px-1 rounded">impact</code>: Story
								impact (e.g., "rational", "bold")
							</li>
						</ul>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
					<Heading level="h2">Import Templates</Heading>

					<FormTextarea
						label="Paste JSON Data"
						value={jsonInput}
						onChange={(e) => setJsonInput(e.target.value)}
						rows={12}
						placeholder="Paste your filled template JSON here..."
						className="font-mono text-sm"
					/>

					{error && (
						<div className="mt-4">
							<ErrorMessage message={error} />
						</div>
					)}

					{success && (
						<div className="mt-4 bg-green-50 border border-green-200 rounded p-4 text-green-800">
							{success}
						</div>
					)}

					<div className="mt-6 flex gap-3">
						<Button
							onClick={handleImport}
							disabled={isImporting || !jsonInput.trim()}
							loading={isImporting}
						>
							{isImporting ? "Importing..." : "Import Templates"}
						</Button>

						{jsonInput && (
							<Button
								variant="secondary"
								onClick={() => {
									setJsonInput("");
									setError(null);
									setSuccess(null);
								}}
							>
								Clear
							</Button>
						)}
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
