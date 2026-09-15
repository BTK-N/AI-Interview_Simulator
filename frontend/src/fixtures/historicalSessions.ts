import type { SessionReport } from '../types';

export const DEFAULT_HISTORICAL_SESSIONS: SessionReport[] = [
  {
    session_id: 'sess-sim-exec-782',
    role_id: 'software_engineer',
    role_title: 'Principal Distributed Systems Architect',
    created_at: 'Sep 15, 2026',
    total_questions: 3,
    overall_score: 89.2,
    content_score: 93.5,
    clarity_score: 86.0,
    confidence_score: 88.5,
    top_strengths: [
      'Articulated concrete architectural primitives (idempotency keys, atomic Redis leases) before discussing failure topologies.',
      'Clear delineation of transient fault tolerances versus poison pill dead-letter queuing.',
      'Maintained continuous eye gaze within the optical reticle zone throughout complex architectural explanations.'
    ],
    top_weaknesses: [
      'Recorded 5 hesitation markers ("um", "basically") during transitions between storage and concurrency layers.',
      'Spoken tempo accelerated to 152 WPM when explaining GC pause heuristics, slightly impacting cadence clarity.'
    ],
    actionable_recommendations: [
      'Replace vocalized pauses with silent, deliberate breath pauses to enhance executive authority.',
      'Lead with high-level system boundaries and SLA invariants before descending into concurrency primitives.'
    ],
    per_question_results: [
      {
        question_id: 'q-1',
        question_text: 'Describe how you architect an event-driven microservices pipeline with idempotent consumers and dead-letter queues.',
        transcript: 'In an event-driven architecture, we ensure idempotency by generating a deterministic UUID per event payload. Consumers write this idempotency key to Redis with an atomic lease before executing domain logic. For failure handling, unrecoverable errors trigger exponential retry and dead-letter queues.',
        relevance_score: 94,
        completeness_score: 92,
        structure_score: 93,
        content_score: 93,
        words_count: 52,
        wpm: 134,
        filler_words: { um: 1, basically: 2, uh: 1, like: 1 },
        filler_total: 5,
        clarity_score: 86,
        confidence_score: 92,
        overall_question_score: 91,
        feedback: 'Decisive technical rationale. Seamlessly connected system primitives to fault tolerance boundaries with minimal preamble.',
        improvement_tips: [
          'State high-level architectural invariants before descending into concurrency specifics.',
          'Eliminate conversational intensifiers like "basically" to project definitive command.'
        ],
        model_answer: 'An event-driven architecture leverages unique message identifiers as idempotency keys, durable partitioned brokers, dead-letter exchanges for unrecoverable errors, and outbox patterns to guarantee consistency.'
      },
      {
        question_id: 'q-2',
        question_text: 'How do you diagnose and resolve an intermittent memory leak in a high-throughput backend service under production load?',
        transcript: 'I systematically capture heap snapshots during baseline and peak usage, inspect retained object graphs, examine event emitter bindings, and monitor GC pause times via Prometheus metrics.',
        relevance_score: 92,
        completeness_score: 89,
        structure_score: 91,
        content_score: 91,
        words_count: 32,
        wpm: 138,
        filler_words: {},
        filler_total: 0,
        clarity_score: 90,
        confidence_score: 87,
        overall_question_score: 90,
        feedback: 'Systematic triage methodology. Addressed profiling tools, GC runtime telemetry, and retained object hierarchies cleanly.',
        improvement_tips: [
          'Discuss memory headroom and automated circuit breakers to protect upstream shards during diagnosis.'
        ],
        model_answer: 'I systematically capture heap snapshots during baseline and peak usage, inspect retained object graphs, examine event emitter bindings, and monitor GC pause times via Prometheus metrics.'
      },
      {
        question_id: 'q-3',
        question_text: 'Describe a situation where you had to push back on an executive deadline due to architectural technical debt.',
        transcript: 'I framed the risk in terms of customer SLA violations and MTTR impact, presented a phased delivery compromise, and secured buy-in for refactoring foundational storage bottlenecks.',
        relevance_score: 88,
        completeness_score: 85,
        structure_score: 87,
        content_score: 87,
        words_count: 31,
        wpm: 129,
        filler_words: { like: 1 },
        filler_total: 1,
        clarity_score: 84,
        confidence_score: 86,
        overall_question_score: 86,
        feedback: 'Constructive stakeholder negotiation grounded in operational metrics rather than subjective engineering purity.',
        improvement_tips: [
          'Quantify the dollar or latency impact when negotiating engineering trade-offs with business leaders.'
        ],
        model_answer: 'I framed the risk in terms of customer SLA violations and MTTR impact, presented a phased delivery compromise, and secured buy-in for refactoring foundational storage bottlenecks.'
      }
    ]
  },
  {
    session_id: 'sess-sim-ml-641',
    role_id: 'data_scientist',
    role_title: 'Lead Machine Learning Systems Engineer',
    created_at: 'Sep 12, 2026',
    total_questions: 3,
    overall_score: 82.4,
    content_score: 85.0,
    clarity_score: 79.5,
    confidence_score: 82.0,
    top_strengths: [
      'Crisp formulation of feature store online/offline skew mitigation strategies.',
      'Strong operational emphasis on p99 inference latency budgets with TensorRT.'
    ],
    top_weaknesses: [
      'Hesitated on fallback strategies for out-of-vocabulary embeddings during streaming inference.',
      'Recorded 7 filler words in question 2.'
    ],
    actionable_recommendations: [
      'Structure pipeline answers with input-throughput-latency milestones.',
      'Maintain steady gaze when answering mathematical optimization trade-offs.'
    ],
    per_question_results: [
      {
        question_id: 'q-ml-1',
        question_text: 'How do you detect and mitigate training-serving feature drift in real-time scoring systems?',
        transcript: 'We deploy statistical Kolmogorov-Smirnov checks and Population Stability Index monitors across incoming streaming batches in Apache Kafka against historical training baselines.',
        relevance_score: 86,
        completeness_score: 84,
        structure_score: 85,
        content_score: 85,
        words_count: 38,
        wpm: 130,
        filler_words: { um: 2 },
        filler_total: 2,
        clarity_score: 82,
        confidence_score: 85,
        overall_question_score: 84,
        feedback: 'Precise drift detection algorithms identified. Solid grasp of streaming statistical distributions.',
        improvement_tips: ['Include shadow deployment strategies for updated weights.'],
        model_answer: 'Monitor distribution divergences with PSI/Wasserstein metrics, alert on threshold breaches, and auto-trigger retraining DAGs.'
      },
      {
        question_id: 'q-ml-2',
        question_text: 'Describe your approach to optimizing deep learning models for sub-10ms edge inference.',
        transcript: 'I utilize INT8 post-training quantization, graph layer fusion with ONNX Runtime, and prune redundant attention heads while monitoring perplexity degradation.',
        relevance_score: 82,
        completeness_score: 81,
        structure_score: 80,
        content_score: 81,
        words_count: 42,
        wpm: 145,
        filler_words: { like: 4, uh: 3 },
        filler_total: 7,
        clarity_score: 77,
        confidence_score: 80,
        overall_question_score: 80,
        feedback: 'Good coverage of compression techniques, though delivery suffered from rapid speech and fillers.',
        improvement_tips: ['Slow down pace when detailing quantization scales.'],
        model_answer: 'Combine FP16/INT8 mixed precision, kernel fusion via TensorRT, and dynamic batching within bounded hardware caches.'
      },
      {
        question_id: 'q-ml-3',
        question_text: 'How do you resolve conflicting priorities between model accuracy and system latency with product leadership?',
        transcript: 'I establish an empirical Pareto frontier mapping accuracy tradeoffs against cost and latency, letting stakeholders choose optimal operating points.',
        relevance_score: 85,
        completeness_score: 84,
        structure_score: 84,
        content_score: 84,
        words_count: 34,
        wpm: 132,
        filler_words: { basically: 1 },
        filler_total: 1,
        clarity_score: 82,
        confidence_score: 84,
        overall_question_score: 83,
        feedback: 'Pragmatic, data-driven alignment mechanism that respects executive business constraints.',
        improvement_tips: ['Cite SLA breach penalties as boundary conditions.'],
        model_answer: 'Map accuracy-latency Pareto curves, define minimum acceptable accuracy thresholds, and establish SLA guardrails.'
      }
    ]
  },
  {
    session_id: 'sess-sim-pm-519',
    role_id: 'product_manager',
    role_title: 'Principal Technical Product Director',
    created_at: 'Sep 08, 2026',
    total_questions: 3,
    overall_score: 78.0,
    content_score: 76.0,
    clarity_score: 81.0,
    confidence_score: 77.0,
    top_strengths: [
      'Commanding executive presentation style and structured communication framework.',
      'Customer-centric metric definition (North Star metric alignment).'
    ],
    top_weaknesses: [
      'Under-specified the technical constraints in distributed data ingestion.',
      'Pacing was slightly rigid with prolonged pauses.'
    ],
    actionable_recommendations: [
      'Bridge product requirements into engineering operational levers.',
      'Deepen understanding of API contract versioning nuances.'
    ],
    per_question_results: [
      {
        question_id: 'q-pm-1',
        question_text: 'How do you prioritize platform capabilities when engineering asks for technical debt refactoring and sales demands custom features?',
        transcript: 'I implement the RICE prioritization matrix weighted with revenue impact and system reliability risk, allocating a strict 25% sprint capacity band for debt mitigation.',
        relevance_score: 76,
        completeness_score: 75,
        structure_score: 78,
        content_score: 76,
        words_count: 39,
        wpm: 125,
        filler_words: { um: 2 },
        filler_total: 2,
        clarity_score: 80,
        confidence_score: 76,
        overall_question_score: 74,
        feedback: 'Clear governance framework. Good balance of offensive feature velocity and defensive stability.',
        improvement_tips: ['Provide concrete examples of debt that directly caused churn.'],
        model_answer: 'Establish dedicated capacity allocation (e.g., 70/20/10 rule), quantify cost of inaction for debt, and tie features to validated user pain.'
      },
      {
        question_id: 'q-pm-2',
        question_text: 'Walk me through how you deprecate a legacy API relied upon by hundreds of enterprise customers.',
        transcript: 'We announce an 18-month sunset schedule with automated SDK migration linters, telemetry on traffic deprecation, and high-touch support for top tier accounts.',
        relevance_score: 84,
        completeness_score: 82,
        structure_score: 83,
        content_score: 83,
        words_count: 40,
        wpm: 130,
        filler_words: {},
        filler_total: 0,
        clarity_score: 84,
        confidence_score: 80,
        overall_question_score: 82,
        feedback: 'Exemplary enterprise empathy and phased deprecation methodology.',
        improvement_tips: ['Mention brownout testing to flush out dormant integrations.'],
        model_answer: 'Publish explicit sunset timeline, run brownout error injections, provide telemetry dashboards to clients, and offer migration tooling.'
      },
      {
        question_id: 'q-pm-3',
        question_text: 'How do you define success metrics for an AI developer platform product?',
        transcript: 'Primary metric is Time-to-First-Inference under 5 minutes, secondary metrics are 30-day developer retention and token consumption expansion rate.',
        relevance_score: 78,
        completeness_score: 77,
        structure_score: 78,
        content_score: 77,
        words_count: 31,
        wpm: 128,
        filler_words: { like: 1 },
        filler_total: 1,
        clarity_score: 80,
        confidence_score: 78,
        overall_question_score: 78,
        feedback: 'Actionable developer activation metric. Clear connection between developer love and revenue expansion.',
        improvement_tips: ['Connect developer satisfaction (NPS/CSAT) with enterprise account renewals.'],
        model_answer: 'Time to Hello World, daily active API callers, compute utilization per seat, and pipeline conversion rate.'
      }
    ]
  },
  {
    session_id: 'sess-sim-se-402',
    role_id: 'software_engineer',
    role_title: 'Senior Backend Reliability Engineer',
    created_at: 'Aug 29, 2026',
    total_questions: 3,
    overall_score: 68.5,
    content_score: 65.0,
    clarity_score: 72.0,
    confidence_score: 68.0,
    top_strengths: [
      'Familiarity with standard Unix socket debugging and network packet analysis.',
      'Honest acknowledgment of operational boundaries and alerting thresholds.'
    ],
    top_weaknesses: [
      'Struggled to articulate distributed consensus algorithms (Raft leader election details).',
      'Frequent vocal hesitations and fragmented phrasing in high-stress behavioral scenarios.'
    ],
    actionable_recommendations: [
      'Study consensus state machines and quorum write invariants in detail.',
      'Structure answers using STAR framework to avoid rambling on incident timelines.'
    ],
    per_question_results: [
      {
        question_id: 'q-se-1',
        question_text: 'Explain how distributed locking is achieved across a multi-region database cluster.',
        transcript: 'Um, you use consensus like Raft or Paxos... or maybe Redis Redlock, though Redlock has some timing issues with clock drift, so Spanner TrueTime is better.',
        relevance_score: 64,
        completeness_score: 60,
        structure_score: 62,
        content_score: 62,
        words_count: 36,
        wpm: 120,
        filler_words: { um: 3, like: 2 },
        filler_total: 5,
        clarity_score: 68,
        confidence_score: 62,
        overall_question_score: 62,
        feedback: 'Named relevant technologies but lacked deep structural explanation of fencing tokens or lease timeouts.',
        improvement_tips: ['Focus on fencing tokens to prevent split-brain execution under clock drift.'],
        model_answer: 'Distributed locks require consensus-backed leases, monotonic fencing tokens verified at storage layers, and bounded clock skews.'
      },
      {
        question_id: 'q-se-2',
        question_text: 'How do you optimize a PostgreSQL table with 500 million rows experiencing degraded query performance?',
        transcript: 'We analyze query execution plans with EXPLAIN ANALYZE, add partial B-tree or BRIN indexes for timestamp ranges, and implement declarative table partitioning.',
        relevance_score: 73,
        completeness_score: 70,
        structure_score: 72,
        content_score: 71,
        words_count: 38,
        wpm: 135,
        filler_words: { uh: 1 },
        filler_total: 1,
        clarity_score: 74,
        confidence_score: 70,
        overall_question_score: 71,
        feedback: 'Solid practical recommendations. Mentioning BRIN indexes was appropriate for time-series append-only data.',
        improvement_tips: ['Discuss vacuum strategies and autovacuum tuning for high-churn tables.'],
        model_answer: 'Partition by date range, introduce BRIN indexes, tune autovacuum cost limits, and separate read replicas.'
      },
      {
        question_id: 'q-se-3',
        question_text: 'Tell me about a major production incident you caused and how you handled the post-mortem.',
        transcript: 'I accidentally applied a database migration without CONCURRENTLY which locked our billing table for 8 minutes. I initiated rollback, notified status page, and wrote a blameless post-mortem.',
        relevance_score: 74,
        completeness_score: 71,
        structure_score: 73,
        content_score: 72,
        words_count: 42,
        wpm: 136,
        filler_words: { like: 2 },
        filler_total: 2,
        clarity_score: 75,
        confidence_score: 71,
        overall_question_score: 72,
        feedback: 'Transparent, accountable, and focused on systemic prevention via linter rules.',
        improvement_tips: ['Emphasize CI automated migration linters to systematically prevent non-concurrent locks.'],
        model_answer: 'Took ownership, isolated impact, conducted blameless post-mortem, and implemented static migration analysis in CI.'
      }
    ]
  }
];
