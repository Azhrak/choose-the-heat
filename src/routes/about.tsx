import { createFileRoute } from '@tanstack/react-router'
import { Heart, BookOpen, Sparkles, Volume2, Palette, Users, Star, GitBranch } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About Choose the Heat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your personalized AI-powered interactive romance novel experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-8">
          {/* Interactive Story Generation */}
          <FeatureSection
            icon={<Sparkles className="w-8 h-8" />}
            title="AI-Powered Story Generation"
            description="Experience unique, personalized romance stories generated just for you. Our AI creates engaging narratives scene by scene, ensuring every story is tailored to your preferences and choices."
            features={[
              'Scene-by-scene story progression',
              'Dynamic narrative generation based on your choices',
              'Multiple story templates to choose from',
              'Save and continue reading anytime',
            ]}
          />

          {/* Choice Points & Branching */}
          <FeatureSection
            icon={<GitBranch className="w-8 h-8" />}
            title="Interactive Choices & Branching"
            description="Shape your own romance adventure with meaningful choices that impact the story's direction. Create multiple branches and explore different narrative paths."
            features={[
              'Make choices that affect the story outcome',
              'Branch stories to explore alternative paths',
              'Navigate through your story history',
              'Bookmark your favorite moments',
            ]}
          />

          {/* Personalization */}
          <FeatureSection
            icon={<Palette className="w-8 h-8" />}
            title="Complete Personalization"
            description="Customize every aspect of your reading experience to match your preferences perfectly."
            features={[
              'Spice Level (1-5): From sweet and clean to steamy',
              'Pacing: Slow-burn romance or fast-paced passion',
              'Scene Length: Short, medium, or long scenes',
              'POV Character: Choose female, male, or non-binary perspective',
              'Genres & Tropes: Select from a rich variety of romance themes',
            ]}
          />

          {/* Text-to-Speech */}
          <FeatureSection
            icon={<Volume2 className="w-8 h-8" />}
            title="Text-to-Speech Audio"
            description="Listen to your stories with high-quality AI voice narration. Perfect for hands-free reading or multitasking."
            features={[
              'Professional AI voice narration',
              'Full playback controls (play, pause, seek)',
              'Volume adjustment',
              'Audio available for generated scenes',
            ]}
          />

          {/* Story Library */}
          <FeatureSection
            icon={<BookOpen className="w-8 h-8" />}
            title="Personal Story Library"
            description="Keep track of all your stories in one place with powerful organization tools."
            features={[
              'Organize stories by progress (in-progress, completed)',
              'Favorite your best stories',
              'Filter and search capabilities',
              'Progress indicators and scene counts',
            ]}
          />

          {/* Template Browsing */}
          <FeatureSection
            icon={<Star className="w-8 h-8" />}
            title="Template Discovery"
            description="Browse through curated story templates with different themes, settings, and romance tropes."
            features={[
              'Search templates by title or description',
              'Filter by tropes and themes',
              'Preview template details before starting',
              'New templates added regularly',
            ]}
          />

          {/* User Account */}
          <FeatureSection
            icon={<Users className="w-8 h-8" />}
            title="Secure User Accounts"
            description="Your stories and preferences are safely stored and accessible across all your devices."
            features={[
              'Secure authentication (email/password or Google OAuth)',
              'Profile management',
              'Download your account data',
              'Privacy-focused with GDPR compliance',
            ]}
          />
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 rounded-2xl p-8 text-white">
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Romance Adventure?</h2>
          <p className="text-lg mb-6 opacity-90">
            Create your personalized story and explore endless romantic possibilities
          </p>
          <a
            href="/browse"
            className="inline-block bg-white text-rose-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse Stories
          </a>
        </div>
      </div>
    </div>
  )
}

interface FeatureSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}

function FeatureSection({ icon, title, description, features }: FeatureSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-rose-500 dark:text-rose-400">{icon}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <Heart className="w-4 h-4 text-rose-400 flex-shrink-0 mt-1" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
