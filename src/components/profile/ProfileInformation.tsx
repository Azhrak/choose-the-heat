import { User } from "lucide-react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { Alert } from "~/components/ui/Alert";
import { Card } from "~/components/ui/Card";

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

export function ProfileInformation({
	name,
	email,
	createdAt,
	onNameChange,
	onEmailChange,
	onSubmit,
	isUpdating,
	error,
	success,
}: ProfileInformationProps) {
	return (
		<Card>
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<User className="w-5 h-5 text-romance-500" />
					<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
						Profile Information
					</h2>
				</div>

				<form onSubmit={onSubmit} className="space-y-4">
					<FormInput
						label="Name"
						type="text"
						value={name}
						onChange={(e) => onNameChange(e.target.value)}
						required
					/>
					<FormInput
						label="Email"
						type="email"
						value={email}
						onChange={(e) => onEmailChange(e.target.value)}
						required
					/>
					{createdAt && (
						<div className="text-sm text-slate-600 dark:text-gray-400">
							Account created: {new Date(createdAt).toLocaleDateString()}
						</div>
					)}

					<Alert message={error} variant="error" />

					<Alert message={success} variant="success" />

					<Button type="submit" loading={isUpdating} variant="primary">
						Update Profile
					</Button>
				</form>
			</div>
		</Card>
	);
}
