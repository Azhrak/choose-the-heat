import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { db } from "../src/lib/db/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, "../.env") });

// Map of image filenames (without extension) to cover URLs
const coverImages = [
	"Captive Heart.png",
	"Dragon's Claimed Mate.png",
	"Fae Court Intrigue.png",
	"Mafia Prince's Obsession.png",
	"Moonlit Destiny.png",
	"Royal Masquerade.png",
	"Second Chance Summer.png",
	"Snowed In with the Enemy.png",
	"Stranded with the SEAL.png",
	"The Best Friend's Brother.png",
	"The Bodyguard's Promise.png",
	"The CEO's Secret Arrangement.png",
	"The Cowboy's Second Chance.png",
	"The Duke's Defiant Bride.png",
	"The Hacker's Heart.png",
	"The Highlander's Vow.png",
	"The Professor's Temptation.png",
	"The Rockstar's Muse.png",
	"The Sheikh's Forbidden Bride.png",
	"The Surgeon's Touch.png",
	"Undercover Desire.png",
	"Vampire's Kiss at Midnight.png",
	"Witch's Redemption.png",
];

async function updateTemplateCovers() {
	console.log("🖼️  Updating template covers...");

	try {
		// Get all templates
		const templates = await db
			.selectFrom("novel_templates")
			.select(["id", "title", "cover_url"])
			.execute();

		console.log(`Found ${templates.length} templates in database`);

		let updatedCount = 0;
		let notFoundCount = 0;

		for (const template of templates) {
			// Try to find matching image by exact title match
			const matchingImage = coverImages.find((imageName) => {
				const imageTitle = imageName.replace(/\.png$/i, "");
				return imageTitle === template.title;
			});

			if (matchingImage) {
				const coverUrl = `/images/novel-covers/${matchingImage}`;

				// Update the template
				await db
					.updateTable("novel_templates")
					.set({ cover_url: coverUrl })
					.where("id", "=", template.id)
					.execute();

				console.log(`✅ Updated "${template.title}" -> ${coverUrl}`);
				updatedCount++;
			} else {
				console.log(`⚠️  No matching image found for "${template.title}"`);
				notFoundCount++;
			}
		}

		console.log("\n📊 Summary:");
		console.log(`  ✅ Updated: ${updatedCount}`);
		console.log(`  ⚠️  Not found: ${notFoundCount}`);
		console.log(`  📁 Total templates: ${templates.length}`);

		if (notFoundCount > 0) {
			console.log("\n💡 Available images that weren't matched:");
			const usedImages = new Set(
				templates
					.map((t) => {
						const img = coverImages.find(
							(imageName) => imageName.replace(/\.png$/i, "") === t.title,
						);
						return img;
					})
					.filter(Boolean),
			);

			coverImages.forEach((img) => {
				if (!usedImages.has(img)) {
					console.log(`  - ${img.replace(/\.png$/i, "")}`);
				}
			});
		}
	} catch (error) {
		console.error("❌ Error updating template covers:", error);
		throw error;
	} finally {
		await db.destroy();
	}
}

updateTemplateCovers();
