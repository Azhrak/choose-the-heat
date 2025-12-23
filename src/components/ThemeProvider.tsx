import { useRouter } from "@tanstack/react-router";
import {
	createContext,
	type PropsWithChildren,
	use,
	useCallback,
	useEffect,
} from "react";
import { setThemeServerFn, type Theme } from "~/lib/theme";

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void };
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider(props: Props) {
	const router = useRouter();

	// Update HTML class when theme prop changes
	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(props.theme);
	}, [props.theme]);

	const setTheme = useCallback(
		(val: Theme) => {
			// Immediately update the DOM for instant visual feedback
			const root = window.document.documentElement;
			root.classList.remove("light", "dark");
			root.classList.add(val);

			// Then update the server-side cookie and invalidate
			setThemeServerFn({ data: val }).then(() => router.invalidate());
		},
		[router],
	);

	return (
		<ThemeContext.Provider value={{ theme: props.theme, setTheme }}>
			{props.children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const val = use(ThemeContext);
	if (!val) throw new Error("useTheme called outside of ThemeProvider!");
	return val;
}
