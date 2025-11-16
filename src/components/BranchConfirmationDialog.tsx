import { AlertTriangle, ExternalLink, GitBranch } from "lucide-react";
import { Button } from "./Button";

interface BranchConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	onNavigateToExisting?: () => void;
	storyTitle: string;
	sceneNumber: number;
	originalChoice: string;
	newChoice: string;
	existingBranch?: {
		id: string;
		story_title: string | null;
	} | null;
	isCheckingExisting?: boolean;
	isLoading?: boolean;
}

export function BranchConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	onNavigateToExisting,
	storyTitle,
	sceneNumber,
	originalChoice,
	newChoice,
	existingBranch,
	isCheckingExisting = false,
	isLoading = false,
}: BranchConfirmationDialogProps) {
	if (!isOpen) return null;

	const hasExistingBranch = !!existingBranch;

	return (
		<>
			{/* Backdrop */}
			<button
				type="button"
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 cursor-default"
				onClick={onClose}
				aria-label="Close dialog"
			/>

			{/* Dialog */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-6 pointer-events-auto"
					role="dialog"
					aria-modal="true"
				>
					{/* Header */}
					<div className="flex items-start gap-4">
						<div className="shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
							<GitBranch className="w-6 h-6 text-purple-600" />
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-bold text-gray-800">
								{hasExistingBranch
									? "Branch already exists!"
									: "Branch into a new story?"}
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{hasExistingBranch
									? "You've already created a branch with this choice"
									: `Create an alternate timeline from Scene ${sceneNumber}`}
							</p>
						</div>
					</div>

					{/* Existing Branch Warning */}
					{hasExistingBranch && (
						<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
							<div className="flex items-start gap-2">
								<AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
								<div className="space-y-2 text-sm">
									<p className="font-medium text-amber-900">
										This branch already exists
									</p>
									<p className="text-amber-700">
										You've already created a story where you chose "{newChoice}"
										at Scene {sceneNumber}:
									</p>
									<p className="font-medium text-amber-900">
										"{existingBranch.story_title || "Untitled Branch"}"
									</p>
									<p className="text-amber-700">
										Would you like to continue that story instead?
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Story Info */}
					{!isCheckingExisting && !hasExistingBranch && (
						<>
							<div className="bg-gray-50 rounded-lg p-4 space-y-3">
								<div>
									<p className="text-sm font-medium text-gray-700">
										From story:
									</p>
									<p className="text-base text-gray-900">{storyTitle}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-700">
										Original choice:
									</p>
									<p className="text-sm text-gray-600 italic">
										"{originalChoice}"
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-700">
										New choice:
									</p>
									<p className="text-sm text-purple-600 font-medium italic">
										"{newChoice}"
									</p>
								</div>
							</div>

							{/* Explanation */}
							<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
								<div className="flex items-start gap-2">
									<AlertTriangle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
									<div className="space-y-2 text-sm text-gray-700">
										<p className="font-medium text-purple-900">What happens:</p>
										<ul className="space-y-1 list-disc list-inside">
											<li>A new story will be created in your library</li>
											<li>
												All progress up to Scene {sceneNumber} will be copied
											</li>
											<li>You'll continue from there with your new choice</li>
											<li>Your original story remains completely unchanged</li>
										</ul>
									</div>
								</div>
							</div>
						</>
					)}

					{/* Actions */}
					<div className="flex gap-3">
						{hasExistingBranch ? (
							<>
								<Button
									type="button"
									onClick={onClose}
									disabled={isLoading}
									variant="outline"
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={onNavigateToExisting}
									disabled={isLoading}
									variant="primary"
									className="flex-1 bg-linear-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700"
								>
									<ExternalLink className="w-5 h-5" />
									<span>Go to Branch</span>
								</Button>
							</>
						) : (
							<>
								<Button
									type="button"
									onClick={onClose}
									disabled={isLoading}
									variant="outline"
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={onConfirm}
									loading={isLoading}
									disabled={isLoading || isCheckingExisting}
									variant="primary"
									className="flex-1 bg-linear-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700"
								>
									<GitBranch className="w-5 h-5" />
									<span>Create Branch</span>
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
