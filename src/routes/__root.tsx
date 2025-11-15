import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Heading } from "~/components/Heading";
import { PageBackground } from "~/components/PageBackground";
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
				title: "Choose the Heat - AI-Generated Romance Novels",
			},
			{
				name: "description",
				content:
					"Create your perfect romance novel with AI-powered storytelling",
			},
		],
		links: [
			{ rel: "stylesheet", href: globalStyles },
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon-64x64.png",
			},
		],
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
					<ReactQueryDevtools initialIsOpen={false} />
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
				<PageBackground className="flex items-center justify-center p-4">
					<div className="text-center space-y-6">
						<Heart className="w-24 h-24 text-romance-400 mx-auto" />
						<div className="space-y-4">
							<Heading level="h1" size="page">
								Page Not Found
							</Heading>
							<p className="text-lg text-slate-600">
								This story page doesn't exist yet.
							</p>
							<Link
								to="/browse"
								className="inline-block px-6 py-3 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors"
							>
								Go Home
							</Link>
						</div>
					</div>
				</PageBackground>
				<Scripts />
			</body>
		</html>
	);
}
