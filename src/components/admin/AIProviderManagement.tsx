import { AlertTriangle, CheckCircle, Circle, Cpu, XCircle } from "lucide-react";
import { useState } from "react";
import {
	useActivateProviderMutation,
	useProviderStatusQuery,
} from "~/hooks/useProviderStatusQuery";
import type { ProviderStatusInfo } from "~/lib/ai/providerStatus";
import { ProviderCard } from "./ProviderCard";
import { ProviderConfigModal } from "./ProviderConfigModal";
import { useToast } from "./ToastContext";

type CategoryTab = "text" | "tts";

export function AIProviderManagement() {
	const { showToast } = useToast();
	const [activeCategory, setActiveCategory] = useState<CategoryTab>("text");
	const [configModalState, setConfigModalState] = useState<{
		isOpen: boolean;
		providerId: string | null;
		category: CategoryTab;
		providerStatus: ProviderStatusInfo | undefined;
	}>({
		isOpen: false,
		providerId: null,
		category: "text",
		providerStatus: undefined,
	});

	const {
		data: statusData,
		isLoading,
		error,
	} = useProviderStatusQuery(activeCategory);
	const activateProviderMutation = useActivateProviderMutation();

	const statuses = statusData?.statuses || [];

	// Calculate summary stats
	const stats = {
		ready: statuses.filter((s) => s.status === "ready").length,
		incomplete: statuses.filter((s) => s.status === "incomplete").length,
		invalid: statuses.filter((s) => s.status === "invalid").length,
		unconfigured: statuses.filter((s) => s.status === "unconfigured").length,
	};

	const handleActivate = async (providerId: string) => {
		try {
			await activateProviderMutation.mutateAsync({
				provider: providerId,
				category: activeCategory,
			});

			const providerName =
				statuses.find((s) => s.provider === providerId)?.metadata.name ||
				providerId;

			showToast({
				message: `${providerName} activated successfully`,
				type: "success",
			});
		} catch (error) {
			showToast({
				message:
					error instanceof Error
						? error.message
						: "Failed to activate provider",
				type: "error",
			});
		}
	};

	const handleConfigure = (providerId: string) => {
		const providerStatus = statuses.find((s) => s.provider === providerId);
		setConfigModalState({
			isOpen: true,
			providerId,
			category: activeCategory,
			providerStatus,
		});
	};

	const handleCloseModal = () => {
		setConfigModalState({
			isOpen: false,
			providerId: null,
			category: activeCategory,
			providerStatus: undefined,
		});
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<div className="flex items-center gap-3 mb-2">
					<Cpu className="w-8 h-8 text-romance-600 dark:text-romance-400" />
					<h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100">
						AI Provider Management
					</h1>
				</div>
				<p className="text-slate-600 dark:text-gray-400">
					Configure and manage AI providers for text generation and
					text-to-speech
				</p>
			</div>

			{/* Category Tabs */}
			<div className="border-b border-slate-200 dark:border-gray-700">
				<nav className="flex gap-4" aria-label="Provider categories">
					<button
						type="button"
						onClick={() => setActiveCategory("text")}
						className={`px-4 py-2 border-b-2 font-medium transition-colors ${
							activeCategory === "text"
								? "border-romance-600 dark:border-romance-400 text-romance-600 dark:text-romance-400"
								: "border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:border-slate-300 dark:hover:border-gray-600"
						}`}
					>
						Text Generation
					</button>
					<button
						type="button"
						onClick={() => setActiveCategory("tts")}
						className={`px-4 py-2 border-b-2 font-medium transition-colors ${
							activeCategory === "tts"
								? "border-romance-600 dark:border-romance-400 text-romance-600 dark:text-romance-400"
								: "border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:border-slate-300 dark:hover:border-gray-600"
						}`}
					>
						Text-to-Speech
					</button>
				</nav>
			</div>

			{/* Summary Stats */}
			{!isLoading && statuses.length > 0 && (
				<div className="grid grid-cols-4 gap-4">
					<div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
						<div className="flex items-center gap-2 mb-1">
							<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
							<span className="text-sm font-medium text-green-700 dark:text-green-300">
								Ready
							</span>
						</div>
						<div className="text-2xl font-bold text-green-900 dark:text-green-100">
							{stats.ready}
						</div>
					</div>

					<div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
						<div className="flex items-center gap-2 mb-1">
							<AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
							<span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
								Incomplete
							</span>
						</div>
						<div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
							{stats.incomplete}
						</div>
					</div>

					<div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
						<div className="flex items-center gap-2 mb-1">
							<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
							<span className="text-sm font-medium text-red-700 dark:text-red-300">
								Invalid
							</span>
						</div>
						<div className="text-2xl font-bold text-red-900 dark:text-red-100">
							{stats.invalid}
						</div>
					</div>

					<div className="p-4 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg">
						<div className="flex items-center gap-2 mb-1">
							<Circle className="w-5 h-5 text-slate-400 dark:text-gray-500" />
							<span className="text-sm font-medium text-slate-600 dark:text-gray-400">
								Unconfigured
							</span>
						</div>
						<div className="text-2xl font-bold text-slate-900 dark:text-gray-100">
							{stats.unconfigured}
						</div>
					</div>
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="flex justify-center py-12">
					<div className="text-slate-600 dark:text-gray-400">
						Loading providers...
					</div>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p className="text-red-700 dark:text-red-300">
						Failed to load provider statuses. Please try refreshing the page.
					</p>
				</div>
			)}

			{/* Provider List */}
			{!isLoading && !error && statuses.length > 0 && (
				<div className="space-y-4">
					{statuses.map((status) => (
						<ProviderCard
							key={status.provider}
							status={status}
							onActivate={handleActivate}
							onConfigure={handleConfigure}
						/>
					))}
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !error && statuses.length === 0 && (
				<div className="text-center py-12">
					<Cpu className="w-12 h-12 mx-auto text-slate-400 dark:text-gray-500 mb-3" />
					<p className="text-slate-600 dark:text-gray-400">
						No providers found for this category
					</p>
				</div>
			)}

			{/* Configuration Modal */}
			{configModalState.isOpen && configModalState.providerId && (
				<ProviderConfigModal
					providerId={configModalState.providerId}
					category={configModalState.category}
					providerStatus={configModalState.providerStatus}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
}
