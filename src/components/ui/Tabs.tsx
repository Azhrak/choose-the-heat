import { createContext, type ReactNode, useContext, useState } from "react";
import { cn } from "~/lib/utils";

interface TabsContextValue {
	activeTab: string;
	setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
	const context = useContext(TabsContext);
	if (!context) {
		throw new Error("Tabs compound components must be used within Tabs");
	}
	return context;
}

interface TabsProps {
	defaultValue: string;
	value?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	children: ReactNode;
}

export function Tabs({
	defaultValue,
	value,
	onValueChange,
	className = "",
	children,
}: TabsProps) {
	const [internalValue, setInternalValue] = useState(defaultValue);
	const activeTab = value !== undefined ? value : internalValue;

	const handleTabChange = (newValue: string) => {
		if (value === undefined) {
			setInternalValue(newValue);
		}
		onValueChange?.(newValue);
	};

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
			<div className={className}>{children}</div>
		</TabsContext.Provider>
	);
}

interface TabsListProps {
	className?: string;
	children: ReactNode;
}

export function TabsList({ className = "", children }: TabsListProps) {
	return (
		<div
			className={cn(
				"flex gap-2 border-b border-slate-200 dark:border-slate-700",
				className,
			)}
			role="tablist"
		>
			{children}
		</div>
	);
}

interface TabsTriggerProps {
	value: string;
	className?: string;
	children: ReactNode;
}

export function TabsTrigger({
	value,
	className = "",
	children,
}: TabsTriggerProps) {
	const { activeTab, setActiveTab } = useTabsContext();
	const isActive = activeTab === value;

	return (
		<button
			type="button"
			role="tab"
			aria-selected={isActive}
			onClick={() => setActiveTab(value)}
			className={cn(
				"px-6 py-3 font-semibold transition-colors rounded-t-lg border-b-2",
				isActive
					? "border-romance-600 bg-romance-50 dark:bg-romance-900/20 text-romance-600 dark:text-romance-700"
					: "border-transparent bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800",
				className,
			)}
		>
			{children}
		</button>
	);
}

interface TabsContentProps {
	value: string;
	className?: string;
	children: ReactNode;
}

export function TabsContent({
	value,
	className = "",
	children,
}: TabsContentProps) {
	const { activeTab } = useTabsContext();

	if (activeTab !== value) {
		return null;
	}

	return (
		<div role="tabpanel" className={className}>
			{children}
		</div>
	);
}
