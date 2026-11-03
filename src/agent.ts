import { z } from 'genkit';
import { ai, modelName } from './genkit.js';
import { getFlightsForDestination, FlightSchema } from './tools/flights.js';
import { getHotelsForDestination, HotelSchema } from './tools/hotels.js';
import { getActivitiesForDestination, ActivitySchema } from './tools/activities.js';

export const TravelRequestSchema = z.object({
  destination: z.string().describe('The travel destination (e.g., Ibiza)'),
  numAdults: z.number().int().min(1).default(2),
  numKids: z.number().int().min(0).default(0),
  kidAges: z.array(z.number().int()).default([]),
  budget: z.enum(['budget', 'moderate', 'comfortable', 'luxury']).default('moderate'),
});

export type TravelRequest = z.infer<typeof TravelRequestSchema>;

export const TravelPlanSchema = z.object({
  destination: z.string().describe('The travel destination'),
  duration: z.string().describe('Trip duration (e.g., 5 days / 4 nights)'),
  summary: z.string().describe('Brief trip summary for the family'),
  flights: z.array(z.object({
    airline: z.string(),
    departure: z.string(),
    arrival: z.string(),
    price: z.string(),
    stops: z.number(),
  })).describe('Flight options'),
  hotel: z.object({
    name: z.string(),
    rating: z.number(),
    pricePerNight: z.string(),
    amenities: z.array(z.string()),
  }).describe('Recommended hotel'),
  activities: z.array(z.object({
    name: z.string(),
    category: z.string(),
    costPerPerson: z.string(),
    duration: z.string(),
    description: z.string(),
  })).describe('Planned activities'),
  totalEstimatedCost: z.string().describe('Total estimated cost for the family'),
});

export type TravelPlan = z.infer<typeof TravelPlanSchema>;

export const findFlightsTool = ai.defineTool(
  {
    name: 'findFlights',
    description: 'Search for family-friendly flights to a destination.',
    inputSchema: z.object({
      destination: z.string(),
      numPassengers: z.number(),
    }),
    outputSchema: z.array(FlightSchema),
  },
  async ({ destination, numPassengers }) => {
    return getFlightsForDestination(destination, numPassengers);
  }
);

export const findHotelsTool = ai.defineTool(
  {
    name: 'findHotels',
    description: 'Search for family-friendly hotels at a destination.',
    inputSchema: z.object({
      destination: z.string(),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
    }),
    outputSchema: z.array(HotelSchema),
  },
  async ({ destination }) => {
    return getHotelsForDestination(destination, 5);
  }
);

export const findActivitiesTool = ai.defineTool(
  {
    name: 'findActivities',
    description: 'Find family-friendly activities and attractions at a destination.',
    inputSchema: z.object({
      destination: z.string(),
      numAdults: z.number(),
      numKids: z.number(),
    }),
    outputSchema: z.array(ActivitySchema),
  },
  async ({ destination, numAdults, numKids }) => {
    return getActivitiesForDestination(destination, numAdults, numKids);
  }
);

export const travelPlannerFlow = ai.defineFlow(
  {
    name: 'travelPlannerFlow',
    inputSchema: TravelRequestSchema,
    outputSchema: TravelPlanSchema,
  },
  async (input) => {
    const numPassengers = input.numAdults + input.numKids;
    const normalizedKidAges = input.kidAges.length
      ? input.kidAges
      : Array.from({ length: input.numKids }, (_, index) => 7 - index);

    const prompt = `You are a local Ibizan family travel expert. Create a detailed travel plan for a family visiting ${input.destination}.

Destination: ${input.destination}
Number of adults: ${input.numAdults}
Number of children: ${input.numKids} (ages: ${normalizedKidAges.join(', ')})
Total passengers: ${numPassengers}
Budget preference: ${input.budget}

Use the provided tools to find flights, hotels, and activities. Then create a comprehensive travel plan.

IMPORTANT:
- Recommend activities appropriate for the children's ages.
- Provide realistic cost estimates in euros.
- Return the results in the exact JSON format requested.`;

    const response = await ai.generate({
      model: modelName,
      prompt,
      tools: [findFlightsTool, findHotelsTool, findActivitiesTool],
      output: { schema: TravelPlanSchema },
    });

    if (!response.output) {
      throw new Error('Failed to generate travel plan');
    }

    return response.output;
  }
);
