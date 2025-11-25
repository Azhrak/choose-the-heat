import { type ReactNode, useEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
	children: ReactNode;
}

const sizeClasses = {
	sm: "max-w-md",
	md: "max-w-lg",
	lg: "max-w-2xl",
};

export function Modal({
	isOpen,
	onClose,
	title,
	size = "md",
	className = "",
	children,
}: ModalProps) {
	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				className="absolute inset-0 bg-black bg-opacity-50 cursor-default"
				onClick={onClose}
				aria-label="Close modal"
			/>
			<div
				className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl ${sizeClasses[size]} w-full p-8 ${className}`.trim()}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? "modal-title" : undefined}
			>
				{title && (
					<h2
						id="modal-title"
						className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6"
					>
						{title}
					</h2>
				)}
				{children}
			</div>
		</div>
	);
}
