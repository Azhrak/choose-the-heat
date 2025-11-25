import { AlertTriangle } from "lucide-react";
import { FormInput } from "~/components/FormInput";
import { Stack } from "~/components/ui/Stack";

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
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
				<Stack gap="md">
					<div className="flex items-center gap-2 text-red-600">
						<AlertTriangle className="w-6 h-6" />
						<h3 className="text-2xl font-bold">Delete Account</h3>
					</div>

					<p className="text-slate-600">
						This action cannot be undone. All your data will be permanently
						deleted.
					</p>

					<FormInput
						label="Enter your password to confirm"
						type="password"
						value={password}
						onChange={(e) => onPasswordChange(e.target.value)}
						placeholder="Your password"
					/>
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{error}
						</div>
					)}

					<div className="flex gap-3">
						<button
							type="button"
							onClick={onCancel}
							disabled={isDeleting}
							className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={isDeleting || !password}
							className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isDeleting ? "Deleting..." : "Delete Account"}
						</button>
					</div>
				</Stack>
			</div>
		</div>
	);
}
