import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import globalStyles from "~/styles/globals.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Spicy Tales - AI-Generated Romance Novels",
			},
			{
				name: "description",
				content:
					"Create your perfect romance novel with AI-powered storytelling",
			},
		],
		links: [{ rel: "stylesheet", href: globalStyles }],
	}),
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
});

function RootComponent() {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						gcTime: 5 * 60 * 1000, // 5 minutes
					},
				},
			}),
	);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<Outlet />
					<Scripts />
				</QueryClientProvider>
			</body>
		</html>
	);
}

function NotFoundComponent() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="min-h-screen bg-gradient-to-br from-romance-50 via-white to-romance-100 flex items-center justify-center p-4">
					<div className="text-center">
						<Heart className="w-24 h-24 text-romance-400 mx-auto mb-6" />
						<h1 className="text-4xl font-bold text-slate-900 mb-4">
							Page Not Found
						</h1>
						<p className="text-lg text-slate-600 mb-8">
							This story page doesn't exist yet.
						</p>
						<Link
							to="/"
							className="inline-block px-6 py-3 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors"
						>
							Go Home
						</Link>
					</div>
				</div>
				<Scripts />
			</body>
		</html>
	);
}
