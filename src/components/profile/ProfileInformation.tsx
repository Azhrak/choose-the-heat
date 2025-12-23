import { User } from "lucide-react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { Alert } from "~/components/ui/Alert";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";

interface ProfileInformationProps {
	name: string;
	email: string;
	createdAt?: string;
	onNameChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isUpdating: boolean;
	error?: string;
	success?: string;
}

/**
 * ProfileInformation - Form for editing user profile data
 * Follows props object pattern (no destructuring)
 *
 * @param props.name - User's name
 * @param props.email - User's email
 * @param props.createdAt - Account creation date (optional)
 * @param props.onNameChange - Callback when name changes
 * @param props.onEmailChange - Callback when email changes
 * @param props.onSubmit - Form submit handler
 * @param props.isUpdating - Loading state
 * @param props.error - Error message (optional)
 * @param props.success - Success message (optional)
 */
export function ProfileInformation(props: ProfileInformationProps) {
	return (
		<Card>
			<Stack gap="md">
				<div className="flex items-center gap-2">
					<User className="w-5 h-5 text-romance-500" />
					<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
						Profile Information
					</h2>
				</div>

				<form onSubmit={props.onSubmit} className="space-y-4">
					<FormInput
						label="Name"
						type="text"
						value={props.name}
						onChange={(e) => props.onNameChange(e.target.value)}
						required
					/>
					<FormInput
						label="Email"
						type="email"
						value={props.email}
						onChange={(e) => props.onEmailChange(e.target.value)}
						required
					/>
					{props.createdAt && (
						<div className="text-sm text-slate-600 dark:text-gray-400">
							Account created: {new Date(props.createdAt).toLocaleDateString()}
						</div>
					)}

					<Alert message={props.error} variant="error" />

					<Alert message={props.success} variant="success" />

					<Button type="submit" loading={props.isUpdating} variant="primary">
						Update Profile
					</Button>
				</form>
			</Stack>
		</Card>
	);
}
