import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import { getAllUsers, getUserCount } from "~/lib/db/queries/users";
import type { UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/api/admin/users/")({
	server: {
		handlers: {
			// GET /api/admin/users - Get all users with pagination
			GET: async ({ request }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					const url = new URL(request.url);
					const roleParam = url.searchParams.get("role") as UserRole | null;
					const searchParam = url.searchParams.get("search");
					const pageParam = url.searchParams.get("page");
					const limitParam = url.searchParams.get("limit");

					// Support both page-based and offset-based pagination
					const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
					const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;
					const offset = (page - 1) * limit;

					// Validate pagination params
					if (Number.isNaN(page) || page < 1) {
						return json({ error: "Invalid page parameter" }, { status: 400 });
					}

					if (Number.isNaN(limit) || limit < 1 || limit > 100) {
						return json(
							{ error: "Invalid limit parameter (must be 1-100)" },
							{ status: 400 },
						);
					}

					const filters = {
						role: roleParam || undefined,
						search: searchParam || undefined,
						limit,
						offset,
					};

					const [users, totalCount] = await Promise.all([
						getAllUsers(filters),
						getUserCount({ role: filters.role, search: filters.search }),
					]);

					return json({
						users,
						pagination: {
							page,
							limit,
							total: totalCount,
							totalPages: Math.ceil(totalCount / limit),
						},
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching users:", error);
					return json({ error: "Failed to fetch users" }, { status: 500 });
				}
			},
		},
	},
});
