/**
 * Role-Based Access Control (RBAC) - Authentication Feature
 *
 * Authorization middleware for protecting routes and API endpoints.
 * Implements User/Editor/Admin role hierarchy with permission checking.
 *
 * @see docs/features/authentication.md - Complete feature documentation
 * @see docs/features/admin-dashboard.md - Role permissions matrix
 * @update-trigger When modifying role checks or permissions, update both feature docs
 */

import { json } from "@tanstack/react-start";
import { db } from "~/lib/db";
import type { UserRole } from "~/lib/db/types";
import { getSessionFromRequest } from "./session";

/**
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
	const user = await db
		.selectFrom("users")
		.select("role")
		.where("id", "=", userId)
		.executeTakeFirst();

	return user?.role || null;
}

/**
 * Get user with role from session
 */
export async function getUserWithRole(request: Request): Promise<{
	userId: string;
	role: UserRole;
} | null> {
	const session = await getSessionFromRequest(request);
	if (!session) {
		return null;
	}

	const user = await db
		.selectFrom("users")
		.select(["id", "role"])
		.where("id", "=", session.userId)
		.executeTakeFirst();

	if (!user) {
		return null;
	}

	return {
		userId: user.id,
		role: user.role,
	};
}

/**
 * Check if user has one of the allowed roles
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
	return allowedRoles.includes(userRole);
}

/**
 * Middleware to require authentication and specific roles
 * Returns user data if authorized, or throws a Response with 401/403
 */
export async function requireRole(
	request: Request,
	allowedRoles: UserRole[],
): Promise<{ userId: string; role: UserRole }> {
	const session = await getSessionFromRequest(request);

	if (!session) {
		throw json({ error: "Unauthorized - Please log in" }, { status: 401 });
	}

	const user = await db
		.selectFrom("users")
		.select(["id", "role"])
		.where("id", "=", session.userId)
		.executeTakeFirst();

	if (!user) {
		throw json({ error: "Unauthorized - User not found" }, { status: 401 });
	}

	if (!hasRole(user.role, allowedRoles)) {
		throw json(
			{
				error: "Forbidden - You do not have permission to access this resource",
			},
			{ status: 403 },
		);
	}

	return {
		userId: user.id,
		role: user.role,
	};
}

/**
 * Require admin role only
 */
export async function requireAdmin(
	request: Request,
): Promise<{ userId: string; role: UserRole }> {
	return requireRole(request, ["admin"]);
}

/**
 * Require editor or admin role
 */
export async function requireEditorOrAdmin(
	request: Request,
): Promise<{ userId: string; role: UserRole }> {
	return requireRole(request, ["editor", "admin"]);
}

/**
 * Require any authenticated user (any role)
 */
export async function requireAuth(
	request: Request,
): Promise<{ userId: string; role: UserRole }> {
	return requireRole(request, ["user", "editor", "admin"]);
}
