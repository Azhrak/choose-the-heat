import { Heading } from "~/components/Heading";

interface SettingDisplayProps {
	label: string;
	value: string | number | undefined;
	suffix?: string;
}

function SettingDisplay(props: SettingDisplayProps) {
	return (
		<div className="flex justify-between">
			<span className="text-slate-600 dark:text-gray-400">{props.label}:</span>
			<span className="font-medium text-slate-900 dark:text-gray-100">
				{props.value || "Not set"}
				{props.suffix}
			</span>
		</div>
	);
}

interface CurrentSettingsDisplayProps {
	aiSettings: {
		provider?: string;
		model?: string;
		temperature?: string;
		maxOutputTokens?: string;
		timeout?: string;
	};
	ttsSettings: {
		provider?: string;
		model?: string;
	};
}

/**
 * Displays current AI and TTS settings in a grid layout
 */
export function CurrentSettingsDisplay(props: CurrentSettingsDisplayProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Current AI Settings */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
				<Heading level="h3" className="mb-4">
					Current AI Settings
				</Heading>
				<div className="space-y-3 text-sm">
					<SettingDisplay label="Provider" value={props.aiSettings.provider} />
					<SettingDisplay label="Model" value={props.aiSettings.model} />
					<SettingDisplay
						label="Temperature"
						value={props.aiSettings.temperature || "0.7"}
					/>
					<SettingDisplay
						label="Max Tokens"
						value={props.aiSettings.maxOutputTokens || "2000"}
					/>
					<SettingDisplay
						label="Timeout"
						value={props.aiSettings.timeout || "60"}
						suffix="s"
					/>
				</div>
			</div>

			{/* Current TTS Settings */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
				<Heading level="h3" className="mb-4">
					Current TTS Settings
				</Heading>
				<div className="space-y-3 text-sm">
					<SettingDisplay label="Provider" value={props.ttsSettings.provider} />
					<SettingDisplay label="Model" value={props.ttsSettings.model} />
				</div>
			</div>
		</div>
	);
}
