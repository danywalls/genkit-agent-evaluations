# Family Travel Planner — Genkit Agent Evaluations

Companion repository for the tutorial: **Agent Evals with Genkit: Breaking the Black Box**.

An AI agent that plans family vacations using [Genkit](https://genkit.dev/) and runs automated evaluations (deterministic rules and LLM judge with rubrics).

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure your Google AI Studio API key
cp .env.example .env

# 3. Run the travel planner demo
npm start

# 4. Run automated evaluations
npm run evals

# 5. Start the Genkit Developer UI
npm run dev
```

Open `http://localhost:4000` to inspect traces, flows, and evaluators in the Genkit Developer UI.

## Structure

```text
├── src/
│   ├── genkit.ts            # Genkit instance and Gemini configuration
│   ├── agent.ts             # travelPlannerFlow and tools
│   ├── index.ts             # Terminal demo runner
│   ├── tools/
│   │   ├── flights.ts       # Flights search tool
│   │   ├── hotels.ts        # Hotel search tool
│   │   └── activities.ts    # Kid-friendly activities search tool
│   └── evals/
│       ├── dataset.ts       # Test cases (Ibiza family scenarios)
│       ├── evaluators.ts    # ai.defineEvaluator (planStructure & travelQualityJudge)
│       └── run.ts           # Evaluation test runner
└── README.md
```

## Evaluators

1. **`planStructure` (Deterministic):**
   Verifies that flights, hotel, activities, and total estimated cost exist and match the requested destination.

2. **`travelQualityJudge` (LLM Judge):**
   Uses Gemini with a 0 to 2 rubric to evaluate:
   - **Kid Suitability (0-2):** verifies that activities are safe and appropriate for young children.
   - **Budget Alignment (0-2):** evaluates whether prices and choices align with the requested budget preference.

## License

MIT
