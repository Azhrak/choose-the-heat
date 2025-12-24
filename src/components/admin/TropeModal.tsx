import { Edit2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { FormTextarea } from "~/components/FormTextarea";
import { Alert } from "~/components/ui/Alert";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";

interface Trope {
	id: string;
	key: string;
	label: string;
	description: string | null;
}

type TropeModalProps =
	| {
			mode: "add";
			isOpen: boolean;
			onClose: () => void;
			onSubmit: (data: {
				key: string;
				label: string;
				description?: string;
			}) => void;
			isLoading: boolean;
			error?: string;
			trope?: never;
	  }
	| {
			mode: "edit";
			isOpen: boolean;
			trope: Trope | null;
			onClose: () => void;
			onSubmit: (
				tropeId: string,
				data: { key: string; label: string; description?: string },
			) => void;
			isLoading: boolean;
			error?: string;
	  };

/**
 * TropeModal - Modal dialog for adding or editing tropes
 * Follows props object pattern (no destructuring)
 *
 * @param props.mode - "add" or "edit" mode
 * @param props.isOpen - Whether modal is visible
 * @param props.onClose - Callback to close modal
 * @param props.onSubmit - Callback when form is submitted
 * @param props.isLoading - Loading state
 * @param props.error - Error message
 * @param props.trope - Trope to edit (edit mode only)
 */
export function TropeModal(props: TropeModalProps) {
	const [key, setKey] = useState("");
	const [label, setLabel] = useState("");
	const [description, setDescription] = useState("");
	const [validationError, setValidationError] = useState("");

	// Populate form when trope changes (edit mode)
	useEffect(() => {
		if (props.mode === "edit" && props.trope) {
			setKey(props.trope.key);
			setLabel(props.trope.label);
			setDescription(props.trope.description || "");
			setValidationError("");
		}
	}, [props.mode, props.trope]);

	// Don't render if not open, or if edit mode without trope
	if (!props.isOpen || (props.mode === "edit" && !props.trope)) return null;

	const handleClose = () => {
		setKey("");
		setLabel("");
		setDescription("");
		setValidationError("");
		props.onClose();
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

		const data = {
			key: key.trim(),
			label: label.trim(),
			description: description.trim() || undefined,
		};

		if (props.mode === "edit" && props.trope) {
			(
				props.onSubmit as (
					tropeId: string,
					data: { key: string; label: string; description?: string },
				) => void
			)(props.trope.id, data);
		} else {
			(
				props.onSubmit as (data: {
					key: string;
					label: string;
					description?: string;
				}) => void
			)(data);
		}
	};

	const config = {
		add: {
			icon: Plus,
			title: "Add New Trope",
			description: "Add a new trope that can be assigned to story templates.",
			submitText: props.isLoading ? "Adding..." : "Add Trope",
		},
		edit: {
			icon: Edit2,
			title: "Edit Trope",
			description: "Update the trope information below.",
			submitText: props.isLoading ? "Updating..." : "Update Trope",
		},
	};

	const {
		icon: Icon,
		title,
		description: desc,
		submitText,
	} = config[props.mode];

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<Card padding="lg" className="max-w-md w-full">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="flex items-center gap-2 text-romance-600 dark:text-romance-400">
						<Icon className="w-6 h-6" />
						<h3 className="text-2xl font-bold">{title}</h3>
					</div>

					<Text>{desc}</Text>

					<FormInput
						label="Key *"
						type="text"
						value={key}
						onChange={(e) => setKey(e.target.value)}
						placeholder="enemies-to-lovers"
						helperText="Lowercase letters, numbers, and hyphens only"
						required
						disabled={props.isLoading}
					/>

					<FormInput
						label="Label *"
						type="text"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						placeholder="Enemies to Lovers"
						required
						disabled={props.isLoading}
					/>

					<FormTextarea
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Characters start as adversaries and develop romantic feelings"
						rows={3}
						disabled={props.isLoading}
					/>

					<Alert message={validationError || props.error} variant="error" />

					<Stack direction="horizontal" gap="sm">
						<Button
							type="button"
							onClick={handleClose}
							disabled={props.isLoading}
							variant="secondary"
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={props.isLoading || !key || !label}
							variant="primary"
							className="flex-1"
						>
							{submitText}
						</Button>
					</Stack>
				</form>
			</Card>
		</div>
	);
}
