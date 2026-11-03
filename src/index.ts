import { travelPlannerFlow } from './agent.js';
import './evals/evaluators.js';

async function main() {
  console.log('--- Family Travel Planner (Genkit) ---\n');
  console.log('Generating sample travel plan for Ibiza...\n');

  const plan = await travelPlannerFlow({
    destination: 'Ibiza',
    numAdults: 2,
    numKids: 2,
    kidAges: [6, 7],
    budget: 'moderate',
  });

  console.log('='.repeat(50));
  console.log(`DESTINATION: ${plan.destination}`);
  console.log(`DURATION:    ${plan.duration}`);
  console.log(`SUMMARY:     ${plan.summary}\n`);

  console.log('--- FLIGHTS ---');
  plan.flights.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.airline}: ${f.departure} -> ${f.arrival} (${f.price})`);
  });

  console.log('\n--- HOTEL ---');
  console.log(`  ${plan.hotel.name} (${plan.hotel.rating} stars) - ${plan.hotel.pricePerNight}`);
  console.log(`  Amenities: ${plan.hotel.amenities.join(', ')}`);

  console.log('\n--- ACTIVITIES ---');
  plan.activities.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.category}] ${a.name} (${a.costPerPerson})`);
    console.log(`     ${a.description}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`TOTAL ESTIMATED COST: ${plan.totalEstimatedCost}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
