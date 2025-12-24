import { AlertTriangle, Check, Circle, Play, Settings, X } from "lucide-react";
import type { ProviderStatusInfo } from "~/lib/ai/providerStatus";
import { cn } from "~/lib/utils";

interface ProviderCardProps {
	status: ProviderStatusInfo;
	onActivate: (providerId: string) => Promise<void>;
	onConfigure: (providerId: string) => void;
}

export function ProviderCard({
	status,
	onActivate,
	onConfigure,
}: ProviderCardProps) {
	const getStatusIcon = () => {
		switch (status.status) {
			case "ready":
				return <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
			case "invalid":
				return <X className="w-5 h-5 text-red-600 dark:text-red-400" />;
			case "incomplete":
				return (
					<AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
				);
			case "unconfigured":
				return <Circle className="w-5 h-5 text-slate-400 dark:text-gray-500" />;
		}
	};

	const getStatusColor = () => {
		switch (status.status) {
			case "ready":
				return "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10";
			case "invalid":
				return "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10";
			case "incomplete":
				return "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10";
			case "unconfigured":
				return "border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800";
		}
	};

	const _getStatusText = () => {
		switch (status.status) {
			case "ready":
				return "Ready to use";
			case "invalid":
				return "Invalid API key";
			case "incomplete":
				return "Needs configuration";
			case "unconfigured":
				return "Not configured";
		}
	};

	return (
		<div
			className={cn(
				"border rounded-lg p-6 transition-all",
				getStatusColor(),
				status.isActive && "ring-2 ring-romance-500 dark:ring-romance-400",
			)}
		>
			<div className="flex items-start justify-between">
				{/* Left: Provider Info */}
				<div className="flex-1">
					<div className="flex items-center gap-3">
						{getStatusIcon()}
						<div>
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
									{status.metadata.name}
								</h3>
								{status.isActive && (
									<span className="px-2 py-1 text-xs font-medium bg-romance-100 dark:bg-romance-800/50 text-romance-700 dark:text-romance-100 rounded">
										Active
									</span>
								)}
							</div>
							<p className="text-sm text-slate-600 dark:text-gray-400">
								{status.metadata.description}
							</p>
						</div>
					</div>

					{/* Status Details */}
					<div className="mt-4 grid grid-cols-3 gap-4">
						<div>
							<div className="text-xs text-slate-500 dark:text-gray-500">
								API Key
							</div>
							<div className="text-sm font-medium">
								{status.hasApiKey ? (
									<span
										className={cn(
											status.apiKeyStatus === "valid" &&
												"text-green-600 dark:text-green-400",
											status.apiKeyStatus === "invalid" &&
												"text-red-600 dark:text-red-400",
											status.apiKeyStatus === "untested" &&
												"text-yellow-600 dark:text-yellow-400",
										)}
									>
										{status.apiKeyStatus || "Untested"}
									</span>
								) : (
									<span className="text-slate-400 dark:text-gray-500">
										Not set
									</span>
								)}
							</div>
						</div>

						<div>
							<div className="text-xs text-slate-500 dark:text-gray-500">
								Models
							</div>
							<div className="text-sm font-medium text-slate-900 dark:text-gray-100">
								{status.availableModels.length} configured
							</div>
						</div>

						<div>
							<div className="text-xs text-slate-500 dark:text-gray-500">
								Default Model
							</div>
							<div className="text-sm font-medium font-mono text-slate-900 dark:text-gray-100">
								{status.defaultModel || "Not set"}
							</div>
						</div>
					</div>

					{/* Error Message */}
					{status.apiKeyError && (
						<div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
							<p className="text-sm text-red-700 dark:text-red-300">
								{status.apiKeyError}
							</p>
						</div>
					)}
				</div>

				{/* Right: Actions */}
				<div className="flex gap-2 ml-4">
					<button
						type="button"
						onClick={() => onConfigure(status.provider)}
						className="p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
						title="Configure"
					>
						<Settings className="w-5 h-5" />
					</button>

					{status.status === "ready" && !status.isActive && (
						<button
							type="button"
							onClick={() => onActivate(status.provider)}
							className="px-4 py-2 bg-romance-600 text-white rounded-lg hover:bg-romance-700 dark:bg-romance-700 dark:hover:bg-romance-600 flex items-center gap-2 transition-colors"
						>
							<Play className="w-4 h-4" />
							Activate
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
