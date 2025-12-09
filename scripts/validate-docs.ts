#!/usr/bin/env tsx

/**
 * Documentation Validation Script
 *
 * Validates active documentation health and catches common issues.
 * Skips archived and planning docs to focus on current documentation.
 *
 * @see docs/AI_AGENT_GUIDELINES.md for documentation standards
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

interface ValidationResult {
	category: string;
	severity: "error" | "warning" | "info";
	message: string;
	file?: string;
	line?: number;
}

const results: ValidationResult[] = [];
const DOCS_DIR = "docs";
const FEATURES_DIR = join(DOCS_DIR, "features");

// ANSI color codes
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	gray: "\x1b[90m",
};

function log(message: string, color?: keyof typeof colors) {
	const colorCode = color ? colors[color] : "";
	console.log(`${colorCode}${message}${colors.reset}`);
}

function addResult(result: ValidationResult) {
	results.push(result);
}

/**
 * Check if file should be skipped (archived, planning docs, etc.)
 */
function shouldSkipFile(filePath: string): boolean {
	const skipPatterns = [
		"/archive/",
		"REORGANIZATION",
		"_PLAN.md",
		"IMPLEMENTATION_PLAN",
	];
	return skipPatterns.some((pattern) => filePath.includes(pattern));
}

/**
 * Check if all code file paths referenced in active docs exist
 */
function validateCodeReferences() {
	log("\n📂 Validating code file references in active docs...", "blue");

	const docFiles = getAllMarkdownFiles(DOCS_DIR).filter(
		(f) => !shouldSkipFile(f),
	);

	let checkedCount = 0;

	for (const docFile of docFiles) {
		const content = readFileSync(docFile, "utf-8");
		const lines = content.split("\n");

		// Match patterns like: src/lib/auth/session.ts or ../../src/components/Button.tsx
		const codeRefPattern = /(?:\(|`|>|\s)((?:\.\.\/)*src\/[^)\s`<*]+\.tsx?)/g;

		lines.forEach((line, index) => {
			let match;
			while ((match = codeRefPattern.exec(line)) !== null) {
				const refPath = match[1];

				// Skip wildcard patterns and examples
				if (
					refPath.includes("*") ||
					refPath.includes("{") ||
					refPath.includes("[") ||
					refPath.includes("$")
				) {
					continue;
				}

				checkedCount++;

				// Resolve relative path from doc file location
				const absolutePath = refPath.startsWith("..")
					? join(docFile, "..", refPath)
					: refPath;

				if (!existsSync(absolutePath)) {
					addResult({
						category: "Code References",
						severity: "error",
						message: `Referenced code file does not exist: ${refPath}`,
						file: docFile,
						line: index + 1,
					});
				}
			}
		});
	}

	log(`  Checked ${checkedCount} code references`, "gray");
}

/**
 * Check internal markdown links in active docs
 */
function validateInternalLinks() {
	log("\n🔗 Validating internal markdown links...", "blue");

	const docFiles = getAllMarkdownFiles(DOCS_DIR).filter(
		(f) => !shouldSkipFile(f),
	);

	let checkedCount = 0;

	for (const docFile of docFiles) {
		const content = readFileSync(docFile, "utf-8");
		const lines = content.split("\n");

		// Match markdown links: [text](path)
		const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

		lines.forEach((line, index) => {
			let match;
			while ((match = linkPattern.exec(line)) !== null) {
				const linkPath = match[2];

				// Skip external URLs and anchors-only
				if (
					linkPath.startsWith("http://") ||
					linkPath.startsWith("https://") ||
					linkPath.startsWith("#")
				) {
					continue;
				}

				checkedCount++;

				// Extract file path (ignore anchors)
				const [filePath] = linkPath.split("#");

				// Resolve path relative to doc file
				const absolutePath = join(docFile, "..", filePath);

				if (!existsSync(absolutePath)) {
					addResult({
						category: "Internal Links",
						severity: "error",
						message: `Broken internal link: ${linkPath}`,
						file: docFile,
						line: index + 1,
					});
				}
			}
		});
	}

	log(`  Checked ${checkedCount} internal links`, "gray");
}

/**
 * Check for stale documentation (Last Updated > 90 days ago)
 */
