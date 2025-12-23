import { Moon, Sun } from "lucide-react";
import { useTheme } from "~/components/ThemeProvider";

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle(props: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();

	function toggleTheme() {
		setTheme(theme === "light" ? "dark" : "light");
	}

	return (
		<button
			onClick={toggleTheme}
			className={`p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-romance-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${props.className ?? ""}`}
			type="button"
			aria-label="Toggle theme"
		>
			{theme === "dark" ? (
				<Moon className="w-5 h-5" />
			) : (
				<Sun className="w-5 h-5" />
			)}
		</button>
	);
}
