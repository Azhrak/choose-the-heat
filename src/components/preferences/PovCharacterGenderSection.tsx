import { Eye } from "lucide-react";
import { Heading } from "~/components/Heading";
import { RadioButton } from "~/components/RadioButton";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import {
	POV_CHARACTER_GENDER_LABELS,
	POV_CHARACTER_GENDER_OPTIONS,
	type PovCharacterGender,
} from "~/lib/types/preferences";

interface PovCharacterGenderSectionProps {
	selectedGender: PovCharacterGender;
	onSelect: (gender: PovCharacterGender) => void;
}

/**
 * PovCharacterGenderSection - POV character gender selector
 * Follows props object pattern (no destructuring)
 *
 * @param props.selectedGender - Currently selected gender
 * @param props.onSelect - Callback when gender selected
 */
export function PovCharacterGenderSection(
	props: PovCharacterGenderSectionProps,
) {
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
					<Text>What gender identity should the main protagonist have?</Text>
				</Stack>
				<Stack gap="xs">
					{POV_CHARACTER_GENDER_OPTIONS.map((gender) => (
						<RadioButton
							key={gender}
							selected={props.selectedGender === gender}
							onClick={() => props.onSelect(gender)}
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
