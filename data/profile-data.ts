const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const asset = (path: string) => `${basePath}${path}`;

export const profile = {
  name: "Karan Shrivastava",
  role: "Senior Applied AI Engineer",
  location: "Atlanta, GA",
  headshot: asset("/images/karan-headshot.jpg"),
  resume: asset("/Karan_Shrivastava_resume.pdf"),
  email: "work.karan2001@gmail.com",
  linkedin: "https://www.linkedin.com/in/kswork",
  github: "https://github.com/KSWORK2001",
  website: "https://kswork2001.github.io",

  /* The three things that are true right now, in the order someone
     reading this actually cares about them. */
  now: [
    {
      key: "Shipping",
      text: "Production agent systems at The Home Depot, on Claude and Vertex AI, for workflows that run at retail scale."
    },
    {
      key: "Studying",
      text: "MS Computer Science at Georgia Tech — alongside the job rather than instead of it."
    },
    {
      key: "Building",
      text: "Echo, a desktop assistant that runs on your own machine. Free, about 10 MB, no account."
    }
  ],

  experiences: [
    {
      role: "Senior Applied AI Engineer",
      company: "The Home Depot",
      period: "Apr 2026 — Present",
      detail:
        "Production agentic systems for retail and associate-facing workflows, built on Claude and Google Vertex AI with tool use, retrieval, and human-in-the-loop guardrails.",
      bullets: [
        "Architect multi-step Claude agents — tool use, parallel tool calls, extended thinking, prompt caching — for high-volume operational and merchandising workflows.",
        "Deploy and tune Vertex AI Gemini, embeddings, and Agent Builder pipelines, wiring Vector Search and BigQuery in as the grounding layer.",
        "Own the evaluation harnesses, safety policies, and observability: latency budgets, hallucination guards, and offline regression suites.",
        "Take prototypes from POC to enterprise rollout with platform, data, and security teams."
      ]
    },
    {
      role: "Generative AI Architect",
      company: "AT&T",
      period: "Oct 2025 — Mar 2026",
      detail:
        "Built the agentic orchestration system behind customer support workflows — retrieval, validation, and remediation layers that removed up to 90% of manual hand-offs.",
      bullets: [
        "Designed deterministic, tool-driven agents in LangChain and LangGraph, where the graph is fixed and only the nodes are probabilistic.",
        "Added the validation layer that cut runtime parameter failures by roughly 65%.",
        "Shipped human-gate approvals for irreversible actions, then tightened what actually needed a person."
      ]
    },
    {
      role: "AI Integration Engineer",
      company: "Southern Company",
      period: "Aug 2025 — Dec 2025",
      detail:
        "Databricks ML workflows on Spark ML and Delta Lake for energy forecasting and IoT workloads, cutting preprocessing time by 40%.",
      bullets: [
        "Built low-latency .NET Core APIs to serve production inference.",
        "Integrated model output into enterprise systems under reliability-first deployment standards.",
        "Prototyped Swift iOS interfaces surfacing real-time monitoring for energy teams."
      ]
    },
    {
      role: "Machine Learning Engineer",
      company: "Cognizant",
      period: "Jun 2025 — Aug 2025",
      detail:
        "Optimized LLM inference across A100, V100, and T4 GPUs using ONNX conversion and precision tuning, cutting latency by 32%.",
      bullets: [
        "Benchmarked throughput across NVIDIA generations to find where the money actually went.",
        "Applied quantization and pruning for a smaller memory footprint at stable latency.",
        "Contributed runtime optimizations in C++ and ONNX Runtime."
      ]
    },
    {
      role: "Data Science Intern",
      company: "Elevance Health",
      period: "May 2025 — Aug 2025",
      detail:
        "Automated enrollment flag resolution and containerized NLP extraction from 50-page PDFs, taking processing from hours to seconds.",
      bullets: [
        "Designed rule-based anomaly checks across policy, provider, and coverage fields.",
        "Built PDF-to-structured-data pipelines in pandas with extraction logging that made failures debuggable.",
        "Containerized the workflow in Docker so operations could run it without me."
      ]
    },
    {
      role: "Software Engineer Intern",
      company: "Nexcen Global",
      period: "Aug 2023 — Dec 2023",
      detail:
        "Low-level C++ framework work: startup speed and runtime reliability for tooling used across internal engineering teams.",
      bullets: [
        "Cut binary startup time by 35% and crash frequency by 30% by reworking memory allocation and fixing 20+ concurrency and lifetime defects.",
        "Chased memory safety bugs with gdb, ASan/TSan, valgrind, and Linux core dumps.",
        "Refactored CMake configs and put sanitizer passes in CI for faster feedback."
      ]
    }
  ],

  projects: [
    {
      title: "Echo",
      year: "2026",
      stack: "Tauri · Rust · React · SQLite · Whisper",
      summary:
        "A desktop AI assistant that floats over whatever you already have open — drafting replies mid-call, holding a task list in the corner, and driving the mouse and keyboard through routines. Speech runs on-device; replies go through your own provider account. Nothing is metered in between.",
      metrics: ["~10 MB installed", "sub-100 ms cold start", "8+ LLM providers", "300+ downloads"],
      art: "echo",
      href: "https://github.com/KSWORK2001/Echo-releases/releases/latest",
      hrefLabel: "Releases"
    },
    {
      title: "TokenLess",
      year: "2024",
      stack: "Node · TypeScript · CLI",
      summary:
        "An npm CLI that sits between an agent and its tools, compressing command output through a model before it reaches the context window — while keeping failures verbatim, because a truncated stack trace is worse than no stack trace. Second place at HackGT 2024.",
      metrics: ["up to 80% fewer tokens", "10+ provider backends", "HackGT 2024 — 2nd"],
      art: "tokenless",
      href: "https://github.com/KSWORK2001",
      hrefLabel: "Source"
    }
  ],

  /* Smaller things, kept short on purpose. */
  alsoBuilt: [
    {
      title: "Agentic Workflow Orchestration",
      stack: "LangGraph · Python · Postgres",
      summary:
        "The engine behind the section above — retrieval, triage, validation, and repair as explicit graph nodes.",
      metric: ">80% first-pass acceptance"
    },
    {
      title: "Real-time Speech Platform",
      stack: "Whisper · CUDA · XTTS",
      summary:
        "GPU-accelerated transcription and voice synthesis, tuned to FP16 and deployed to Azure app services.",
      metric: "50× lower dispatch latency"
    },
    {
      title: "SpotMe!",
      stack: "React Native · Firebase",
      summary:
        "A social fitness app that found real users — matching lifters at the same gym for a spot.",
      metric: "200+ active users"
    }
  ],

  stack: [
    {
      key: "Models",
      text: "**Claude for anything agentic** — tool use, parallel calls, extended thinking, prompt caching. Vertex AI Gemini and embeddings where the data already lives in GCP."
    },
    {
      key: "Orchestration",
      text: "**LangGraph and LangChain** for the graph, Pydantic for the contracts between nodes. The graph is deterministic; only the nodes are not."
    },
    {
      key: "Serving",
      text: "**Python and FastAPI** by default. .NET Core and C++ where the latency budget made it worth the trouble, with ONNX Runtime and precision tuning on GPU."
    },
    {
      key: "Data",
      text: "**Postgres with pgvector**, BigQuery, Snowflake, Delta Lake on Databricks. Spark when the job is genuinely big enough to deserve it."
    },
    {
      key: "Interfaces",
      text: "**Next.js and React** for the web. Tauri and Rust when it has to be a desktop app that opens instantly."
    },
    {
      key: "Ship",
      text: "**Docker, GitHub Actions, Azure DevOps**, AWS Lambda and DynamoDB. CI that runs the eval suite, not only the unit tests."
    },
    {
      key: "Spoken",
      text: "**English and Hindi** natively, Punjabi and Spanish professionally, French badly but improving."
    }
  ],

  education: [
    { school: "Georgia Institute of Technology", degree: "MS Computer Science", period: "2025 — 2026" },
    { school: "Georgia State University", degree: "BS Computer Science", period: "2023 — 2024" },
    { school: "Gwinnett Technical College", degree: "AAS Computer Programming", period: "2020 — 2022" }
  ],

  faq: [
    {
      q: "Are you authorized to work in the US?",
      a: "Yes — US citizen. No sponsorship needed, now or later."
    },
    {
      q: "Would you relocate?",
      a: "Yes. Just not to Arkansas."
    },
    {
      q: "What kind of role are you after?",
      a: "Senior software or applied AI engineering, on a team that puts agents in front of real users and has to live with the consequences."
    },
    {
      q: "Best way to reach you?",
      a: "Email. I answer."
    },
    {
      q: "Pineapple on pizza?",
      a: "No. Non-negotiable."
    },
    {
      q: "Marvel or DC?",
      a: "DC, and I will take that argument any day of the week."
    },
    {
      q: "Any easter eggs on this site?",
      a: "One, in the console. Everything you see here is DOM and CSS — no screenshots, no renders — so the inspector is a fair place to check."
    }
  ]
};
