import { createContext, type ReactNode, useContext, useState } from "react";
import { Toast, type ToastType } from "./Toast";

interface ToastOptions {
	message: string;
	type?: ToastType;
	duration?: number;
}

interface ToastContextValue {
	showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toast, setToast] = useState<ToastOptions | null>(null);

	const showToast = (options: ToastOptions) => {
		// Close any existing toast before showing a new one
		setToast(null);
		// Use setTimeout to ensure the animation plays correctly
		setTimeout(() => {
			setToast(options);
		}, 50);
	};

	const closeToast = () => {
		setToast(null);
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					duration={toast.duration}
					onClose={closeToast}
				/>
			)}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}
