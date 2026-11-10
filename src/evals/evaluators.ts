import { z } from 'genkit';
import { ai, modelName } from '../genkit.js';
import type { TravelPlan, TravelRequest } from '../agent.js';

export const planStructureEvaluator = ai.defineEvaluator(
  {
    name: 'planStructure',
    displayName: 'Plan Structure (Deterministic)',
    definition: 'Validates that flights, hotel, activities, and total cost exist and match the destination.',
  },
  async (datapoint) => {
    const input = datapoint.input as TravelRequest;
    const output = datapoint.output as TravelPlan;

    const checks = [
      {
        name: 'Matches destination',
        passed: output?.destination?.trim().toLowerCase() === input?.destination?.trim().toLowerCase(),
      },
      {
        name: 'Includes flight options',
        passed: Array.isArray(output?.flights) && output.flights.length > 0,
      },
      {
        name: 'Includes hotel recommendation',
        passed: Boolean(output?.hotel?.name?.trim()),
      },
      {
        name: 'Includes activities',
        passed: Array.isArray(output?.activities) && output.activities.length > 0,
      },
      {
        name: 'Includes estimated total cost',
        passed: Boolean(output?.totalEstimatedCost?.trim()),
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    const allPassed = passedCount === checks.length;

    return {
      testCaseId: datapoint.testCaseId,
      evaluation: {
        score: allPassed ? 1 : 0,
        status: allPassed ? 'PASS' : 'FAIL',
        details: {
          passed: `${passedCount}/${checks.length}`,
          checks,
        },
      },
    };
  }
);

const JudgeSchema = z.object({
  kidSuitability: z.object({
    score: z.number().int().min(0).max(2).describe('0: conflicts with child age, 1: partial fit, 2: fits well'),
    reason: z.string(),
  }),
  budgetAlignment: z.object({
    score: z.number().int().min(0).max(2).describe('0: unreasonable cost, 1: plausible, 2: aligned with budget'),
    reason: z.string(),
  }),
});

export const travelQualityJudgeEvaluator = ai.defineEvaluator(
  {
    name: 'travelQualityJudge',
    displayName: 'Travel Quality (LLM Judge)',
    definition: 'Uses an LLM judge to evaluate kid-friendliness and budget alignment using a 0-2 rubric.',
  },
  async (datapoint) => {
    const input = datapoint.input as TravelRequest;
    const output = datapoint.output as TravelPlan;

    const response = await ai.generate({
      model: modelName,
      prompt: `You are an expert travel evaluation judge. Evaluate this family vacation plan.

Input Request:
${JSON.stringify(input, null, 2)}

Generated Plan:
${JSON.stringify(output, null, 2)}

Rubric for kidSuitability (0 to 2):
- 0: Dangerous or inappropriate activities for the children's ages.
- 1: Acceptable but some activities lack kid amenities or fit.
- 2: Excellent shallow calm beaches, kid pools, and age-appropriate fun.

Rubric for budgetAlignment (0 to 2):
- 0: Obvious mismatch with the stated budget preference.
- 1: Acceptable estimate but missing cost transparency.
- 2: Thoughtful choices aligning with the stated budget preference.

Score both criteria and provide a short reason for each.`,
      output: { schema: JudgeSchema },
    });

    const result = response.output;
    if (!result) {
      throw new Error('The LLM judge did not return a structured result.');
    }

    const avgScore = (result.kidSuitability.score + result.budgetAlignment.score) / 4;

    return {
      testCaseId: datapoint.testCaseId,
      evaluation: {
        score: avgScore,
        details: result,
      },
    };
  }
);
