import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { getUserStories } from "~/lib/db/queries/stories";

export const Route = createFileRoute("/api/stories/user")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const url = new URL(request.url);
					const status = url.searchParams.get("status");

					let stories;
					if (status === "in-progress" || status === "completed") {
						stories = await getUserStories(session.userId, status);
					} else {
						stories = await getUserStories(session.userId);
					}

					return json({ stories });
				} catch (error) {
					console.error("Error fetching user stories:", error);
					return json({ error: "Failed to fetch stories" }, { status: 500 });
				}
			},
		},
	},
});
