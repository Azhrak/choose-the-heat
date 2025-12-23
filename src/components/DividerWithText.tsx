interface DividerWithTextProps {
	text: string;
}

export function DividerWithText(props: DividerWithTextProps) {
	return (
		<div className="relative">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-slate-300 dark:border-gray-600"></div>
			</div>
			<div className="relative flex justify-center text-sm">
				<span className="px-2 bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400">
					{props.text}
				</span>
			</div>
		</div>
	);
}
