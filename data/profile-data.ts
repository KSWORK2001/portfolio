const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const asset = (path: string) => `${basePath}${path}`;

export const profile = {
  name: "Karan Shrivastava",
  role: "Senior Software Engineer, AI Integration",
  location: "Atlanta, GA",
  headshot: asset("/images/karan-headshot.jpg"),
  /* A face-only crop of the same photo. The full frame is 1080x1350 and
     renders the head about nine pixels tall inside a 27px mark, so the
     bar and the footer get their own asset rather than a scaled portrait. */
  avatar: asset("/images/karan-avatar.jpg"),
  resume: asset("/Karan_Shrivastava_resume.pdf"),
  email: "work.karan2001@gmail.com",
  phone: "(770) 710-5235",
  linkedin: "https://www.linkedin.com/in/kswork",
  github: "https://github.com/KSWORK2001",
  website: "https://kswork2001.github.io",

  /* The three things that are true right now, in the order someone
     reading this actually cares about them. */
  now: [
    {
      key: "Shipping",
      text: "Agent integration at The Home Depot — Go services on Google ADK and Vertex AI, and the control plane governing GPU and inference quota across 10+ GCP projects."
    },
    {
      key: "Rolling out",
      text: "Claude across 50+ teams at two Fortune 100 companies, benchmarked against internal evals alongside Anthropic's own engineers."
    },
    {
      key: "Building",
      text: "Echo, a 10 MB desktop assistant that runs on your machine. Free, no account, sub-100 ms cold start."
    }
  ],

  /* The four that carry the most weight, in full. */
  experiences: [
    {
      role: "Senior Software Engineer, AI Integration",
      company: "The Home Depot",
      note: "Contract",
      place: "Atlanta, GA",
      period: "Apr 2026 — Present",
      detail:
        "Agent platform work: getting Claude into the hands of 50+ teams, and building the Go services and control plane that keep model access governed once they have it.",
      art: "quota",
      bullets: [
        "Drove organization-wide adoption of Claude, owning rollout strategy and implementation across 50+ teams, and partnering directly with Anthropic engineers to benchmark agent capabilities against internal evals.",
        "Built Go services in Vantage, the internal API management platform, integrating Google ADK and Vertex AI model endpoints; extended Galaxy, the control plane governing GPU and inference quota across 10+ GCP projects.",
        "Architected an autonomous Scrum Master in Go on Google ADK and Vertex AI, reached over MCP, on a CUDA-accelerated Whisper transcription and Transformer extraction stack — 99% accuracy drafting stories.",
        "Automated an integration test suite in Go for Claude connectors across Slack and Microsoft Teams, wired into CI/CD with embedding-based semantic assertions that catch auth, tool-call, and permission regressions before release."
      ]
    },
    {
      role: "Software Development Intern",
      company: "Capital One",
      place: "McLean, VA",
      period: "Jan 2026 — May 2026",
      detail:
        "Built an agent that does the job end to end: it takes an approved Jira story and opens the pull request. Thirty of them merged without a human writing a line.",
      art: "pr",
      bullets: [
        "Built an autonomous SWE agent that pulls approved Jira stories and implements them end to end via Claude Code on Kubernetes, shipping 30+ merged PRs with no human authoring.",
        "Drove org-wide Claude adoption across 50+ teams, owning rollout strategy while partnering with Anthropic engineers to put pre-GA agent capabilities into production.",
        "Accelerated delivery velocity 20% across 40+ teams and saved $100K annually by clearing blockers and connecting stakeholders in near real time through always-on agent coverage."
      ]
    },
    {
      role: "Software Engineer, Agentic AI",
      company: "AT&T",
      note: "6-month contract",
      place: "Alpharetta, GA",
      period: "Oct 2025 — Mar 2026",
      detail:
        "The first enterprise-scale multi-agent orchestration framework at AT&T, running against a customer base of 100M+ — and the evaluation harness that made anyone willing to trust it.",
      art: "gate",
      bullets: [
        "Cut end-to-end customer support request processing time by 20× for 100M+ customers, architecting the orchestration framework in LangGraph, Python, and Node.",
        "Reduced agent deployment time by 95% by integrating agentic systems with mainframe infrastructure and enterprise APIs, backed by a semantic knowledge graph and vector store.",
        "Raised agent execution reliability 65% with a self-correcting reasoning engine that detects and repairs its own failure states in pipelines serving 100M+ users.",
        "Cut Human Gate interventions by 95% — from the mid-400s to under 20 — with automated evaluation pipelines in pytest using an LLM as judge against golden workflow datasets."
      ]
    },
    {
      role: "Software Engineer, Applied AI",
      company: "Southern Company",
      place: "Atlanta, GA",
      period: "Aug 2025 — Oct 2025",
      detail:
        "Turning research prototypes into things the grid actually runs on, and building the deployment path that let other teams do the same.",
      bullets: [
        "Converted 40% of experimental AI prototypes into production MVPs with end-to-end systems in CUDA, Transformers, PyTorch, and ONNX, adopted across 20+ internal dev teams.",
        "Built and deployed an AI speech synthesizer wired into Southern Company's alert infrastructure, cutting announcement dispatch latency 50× for 9M+ customers across the Southeast power grid.",
        "Took agent deployment from weeks to days with a full-stack solution — Python backend, Next.js frontend, CI/CD on GitHub, infrastructure on AWS SageMaker and Amazon Bedrock.",
        "Architected end-to-end CI/CD release pipelines in Azure DevOps for 10+ projects across 20+ dev teams."
      ]
    }
  ],

  /* Everything before that, kept to one line each. */
  earlier: [
    {
      role: "Software Engineer Intern, AI",
      company: "Elevance Health",
      period: "May 2025 — Aug 2025",
      text: "Replaced Python inference bottlenecks with high-performance C++ services — 28% more throughput, 32% lower latency, 18% less memory, in production for 1,200+ engineers."
    },
    {
      role: "Software Engineer, AI Implementation",
      company: "Southern Company",
      period: "Jan 2025 — May 2025",
      text: "LLM-backed NLP pipelines for document analysis across 20+ dev teams, cutting manual review 80%, plus an internal agentic dev environment with modular retrieval, reasoning, and validation nodes."
    },
    {
      role: "AI Research Intern",
      company: "Nexcen Global",
      period: "Aug 2023 — Dec 2023",
      text: "Low-level C++ framework work — 35% faster startup, 30% fewer crashes, 20+ concurrency and lifetime defects eliminated, chased down with gdb, ASan/TSan, and valgrind."
    }
  ],

  projects: [
    {
      title: "Echo",
      year: "2026",
      stack: "Tauri · Rust · React · SQLite · Whisper",
      summary:
        "A desktop AI assistant that floats over whatever you already have open — drafting replies mid-call, holding a task list in the corner, and driving the mouse and keyboard through routines. The overlay is invisible to screen capture, so sharing your screen does not share Echo. Speech runs on-device; replies go through your own provider account, with nothing metered in between.",
      metrics: [
        "10 MB installed",
        "sub-100 ms cold start",
        "50% less RAM than Electron",
        "8+ LLM providers",
        "300+ downloads"
      ],
      art: "echo",
      href: "https://github.com/KSWORK2001/Echo-releases/releases/latest",
      hrefLabel: "Releases"
    },
    {
      title: "Alpaca",
      year: "2026",
      stack: "Python · FastAPI · MLX · vanilla JS",
      summary:
        "A local model runtime for Apple Silicon — sort of like Ollama, but better. One gateway supervises the MLX server and speaks both API dialects at once (OpenAI /v1 and Ollama-native), with a chat UI, DuckDuckGo-grounded answers, one-click model switching, and a CLI designed so an AI agent can drive the whole thing from a shell. A playground mode repacks MoE experts onto SSD via mmap so models bigger than RAM still run — slowly, and it says so.",
      metrics: [
        "OpenAI + Ollama APIs at once",
        "agent-first CLI, JSON everywhere",
        "SSD offload for >RAM models",
        "35 tok/s warm off a disk-backed MoE"
      ],
      art: "alpaca",
      href: "https://kswork2001.github.io/alpaca-releases/",
      hrefLabel: "Website"
    },
    {
      title: "Cellar",
      year: "2026",
      stack: "Rust · Tauri · React · Wine",
      summary:
        "A Wine bottle manager for macOS in the spirit of CrossOver, written from scratch. The engine layer (Wine, DXVK, MoltenVK) is adopted as-is from its official distributors and wired: whole disc sets mount at once with true volume labels, games arrive by zip or plain folder, a UTM bridge runs the installers Wine can't, and saves can live on macOS storage while the game keeps writing to C:. Every installed copy updates itself from a signed feed. The site publishes an honest progress map against CrossOver 25 — 58% weighted, item by item.",
      metrics: [
        "signed in-place self-updates",
        "Windows VM bridge via UTM",
        "disc sets on D:, E:, F: at once",
        "58% of CrossOver, in the open"
      ],
      art: "cellar",
      href: "https://kswork2001.github.io/Cellar-releases/",
      hrefLabel: "Website"
    },
    {
      title: "Avenue",
      year: "2026",
      stack: "TypeScript · Next.js 15 · Expo · shared domain core",
      summary:
        "A cross-platform ride-hailing app — iOS, Android, and web — with one shared domain core and a built-in city simulation, so every feature works end to end with no backend at all. Fares and surge are computed deterministically from the same core on every platform; rider and driver are two perspectives on one live simulation; GPS, multi-stop trips, promos, and a wallet all run off the engine.",
      metrics: [
        "3 platforms, 1 domain core",
        "zero backend — simulated city",
        "deterministic fares + surge",
        "rider and driver modes"
      ],
      art: "avenue",
      href: "https://kswork2001.github.io/avenue-releases/",
      hrefLabel: "Website"
    },
    {
      title: "Echo HQ",
      year: "2026",
      stack: "TypeScript · LLM personas · markdown record",
      summary:
        "An AI council with a paper trail. A bench of personas — creative, critic, engineer, product, marketer, finance — debates startup ideas live in a dashboard: ask, watch the arguments, convene for a verdict, bury what dies. The entire history is plain markdown and JSON, so the council's record is readable, diffable, and version-controlled long after the ideas are dead.",
      metrics: [
        "7 seats, real stances",
        "verdicts, not vibes",
        "graveyard with honor",
        "everything in markdown"
      ],
      art: "council",
      href: "https://kswork2001.github.io/council-releases/",
      hrefLabel: "Website"
    },
    {
      title: "Optimize",
      year: "2026",
      stack: "Python · Windows · benchmarking",
      summary:
        "A hardware-aware PC game optimization engine. It profiles the machine, benchmarks the game, searches for better supported settings, applies only reversible changes, and benchmarks again — closing the gap between console consistency and PC variability by automating the tuning players do by hand. The rule the whole tool is built around: measure before changing anything, and never promise a magic FPS number.",
      metrics: [
        "profile → bench → apply → verify",
        "supported changes only",
        "reversible by default",
        "no promised FPS gains"
      ],
      art: "optimize",
      href: "https://github.com/KSWORK2001/Optimize",
      hrefLabel: "Source"
    },
    {
      title: "TokenLess",
      year: "2024",
      stack: "Node · TypeScript · CLI",
      summary:
        "An npm CLI that sits between an agent and its tools, compressing command output through a model before it reaches the context window — while keeping failures verbatim, because a truncated stack trace is worse than no stack trace. It has since been adopted as a global instruction standard for Claude Code, Codex, OpenCode, and GitHub Copilot CLI. Second place at HackGT 2024.",
      metrics: [
        "up to 80% fewer tokens",
        "10+ provider backends",
        "pipefail-safe",
        "HackGT 2024 — 2nd"
      ],
      art: "tokenless",
      href: "https://github.com/KSWORK2001",
      hrefLabel: "Source"
    }
  ],

  stack: [
    {
      key: "Models",
      text: "**Claude for anything agentic** — tool use, parallel calls, extended thinking, prompt caching. Vertex AI and Google ADK where the data already lives in GCP, and llama.cpp or Ollama when it has to stay on the machine."
    },
    {
      key: "Orchestration",
      text: "**LangGraph and LangChain** for the graph, **MCP** for reaching tools, Pydantic for the contracts between nodes. The graph is deterministic; only the nodes are not."
    },
    {
      key: "Languages",
      text: "**Python, Go, C++, TypeScript.** Go for services that have to sit in the request path, C++ when the latency budget makes it worth the trouble, Rust for anything that ships as a binary."
    },
    {
      key: "Serving",
      text: "**FastAPI, Node, ONNX Runtime, CUDA.** Quantization, pruning, and tensor parallelism on NVIDIA hardware when the GPU bill is the product."
    },
    {
      key: "Data",
      text: "**Postgres with pgvector**, BigQuery, SQLite, and semantic knowledge graphs where a plain vector store stops being enough."
    },
    {
      key: "Ship",
      text: "**Docker, Kubernetes, GitHub Actions, Azure DevOps**, AWS SageMaker and Bedrock, GCP. CI that runs the eval suite, not only the unit tests."
    },
    {
      key: "Spoken",
      text: "**English and Hindi** natively, Punjabi and Spanish professionally, French badly but improving."
    }
  ],

  education: [
    {
      school: "Georgia Institute of Technology",
      degree: "MS Computer Science",
      note: "GPA 3.50",
      period: "Dec 2026"
    },
    {
      school: "Georgia State University",
      degree: "BS Computer Science",
      note: "GPA 3.76 · Magna Cum Laude",
      period: "Dec 2024"
    }
  ],

  faq: [
    {
      q: "Are you authorized to work in the US?",
      a: "Yes — US citizen. No sponsorship needed, now or later."
    },
    {
      q: "Would you relocate?",
      a: "Yes, open to it. Just not to Arkansas."
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