function validateLastUpdated() {
	log("\n📅 Checking Last Updated dates in feature docs...", "blue");

	const featureDocs = readdirSync(FEATURES_DIR)
		.filter((f) => f.endsWith(".md"))
		.map((f) => join(FEATURES_DIR, f));

	const today = new Date();
	const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

	for (const docFile of featureDocs) {
		const content = readFileSync(docFile, "utf-8");

		// Match: | **Last Updated** | YYYY-MM-DD |
		const lastUpdatedMatch = content.match(
			/\|\s*\*\*Last Updated\*\*\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/,
		);

		if (!lastUpdatedMatch) {
			addResult({
				category: "Last Updated",
				severity: "warning",
				message: "Missing Last Updated date in metadata",
				file: docFile,
			});
			continue;
		}

		const lastUpdated = new Date(lastUpdatedMatch[1]);

		if (lastUpdated < ninetyDaysAgo) {
			const daysSince = Math.floor(
				(today.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
			);
			addResult({
				category: "Last Updated",
				severity: "info",
				message: `Documentation is ${daysSince} days old (consider reviewing)`,
				file: docFile,
			});
		}
	}
}

/**
 * Check for links to archived files in active docs
 */
function validateNoArchivedLinks() {
	log("\n🗄️  Checking for links to archived files in active docs...", "blue");

	const docFiles = getAllMarkdownFiles(DOCS_DIR).filter(
		(f) => !shouldSkipFile(f) && !f.includes("AI_AGENT_GUIDELINES"),
	);

	const archivedPaths = [
		"docs/technical/TEXT_TO_SPEECH.md",
		"docs/technical/ADMIN.md",
		"docs/technical/SCENE_METADATA.md",
		"../technical/TEXT_TO_SPEECH.md",
		"../technical/ADMIN.md",
		"../technical/SCENE_METADATA.md",
	];

	for (const docFile of docFiles) {
		const content = readFileSync(docFile, "utf-8");
		const lines = content.split("\n");

		lines.forEach((line, index) => {
			for (const archivedPath of archivedPaths) {
				if (line.includes(archivedPath)) {
					addResult({
						category: "Archived Links",
						severity: "error",
						message: `Link to archived file: ${archivedPath} (should point to features/ instead)`,
						file: docFile,
						line: index + 1,
					});
				}
			}
		});
	}
}

/**
 * Validate feature docs have required sections
 */
function validateFeatureStructure() {
	log("\n📋 Validating feature documentation structure...", "blue");

	const requiredSections = [
		"## Metadata",
		"## Overview",
		"## User Experience",
		"## Technical Implementation",
		"## API Reference",
		"## Code Locations",
		"## Configuration",
		"## Related Features",
		"## Testing",
		"## Change Log",
	];

	const featureDocs = readdirSync(FEATURES_DIR)
		.filter((f) => f.endsWith(".md"))
		.map((f) => join(FEATURES_DIR, f));

	for (const docFile of featureDocs) {
		const content = readFileSync(docFile, "utf-8");

		for (const section of requiredSections) {
			if (!content.includes(section)) {
				addResult({
					category: "Feature Structure",
					severity: "warning",
					message: `Missing section: ${section}`,
					file: docFile,
				});
			}
		}
	}
}

/**
 * Get all markdown files recursively
 */
function getAllMarkdownFiles(dir: string): string[] {
	const files: string[] = [];

	function walk(currentDir: string) {
		const entries = readdirSync(currentDir);

		for (const entry of entries) {
			const fullPath = join(currentDir, entry);
			const stat = statSync(fullPath);

			if (stat.isDirectory()) {
				// Skip node_modules and other build directories
				if (
					!entry.startsWith(".") &&
					entry !== "node_modules" &&
					entry !== "dist" &&
					entry !== "build"
				) {
					walk(fullPath);
				}
			} else if (entry.endsWith(".md")) {
				files.push(fullPath);
			}
		}
	}

	walk(dir);
	return files;
}

/**
 * Print results summary
 */
function printResults() {
	log("\n" + "=".repeat(80), "blue");
	log("📊 Documentation Validation Report", "blue");
	log("=".repeat(80), "blue");

	const errorCount = results.filter((r) => r.severity === "error").length;
	const warningCount = results.filter((r) => r.severity === "warning").length;
	const infoCount = results.filter((r) => r.severity === "info").length;

	if (results.length === 0) {
		log("\n✅ All validation checks passed!", "green");
		log("\nDocumentation health: EXCELLENT ✨", "green");
		return 0;
	}

	// Group by category
	const byCategory = new Map<string, ValidationResult[]>();

	for (const result of results) {
		const existing = byCategory.get(result.category) || [];
		existing.push(result);
		byCategory.set(result.category, existing);
	}

	// Print by category
	for (const [category, categoryResults] of byCategory) {
		log(`\n${category}:`, "blue");

		for (const result of categoryResults) {
			const icon =
				result.severity === "error"
					? "❌"
					: result.severity === "warning"
						? "⚠️ "
						: "ℹ️ ";
			const color =
				result.severity === "error"
					? "red"
					: result.severity === "warning"
						? "yellow"
						: "gray";

			const location = result.file
				? result.line
					? `${relative(process.cwd(), result.file)}:${result.line}`
					: relative(process.cwd(), result.file)
				: "";

			log(`  ${icon} ${result.message}`, color);
			if (location) {
				log(`     ${location}`, "gray");
			}
		}
	}

	// Summary
	log("\n" + "=".repeat(80), "blue");
	log("Summary:", "blue");
	log(`  ❌ Errors:   ${errorCount}`, errorCount > 0 ? "red" : "green");
	log(`  ⚠️  Warnings: ${warningCount}`, warningCount > 0 ? "yellow" : "gray");
	log(`  ℹ️  Info:     ${infoCount}`, "gray");
	log("=".repeat(80) + "\n", "blue");

	// Health status
	if (errorCount === 0 && warningCount === 0) {
		log("Documentation health: EXCELLENT ✨", "green");
		return 0;
	}
	if (errorCount === 0 && warningCount <= 5) {
		log("Documentation health: GOOD 👍", "green");
		return 0;
	}
	if (errorCount <= 3) {
		log("Documentation health: NEEDS ATTENTION ⚠️", "yellow");
		log("\nConsider fixing errors when time permits.", "yellow");
		return 0; // Don't fail CI for minor issues
	}
	log("Documentation health: POOR ❌", "red");
	log("\nPlease fix critical errors before committing.", "red");
	return 1;
}

/**
 * Main execution
 */
async function main() {
	log("🔍 Validating active documentation...\n", "blue");
	log("(Skipping archived and planning docs)\n", "gray");

	try {
		validateCodeReferences();
		validateInternalLinks();
		validateLastUpdated();
		validateNoArchivedLinks();
		validateFeatureStructure();

		const exitCode = printResults();
		process.exit(exitCode);
	} catch (error) {
		log(`\n❌ Validation failed with error:`, "red");
		console.error(error);
		process.exit(1);
	}
}

main();
