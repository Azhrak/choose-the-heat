import type { TemplateStatus, UserRole } from "~/lib/db/types";

// Template types are re-exported from db/types for consistency
export type { TemplateStatus };

export interface ChoiceOption {
	id: string;
	text: string;
	tone: string;
	impact: string;
}

export interface ChoicePoint {
	id: string;
	template_id: string;
	scene_number: number;
	prompt_text: string;
	options: ChoiceOption[];
	created_at: string;
}

export interface Template {
	id: string;
	title: string;
	description: string;
	base_tropes: string[];
	estimated_scenes: number;
	cover_gradient: string;
	cover_url: string | null;
	status: TemplateStatus;
	created_at: string;
	updated_at: string;
	archived_at: string | null;
	choicePoints?: ChoicePoint[];
}

// User types
export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	email_verified: boolean;
	created_at: string;
	updated_at: string;
}

// Story types
export type StoryStatus = "in-progress" | "completed";

export interface UserStory {
	id: string;
	user_id: string;
	template_id: string;
	story_title: string | null;
	preferences: unknown; // JSON field containing UserPreferences
	current_scene: number;
	status: StoryStatus;
	favorited_at: string | null;
	branched_from_story_id?: string | null;
	branched_at_scene?: number | null;
	ai_provider?: string | null;
	ai_model?: string | null;
	ai_temperature?: number | null;
	created_at: string;
	updated_at: string;
	template: Template;
	parentStory?: {
		id: string;
		story_title: string | null;
	};
}

// Scene types
export interface Scene {
	id: string;
	story_id: string;
	scene_number: number;
	content: string;
	created_at: string;
	updated_at: string;
}

// Audit Log types
export interface AuditLog {
	id: string;
	user_id: string;
	action: string;
	entity_type: string;
	entity_id: string | null;
	metadata: Record<string, unknown> | null;
	created_at: string;
	user?: {
		name: string;
		email: string;
	};
}

// Dashboard Stats types
export interface DashboardStats {
	totalUsers: number;
	totalStories: number;
	totalTemplates: number;
	activeTemplates: number;
	storiesInProgress: number;
	completedStories: number;
	recentActivity: AuditLog[];
}

// API response wrappers
export interface ApiResponse<T> {
	data?: T;
	error?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}
