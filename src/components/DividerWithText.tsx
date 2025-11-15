interface DividerWithTextProps {
	text: string;
}

export function DividerWithText({ text }: DividerWithTextProps) {
	return (
		<div className="relative">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-slate-300"></div>
			</div>
			<div className="relative flex justify-center text-sm">
				<span className="px-2 bg-white text-slate-500">{text}</span>
			</div>
		</div>
	);
}
