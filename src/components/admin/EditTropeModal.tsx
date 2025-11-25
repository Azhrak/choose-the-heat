import { Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { FormTextarea } from "~/components/FormTextarea";
import { Alert } from "~/components/ui/Alert";

interface Trope {
	id: string;
	key: string;
	label: string;
	description: string | null;
}

interface EditTropeModalProps {
	isOpen: boolean;
	trope: Trope | null;
	onClose: () => void;
	onSubmit: (
		tropeId: string,
		data: { key: string; label: string; description?: string },
	) => void;
	isLoading: boolean;
	error?: string;
}

export function EditTropeModal({
	isOpen,
	trope,
	onClose,
	onSubmit,
	isLoading,
	error,
}: EditTropeModalProps) {
	const [key, setKey] = useState("");
	const [label, setLabel] = useState("");
	const [description, setDescription] = useState("");
	const [validationError, setValidationError] = useState("");

	// Populate form when trope changes
	useEffect(() => {
		if (trope) {
			setKey(trope.key);
			setLabel(trope.label);
			setDescription(trope.description || "");
			setValidationError("");
		}
	}, [trope]);

	if (!isOpen || !trope) return null;

	const handleClose = () => {
		setKey("");
		setLabel("");
		setDescription("");
		setValidationError("");
		onClose();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setValidationError("");

		// Validation
		if (!key.trim()) {
			setValidationError("Key is required");
			return;
		}

		if (!label.trim()) {
			setValidationError("Label is required");
			return;
		}

		// Validate key format (lowercase, numbers, hyphens only)
		if (!/^[a-z0-9-]+$/.test(key)) {
			setValidationError(
				"Key must be lowercase letters, numbers, and hyphens only",
			);
			return;
		}

		onSubmit(trope.id, {
			key: key.trim(),
			label: label.trim(),
			description: description.trim() || undefined,
		});
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="flex items-center gap-2 text-romance-600 dark:text-romance-400">
						<Edit2 className="w-6 h-6" />
						<h3 className="text-2xl font-bold">Edit Trope</h3>
					</div>

					<p className="text-slate-600 dark:text-gray-300">
						Update the trope information below.
					</p>

					<FormInput
						label="Key *"
						type="text"
						value={key}
						onChange={(e) => setKey(e.target.value)}
						placeholder="enemies-to-lovers"
						helperText="Lowercase letters, numbers, and hyphens only"
						required
						disabled={isLoading}
					/>

					<FormInput
						label="Label *"
						type="text"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						placeholder="Enemies to Lovers"
						required
						disabled={isLoading}
					/>

					<FormTextarea
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Characters start as adversaries and develop romantic feelings"
						rows={3}
						disabled={isLoading}
					/>

					<Alert message={validationError || error} variant="error" />

					<div className="flex gap-3">
						<Button
							type="button"
							onClick={handleClose}
							disabled={isLoading}
							variant="secondary"
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading || !key || !label}
							variant="primary"
							className="flex-1"
						>
							{isLoading ? "Updating..." : "Update Trope"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
