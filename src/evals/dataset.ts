import type { TravelRequest } from '../agent.js';

export interface EvaluationCase {
  testCaseId: string;
  input: TravelRequest;
}

export const evaluationDataset: EvaluationCase[] = [
  {
    testCaseId: 'ibiza-family-moderate',
    input: {
      destination: 'Ibiza',
      numAdults: 2,
      numKids: 2,
      kidAges: [6, 7],
      budget: 'moderate',
    },
  },
  {
    testCaseId: 'ibiza-family-budget',
    input: {
      destination: 'Ibiza',
      numAdults: 2,
      numKids: 1,
      kidAges: [5],
      budget: 'budget',
    },
  },
];
