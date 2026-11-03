import { z } from 'zod';

export const ActivitySchema = z.object({
  name: z.string().describe('Activity or attraction name'),
  category: z.string().describe('Category (water-sport, cultural, nature, dining, family-fun)'),
  costPerPerson: z.string().describe('Cost per person'),
  duration: z.string().describe('Approximate duration'),
  minAge: z.number().describe('Minimum recommended age'),
  description: z.string().describe('Brief description of the activity'),
});

export type Activity = z.infer<typeof ActivitySchema>;

export function normalizeDestination(destination: string): string {
  const normalized = destination.trim().toLowerCase();
  if (normalized.includes('ibiza')) return 'ibiza';
  if (normalized.includes('menorca')) return 'menorca';
  return 'default';
}

const MOCK_ACTIVITIES: Record<string, Activity[]> = {
  ibiza: [
    {
      name: 'Catamaran Sunset Cruise',
      category: 'water-sport',
      costPerPerson: '€45',
      duration: '3 hours',
      minAge: 4,
      description: 'Sail along the Ibizan coast, swim in crystal-clear coves, and watch the sunset from the water.',
    },
    {
      name: 'Dalt Vila Museum & Old Town',
      category: 'cultural',
      costPerPerson: '€12',
      duration: '2 hours',
      minAge: 5,
      description: 'Explore the charming Dalt Vila with its cobblestone streets and panoramic views.',
    },
    {
      name: 'Cala Conta Family Beach Day',
      category: 'family-fun',
      costPerPerson: 'Free',
      duration: 'Full day',
      minAge: 0,
      description: 'Shallow, calm waters perfect for young children.',
    },
    {
      name: 'San Juan Market & Paella',
      category: 'dining',
      costPerPerson: '€25',
      duration: '3 hours',
      minAge: 3,
      description: 'Visit the hippy market followed by paella at a beachfront restaurant.',
    },
  ],
  menorca: [
    {
      name: 'Cala Macarella Beach',
      category: 'family-fun',
      costPerPerson: 'Free',
      duration: 'Full day',
      minAge: 0,
      description: 'Iconic turquoise beach with shallow waters ideal for toddlers.',
    },
  ],
  default: [
    {
      name: 'Local Beach Day',
      category: 'family-fun',
      costPerPerson: 'Free',
      duration: 'Full day',
      minAge: 0,
      description: 'Relax at a nearby beach with calm waters and family facilities.',
    },
  ],
};

export function getActivitiesForDestination(destination: string, numAdults = 2, numKids = 2): Activity[] {
  const key = normalizeDestination(destination);
  const activities = MOCK_ACTIVITIES[key] ?? MOCK_ACTIVITIES.default;
  const maxRecommendedAge = Math.max(0, 8 - Math.max(numKids, 1));

  return activities.filter((activity) => activity.minAge <= maxRecommendedAge || activity.category === 'family-fun');
}
