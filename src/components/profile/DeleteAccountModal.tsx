import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { Heading } from "~/components/Heading";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";

interface DeleteAccountModalProps {
	isOpen: boolean;
	password: string;
	onPasswordChange: (value: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
	isDeleting: boolean;
	error?: string;
}

/**
 * DeleteAccountModal - Confirmation modal for account deletion
 * Follows props object pattern (no destructuring)
 *
 * @param props.isOpen - Whether modal is visible
 * @param props.password - Password input value
 * @param props.onPasswordChange - Callback when password changes
 * @param props.onConfirm - Callback when delete confirmed
 * @param props.onCancel - Callback when cancelled
 * @param props.isDeleting - Loading state
 * @param props.error - Error message (optional)
 */
export function DeleteAccountModal(props: DeleteAccountModalProps) {
	if (!props.isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
			<Card padding="lg" className="max-w-md w-full">
				<Stack gap="md">
					<div className="flex items-center gap-2 text-red-600 dark:text-red-400">
						<AlertTriangle className="w-6 h-6" />
						<Heading level="h3" size="section">
							Delete Account
						</Heading>
					</div>

					<Text>
						This action cannot be undone. All your data will be permanently
						deleted.
					</Text>

					<FormInput
						label="Enter your password to confirm"
						type="password"
						value={props.password}
						onChange={(e) => props.onPasswordChange(e.target.value)}
						placeholder="Your password"
					/>
					{props.error && (
						<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<Text size="sm" className="text-red-700 dark:text-red-300">
								{props.error}
							</Text>
						</div>
					)}

					<Stack direction="horizontal" gap="sm">
						<Button
							variant="outline"
							onClick={props.onCancel}
							disabled={props.isDeleting}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							variant="danger"
							onClick={props.onConfirm}
							disabled={props.isDeleting || !props.password}
							className="flex-1"
						>
							{props.isDeleting ? "Deleting..." : "Delete Account"}
						</Button>
					</Stack>
				</Stack>
			</Card>
		</div>
	);
}
