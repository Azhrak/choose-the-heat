import { AlertTriangle, ExternalLink, GitBranch } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { Stack } from "~/components/ui/Stack";
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

export function BranchConfirmationDialog(props: BranchConfirmationDialogProps) {
	const isCheckingExisting = props.isCheckingExisting ?? false;
	const isLoading = props.isLoading ?? false;

	if (!props.isOpen) return null;

	const hasExistingBranch = !!props.existingBranch;

	return (
		<>
			{/* Backdrop */}
			<button
				type="button"
				className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 cursor-default"
				onClick={props.onClose}
				aria-label="Close dialog"
			/>

			{/* Dialog */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div role="dialog" aria-modal="true" className="pointer-events-auto">
					<Card padding="lg" className="max-w-lg w-full space-y-6">
						{/* Header */}
						<div className="flex items-start gap-4">
							<div className="shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
								<GitBranch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
									{hasExistingBranch
										? "Branch already exists!"
										: "Branch into a new story?"}
								</h2>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									{hasExistingBranch
										? "You've already created a branch with this choice"
										: `Create an alternate timeline from Scene ${props.sceneNumber}`}
								</p>
							</div>
						</div>

						{/* Existing Branch Warning */}
						{hasExistingBranch && (
							<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 space-y-2">
								<div className="flex items-start gap-2">
									<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
									<div className="space-y-2 text-sm">
										<p className="font-medium text-amber-900 dark:text-amber-200">
											This branch already exists
										</p>
										<p className="text-amber-700 dark:text-amber-300">
											You've already created a story where you chose "
											{props.newChoice}" at Scene {props.sceneNumber}:
										</p>
										<p className="font-medium text-amber-900 dark:text-amber-200">
											"{props.existingBranch?.story_title || "Untitled Branch"}"
										</p>
										<p className="text-amber-700 dark:text-amber-300">
											Would you like to continue that story instead?
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Story Info */}
						{!isCheckingExisting && !hasExistingBranch && (
							<>
								<div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
									<div>
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
											From story:
										</p>
										<p className="text-base text-gray-900 dark:text-gray-100">
											{props.storyTitle}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Original choice:
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400 italic">
											"{props.originalChoice}"
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
											New choice:
										</p>
										<p className="text-sm text-purple-600 dark:text-purple-400 font-medium italic">
											"{props.newChoice}"
										</p>
									</div>
								</div>

								{/* Explanation */}
								<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 space-y-2">
									<div className="flex items-start gap-2">
										<AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
										<div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
											<p className="font-medium text-purple-900 dark:text-purple-200">
												What happens:
											</p>
											<ul className="space-y-1 list-disc list-inside">
												<li>A new story will be created in your library</li>
												<li>
													All progress up to Scene {props.sceneNumber} will be
													copied
												</li>
												<li>You'll continue from there with your new choice</li>
												<li>
													Your original story remains completely unchanged
												</li>
											</ul>
										</div>
									</div>
								</div>
							</>
						)}

						{/* Actions */}
						<Stack direction="horizontal" gap="sm">
							{hasExistingBranch ? (
								<>
									<Button
										type="button"
										onClick={props.onClose}
										disabled={isLoading}
										variant="outline"
										className="flex-1"
									>
										Cancel
									</Button>
									<Button
										type="button"
										onClick={props.onNavigateToExisting}
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
										onClick={props.onClose}
										disabled={isLoading}
										variant="outline"
										className="flex-1"
									>
										Cancel
									</Button>
									<Button
										type="button"
										onClick={props.onConfirm}
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
						</Stack>
					</Card>
				</div>
			</div>
		</>
	);
}
