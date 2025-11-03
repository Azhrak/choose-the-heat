import { db } from './index'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Seed novel templates
    const templates = [
      {
        title: 'The CEO\'s Secret Arrangement',
        description:
          'A powerful CEO needs a fake fiancée to secure a business deal. What starts as a contractual arrangement becomes something neither expected.',
        base_tropes: ['fake-dating', 'ceo-romance', 'enemies-to-lovers'],
        estimated_scenes: 12,
        cover_gradient: 'from-rose-500 to-pink-600',
      },
      {
        title: 'Moonlit Destiny',
        description:
          'A human librarian discovers her new neighbor is a werewolf alpha. As supernatural threats emerge, they must navigate their forbidden attraction.',
        base_tropes: ['paranormal', 'fated-mates', 'forbidden-love'],
        estimated_scenes: 14,
        cover_gradient: 'from-purple-600 to-indigo-700',
      },
      {
        title: 'Second Chance Summer',
        description:
          'Returning to her hometown after a decade, she encounters the one who got away. Can they overcome their past and find love again?',
        base_tropes: ['second-chance', 'small-town', 'childhood-friends'],
        estimated_scenes: 10,
        cover_gradient: 'from-amber-400 to-orange-500',
      },
      {
        title: 'The Highlander\'s Vow',
        description:
          'Transported to 18th century Scotland, a modern woman must navigate Highland politics and an arranged marriage to a fierce warrior.',
        base_tropes: ['time-travel', 'historical', 'forced-proximity'],
        estimated_scenes: 15,
        cover_gradient: 'from-emerald-600 to-teal-700',
      },
    ]

    for (const template of templates) {
      const [insertedTemplate] = await db
        .insertInto('novel_templates')
        .values(template)
        .returning('id')
        .execute()

      console.log(`✅ Created template: ${template.title}`)

      // Add choice points for each template
      const choicePoints = getChoicePointsForTemplate(template.title)

      for (const choicePoint of choicePoints) {
        await db
          .insertInto('choice_points')
          .values({
            template_id: insertedTemplate.id,
            scene_number: choicePoint.scene_number,
            prompt_text: choicePoint.prompt_text,
            options: JSON.stringify(choicePoint.options),
          })
          .execute()
      }

      console.log(`  ✅ Added ${choicePoints.length} choice points`)
    }

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await db.destroy()
  }
}

function getChoicePointsForTemplate(title: string) {
  // Generic choice points that work for most romance novels
  const baseChoicePoints = [
    {
      scene_number: 3,
      prompt_text: 'How do you respond to their unexpected proposal?',
      options: [
        {
          id: 'option-1',
          text: 'Challenge them directly with skepticism',
          tone: 'confrontational',
          impact: 'bold',
        },
        {
          id: 'option-2',
          text: 'Express cautious interest',
          tone: 'diplomatic',
          impact: 'reserved',
        },
        {
          id: 'option-3',
          text: 'Share your vulnerable side',
          tone: 'emotional',
          impact: 'emotional',
        },
      ],
    },
    {
      scene_number: 7,
      prompt_text: 'They open up about their past. What do you do?',
      options: [
        {
          id: 'option-1',
          text: 'Comfort them with physical affection',
          tone: 'intimate',
          impact: 'bold',
        },
        {
          id: 'option-2',
          text: 'Share a similar experience from your life',
          tone: 'vulnerable',
          impact: 'emotional',
        },
        {
          id: 'option-3',
          text: 'Give them space but stay supportive',
          tone: 'respectful',
          impact: 'reserved',
        },
      ],
    },
    {
      scene_number: 10,
      prompt_text: 'A misunderstanding threatens everything. How do you react?',
      options: [
        {
          id: 'option-1',
          text: 'Fight for the relationship immediately',
          tone: 'passionate',
          impact: 'bold',
        },
        {
          id: 'option-2',
          text: 'Take time to process your feelings',
          tone: 'thoughtful',
          impact: 'reserved',
        },
        {
          id: 'option-3',
          text: 'Demand honest communication',
          tone: 'direct',
          impact: 'emotional',
        },
      ],
    },
  ]

  // Template-specific adjustments
  if (title.includes('CEO')) {
    baseChoicePoints[0].prompt_text = 'The CEO makes an unexpected business proposal that would bind you together. How do you respond?'
  } else if (title.includes('Highlander')) {
    baseChoicePoints[0].prompt_text = 'The Highland warrior challenges you in front of the clan. How do you respond?'
  } else if (title.includes('Moonlit')) {
    baseChoicePoints[0].prompt_text = 'You discover their supernatural secret. How do you react?'
  }

  return baseChoicePoints
}

seed()
