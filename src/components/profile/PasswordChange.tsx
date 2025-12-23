import { Lock } from "lucide-react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { Alert } from "~/components/ui/Alert";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";

interface PasswordChangeProps {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
	onCurrentPasswordChange: (value: string) => void;
	onNewPasswordChange: (value: string) => void;
	onConfirmPasswordChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isUpdating: boolean;
	error?: string;
	success?: string;
}

/**
 * PasswordChange - Form for changing user password
 * Follows props object pattern (no destructuring)
 *
 * @param props.currentPassword - Current password value
 * @param props.newPassword - New password value
 * @param props.confirmPassword - Password confirmation value
 * @param props.onCurrentPasswordChange - Callback when current password changes
 * @param props.onNewPasswordChange - Callback when new password changes
 * @param props.onConfirmPasswordChange - Callback when confirmation changes
 * @param props.onSubmit - Form submit handler
 * @param props.isUpdating - Loading state
 * @param props.error - Error message (optional)
 * @param props.success - Success message (optional)
 */
export function PasswordChange(props: PasswordChangeProps) {
	return (
		<Card>
			<Stack gap="md">
				<div className="flex items-center gap-2">
					<Lock className="w-5 h-5 text-romance-500" />
					<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
						Change Password
					</h2>
				</div>

				<form onSubmit={props.onSubmit} className="space-y-4">
					<FormInput
						label="Current Password"
						type="password"
						value={props.currentPassword}
						onChange={(e) => props.onCurrentPasswordChange(e.target.value)}
						required
					/>
					<FormInput
						label="New Password"
						type="password"
						value={props.newPassword}
						onChange={(e) => props.onNewPasswordChange(e.target.value)}
						required
						helperText="At least 8 characters with uppercase, lowercase, and numbers"
					/>
					<FormInput
						label="Confirm New Password"
						type="password"
						value={props.confirmPassword}
						onChange={(e) => props.onConfirmPasswordChange(e.target.value)}
						required
					/>
					<Alert message={props.error} variant="error" />

					<Alert message={props.success} variant="success" />

					<Button type="submit" loading={props.isUpdating} variant="primary">
						Change Password
					</Button>
				</form>
			</Stack>
		</Card>
	);
}
