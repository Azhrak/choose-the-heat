import { Eye } from "lucide-react";
import { Heading } from "~/components/Heading";
import { RadioButton } from "~/components/RadioButton";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import {
	POV_CHARACTER_GENDER_LABELS,
	POV_CHARACTER_GENDER_OPTIONS,
	type PovCharacterGender,
} from "~/lib/types/preferences";

interface PovCharacterGenderSectionProps {
	selectedGender: PovCharacterGender;
	onSelect: (gender: PovCharacterGender) => void;
}

export function PovCharacterGenderSection({
	selectedGender,
	onSelect,
}: PovCharacterGenderSectionProps) {
	return (
		<Card padding="md">
			<Stack gap="md">
				<Stack gap="sm">
					<div className="flex items-center">
						<Eye className="w-6 h-6 text-romance-500 mr-2" />
						<Heading level="h3" size="section">
							POV Character Gender
						</Heading>
					</div>
					<p className="text-slate-600 dark:text-gray-300">
						What gender identity should the main protagonist have?
					</p>
				</Stack>
				<Stack gap="xs">
					{POV_CHARACTER_GENDER_OPTIONS.map((gender) => (
						<RadioButton
							key={gender}
							selected={selectedGender === gender}
							onClick={() => onSelect(gender)}
						>
							<div className="font-semibold text-slate-900 dark:text-gray-100">
								{POV_CHARACTER_GENDER_LABELS[gender].label}
							</div>
							<p className="text-sm text-slate-600 dark:text-gray-300">
								{POV_CHARACTER_GENDER_LABELS[gender].description}
							</p>
						</RadioButton>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
