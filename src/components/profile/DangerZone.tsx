import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/Button";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";

interface DangerZoneProps {
	onDeleteClick: () => void;
}

export function DangerZone({ onDeleteClick }: DangerZoneProps) {
	return (
		<Card className="border-2 border-red-200">
			<Stack gap="md">
				<div className="flex items-center gap-2">
					<AlertTriangle className="w-5 h-5 text-red-500" />
					<h2 className="text-2xl font-bold text-red-900 dark:text-red-400">
						Danger Zone
					</h2>
				</div>

				<Text>
					Once you delete your account, there is no going back. All your stories
					and preferences will be permanently deleted.
				</Text>

				<Button
					type="button"
					onClick={onDeleteClick}
					variant="danger"
					className="px-6 py-3"
				>
					Delete Account
				</Button>
			</Stack>
		</Card>
	);
}
