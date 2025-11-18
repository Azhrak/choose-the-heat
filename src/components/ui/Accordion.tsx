import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { cn } from "~/lib/utils";

interface AccordionItemProps {
	id: string | number;
	title: ReactNode;
	children: ReactNode;
	isOpen?: boolean;
	onToggle?: () => void;
}

/**
 * Individual accordion item component
 */
export function AccordionItem({
	title,
	children,
	isOpen = false,
	onToggle,
}: AccordionItemProps) {
	return (
		<div className="border border-slate-200 dark:border-gray-700 rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className={cn(
					"w-full flex items-center justify-between gap-4 p-4 sm:p-6 text-left",
					"hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors",
					isOpen && "bg-slate-50 dark:bg-gray-700/50",
				)}
			>
				<div className="flex-1">{title}</div>
				<ChevronDown
					className={cn(
						"w-5 h-5 text-slate-500 dark:text-gray-400 transition-transform shrink-0",
						isOpen && "rotate-180",
					)}
				/>
			</button>
			{isOpen && (
				<div className="p-4 sm:p-6 pt-0 border-t border-slate-100 dark:border-gray-700">
					{children}
				</div>
			)}
		</div>
	);
}

interface AccordionProps {
	children: ReactNode;
	className?: string;
	/**
	 * If true, multiple items can be open at once
	 * If false (default), opening one item closes others
	 */
	allowMultiple?: boolean;
}

/**
 * Reusable accordion container component
 * Manages the open/closed state of accordion items
 */
export function Accordion({ children, className }: AccordionProps) {
	return <div className={cn("space-y-4", className)}>{children}</div>;
}

/**
 * Controlled Accordion with automatic state management
 */
interface ControlledAccordionProps {
	items: Array<{
		id: string | number;
		title: ReactNode;
		content: ReactNode;
	}>;
	className?: string;
	allowMultiple?: boolean;
	defaultOpenItems?: Array<string | number>;
	showToggleAll?: boolean;
}

export function ControlledAccordion({
	items,
	className,
	allowMultiple = false,
	defaultOpenItems = [],
	showToggleAll = false,
}: ControlledAccordionProps) {
	const [openItems, setOpenItems] = useState<Set<string | number>>(
		new Set(defaultOpenItems),
	);

	const toggleItem = (id: string | number) => {
		setOpenItems((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				if (!allowMultiple) {
					next.clear();
				}
				next.add(id);
			}
			return next;
		});
	};

	const allOpen = openItems.size === items.length;

	const toggleAll = () => {
		if (allOpen) {
			setOpenItems(new Set());
		} else {
			setOpenItems(new Set(items.map((item) => item.id)));
		}
	};

	return (
		<div className={className}>
			{showToggleAll && items.length > 0 && (
				<div className="mb-4 flex justify-end">
					<Button variant="ghost" size="sm" onClick={toggleAll}>
						{allOpen ? "Hide All" : "Show All"}
					</Button>
				</div>
			)}
			<Accordion allowMultiple={allowMultiple}>
				{items.map((item) => (
					<AccordionItem
						key={item.id}
						id={item.id}
						title={item.title}
						isOpen={openItems.has(item.id)}
						onToggle={() => toggleItem(item.id)}
					>
						{item.content}
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
