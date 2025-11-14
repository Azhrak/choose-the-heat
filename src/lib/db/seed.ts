import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { hashPassword } from "../auth/password";
import { db } from "./index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables as fallback (tsx --env-file should handle this)
config({ path: path.resolve(__dirname, "../../../.env") });

async function seed() {
	console.log("🌱 Seeding database...");

	try {
		// Create admin user if environment variables are set
		const adminEmail = process.env.ADMIN_EMAIL;
		const adminPassword = process.env.ADMIN_PASSWORD;
		const adminName = process.env.ADMIN_NAME || "Admin User";

		if (adminEmail && adminPassword) {
			// Check if admin user already exists
			const existingAdmin = await db
				.selectFrom("users")
				.select("id")
				.where("email", "=", adminEmail)
				.executeTakeFirst();

			if (!existingAdmin) {
				const hashedPassword = await hashPassword(adminPassword);

				// Create admin user
				const [adminUser] = await db
					.insertInto("users")
					.values({
						email: adminEmail,
						name: adminName,
						role: "admin",
						email_verified: true,
					})
					.returning("id")
					.execute();

				// Create password account for admin
				await db
					.insertInto("password_accounts")
					.values({
						user_id: adminUser.id,
						hashed_password: hashedPassword,
					})
					.execute();

				console.log(`✅ Created admin user: ${adminEmail}`);
			} else {
				console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
			}
		} else {
			console.log(
				"ℹ️  Skipping admin user creation (ADMIN_EMAIL or ADMIN_PASSWORD not set)",
			);
		}

		// Seed novel templates
		const templates = [
			{
				title: "The CEO's Secret Arrangement",
				description:
					"A powerful CEO needs a fake fiancée to secure a business deal. What starts as a contractual arrangement becomes something neither expected.",
				base_tropes: ["fake-dating", "ceo-romance", "enemies-to-lovers"],
				estimated_scenes: 12,
				cover_gradient: "from-rose-500 to-pink-600",
				status: "published" as const,
			},
			{
				title: "Moonlit Destiny",
				description:
					"A human librarian discovers her new neighbor is a werewolf alpha. As supernatural threats emerge, they must navigate their forbidden attraction.",
				base_tropes: ["paranormal", "fated-mates", "forbidden-love"],
				estimated_scenes: 14,
				cover_gradient: "from-purple-600 to-indigo-700",
				status: "published" as const,
			},
			{
				title: "Second Chance Summer",
				description:
					"Returning to her hometown after a decade, she encounters the one who got away. Can they overcome their past and find love again?",
				base_tropes: ["second-chance", "small-town", "childhood-friends"],
				estimated_scenes: 10,
				cover_gradient: "from-amber-400 to-orange-500",
				status: "published" as const,
			},
			{
				title: "The Highlander's Vow",
				description:
					"Transported to 18th century Scotland, a modern woman must navigate Highland politics and an arranged marriage to a fierce warrior.",
				base_tropes: ["time-travel", "historical", "forced-proximity"],
				estimated_scenes: 15,
				cover_gradient: "from-emerald-600 to-teal-700",
				status: "published" as const,
			},
		];

		for (const template of templates) {
			const [insertedTemplate] = await db
				.insertInto("novel_templates")
				.values(template)
				.returning("id")
				.execute();

			console.log(`✅ Created template: ${template.title}`);

			// Add choice points for each template
			const choicePoints = getChoicePointsForTemplate(template.title);

			for (const choicePoint of choicePoints) {
				await db
					.insertInto("choice_points")
					.values({
						template_id: insertedTemplate.id,
						scene_number: choicePoint.scene_number,
						prompt_text: choicePoint.prompt_text,
						options: JSON.stringify(choicePoint.options),
					})
					.execute();
			}

			console.log(`  ✅ Added ${choicePoints.length} choice points`);
		}

		console.log("✅ Database seeded successfully!");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		throw error;
	} finally {
		await db.destroy();
	}
}

function getChoicePointsForTemplate(title: string) {
	// Generic choice points that work for most romance novels
	const baseChoicePoints = [
		{
			scene_number: 3,
			prompt_text: "How do you respond to their unexpected proposal?",
			options: [
				{
					id: "option-1",
					text: "Challenge them directly with skepticism",
					tone: "confrontational",
					impact: "bold",
				},
				{
					id: "option-2",
					text: "Express cautious interest",
					tone: "diplomatic",
					impact: "reserved",
				},
				{
					id: "option-3",
					text: "Share your vulnerable side",
					tone: "emotional",
					impact: "emotional",
				},
			],
		},
		{
			scene_number: 7,
			prompt_text: "They open up about their past. What do you do?",
			options: [
				{
					id: "option-1",
					text: "Comfort them with physical affection",
					tone: "intimate",
					impact: "bold",
				},
				{
					id: "option-2",
					text: "Share a similar experience from your life",
					tone: "vulnerable",
					impact: "emotional",
				},
				{
					id: "option-3",
					text: "Give them space but stay supportive",
					tone: "respectful",
					impact: "reserved",
				},
			],
		},
		{
			scene_number: 10,
			prompt_text: "A misunderstanding threatens everything. How do you react?",
			options: [
				{
					id: "option-1",
					text: "Fight for the relationship immediately",
					tone: "passionate",
					impact: "bold",
				},
				{
					id: "option-2",
					text: "Take time to process your feelings",
					tone: "thoughtful",
					impact: "reserved",
				},
				{
					id: "option-3",
					text: "Demand honest communication",
					tone: "direct",
					impact: "emotional",
				},
			],
		},
	];

	// Template-specific adjustments
	if (title.includes("CEO")) {
		baseChoicePoints[0].prompt_text =
			"The CEO makes an unexpected business proposal that would bind you together. How do you respond?";
	} else if (title.includes("Highlander")) {
		baseChoicePoints[0].prompt_text =
			"The Highland warrior challenges you in front of the clan. How do you respond?";
	} else if (title.includes("Moonlit")) {
		baseChoicePoints[0].prompt_text =
			"You discover their supernatural secret. How do you react?";
	}

	return baseChoicePoints;
}

seed();
