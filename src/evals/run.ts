import { travelPlannerFlow } from '../agent.js';
import { evaluationDataset } from './dataset.js';
import { planStructureEvaluator, travelQualityJudgeEvaluator } from './evaluators.js';

async function runEvaluations() {
  console.log('==================================================');
  console.log('GENKIT AGENT EVALUATIONS: FAMILY TRAVEL PLANNER');
  console.log('==================================================\n');

  const evalRunId = `run-${Date.now()}`;
  const datapoints = [];

  for (const { testCaseId, input } of evaluationDataset) {
    console.log(`Generating plan for [${testCaseId}] (${input.destination}, budget: ${input.budget})...`);
    const plan = await travelPlannerFlow(input);
    datapoints.push({
      testCaseId,
      input,
      output: plan,
    });
  }

  console.log('\n--- EVALUATION 1: STRUCTURE CHECKS (DETERMINISTIC) ---');
  const structureResults = await planStructureEvaluator({
    evalRunId,
    dataset: datapoints,
  });

  let failedStructure = 0;
  for (const res of structureResults) {
    const ev = res.evaluation as any;
    console.log(`\nCase [${res.testCaseId}]: ${ev.verdict} (${ev.details.passed})`);
    for (const c of ev.details.checks) {
      console.log(`  ${c.passed ? '✔' : '✖'} ${c.name}`);
    }
    if (ev.verdict === 'FAIL') failedStructure++;
  }

  console.log('\n--- EVALUATION 2: QUALITY & CONSTRAINTS (LLM JUDGE) ---');
  const qualityResults = await travelQualityJudgeEvaluator({
    evalRunId,
    dataset: datapoints,
  });

  for (const res of qualityResults) {
    const ev = res.evaluation as any;
    const details = ev.details;
    console.log(`\nCase [${res.testCaseId}] Score: ${Math.round(ev.score * 100)}%`);
    console.log(`  Kid Suitability: ${details.kidSuitability.score}/2 - ${details.kidSuitability.reason}`);
    console.log(`  Budget Alignment: ${details.budgetAlignment.score}/2 - ${details.budgetAlignment.reason}`);
  }

  console.log('\n' + '='.repeat(50));
  if (failedStructure > 0) {
    console.error(`EVALUATION FAILED: ${failedStructure} case(s) failed structural requirements.`);
    process.exit(1);
  } else {
    console.log('ALL EVALUATION CHECKS COMPLETED SUCCESSFULLY! ✔');
  }
}

runEvaluations().catch((err) => {
  console.error('Fatal evaluation error:', err);
  process.exit(1);
});
