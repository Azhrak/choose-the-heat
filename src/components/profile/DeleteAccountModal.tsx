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

export function DeleteAccountModal({
	isOpen,
	password,
	onPasswordChange,
	onConfirm,
	onCancel,
	isDeleting,
	error,
}: DeleteAccountModalProps) {
	if (!isOpen) return null;

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
						value={password}
						onChange={(e) => onPasswordChange(e.target.value)}
						placeholder="Your password"
					/>
					{error && (
						<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<Text size="sm" className="text-red-700 dark:text-red-300">
								{error}
							</Text>
						</div>
					)}

					<Stack direction="horizontal" gap="sm">
						<Button
							variant="outline"
							onClick={onCancel}
							disabled={isDeleting}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							variant="danger"
							onClick={onConfirm}
							disabled={isDeleting || !password}
							className="flex-1"
						>
							{isDeleting ? "Deleting..." : "Delete Account"}
						</Button>
					</Stack>
				</Stack>
			</Card>
		</div>
	);
}
