import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "~/lib/auth/authorization";
import { deleteUser, getUserById, updateUser } from "~/lib/db/queries/users";
import type { UserRole } from "~/lib/db/types";

// Validation schema for updating a user
const updateUserSchema = z.object({
	email: z.string().email().optional(),
	name: z.string().min(1).max(255).optional(),
	role: z.enum(["user", "editor", "admin"]).optional(),
});

export const Route = createFileRoute("/api/admin/users/$id")({
	server: {
		handlers: {
			// GET /api/admin/users/:id - Get user details
			GET: async ({ request, params }) => {
				try {
					await requireAdmin(request);

					const user = await getUserById(params.id);

					if (!user) {
						return json({ error: "User not found" }, { status: 404 });
					}

					// Don't return sensitive information
					const { ...userWithoutSensitiveInfo } = user;

					return json({ user: userWithoutSensitiveInfo });
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}
					console.error("Error fetching user:", error);
					return json({ error: "Failed to fetch user" }, { status: 500 });
				}
			},

			// PATCH /api/admin/users/:id - Update user
			PATCH: async ({ request, params }) => {
				try {
					const admin = await requireAdmin(request);

					const body = await request.json();
					const validatedData = updateUserSchema.parse(body);

					const updatedUser = await updateUser(
						params.id,
						validatedData,
						admin.userId,
					);

					return json({
						user: updatedUser,
						message: "User updated successfully",
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Validation error", details: error.errors },
							{ status: 400 },
						);
					}

					const errorMessage = (error as Error).message;

					if (errorMessage === "User not found") {
						return json({ error: "User not found" }, { status: 404 });
					}

					if (errorMessage === "Email already in use") {
						return json({ error: "Email already in use" }, { status: 409 });
					}

					console.error("Error updating user:", error);
					return json({ error: "Failed to update user" }, { status: 500 });
				}
			},

			// DELETE /api/admin/users/:id - Delete user
			DELETE: async ({ request, params }) => {
				try {
					const admin = await requireAdmin(request);

					// Prevent self-deletion
					if (admin.userId === params.id) {
						return json(
							{ error: "You cannot delete your own account" },
							{ status: 400 },
						);
					}

					await deleteUser(params.id, admin.userId);

					return json({ message: "User deleted successfully" });
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}

					if ((error as Error).message === "User not found") {
						return json({ error: "User not found" }, { status: 404 });
					}

					console.error("Error deleting user:", error);
					return json({ error: "Failed to delete user" }, { status: 500 });
				}
			},
		},
	},
});
