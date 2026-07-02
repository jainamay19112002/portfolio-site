import { useState, useEffect, useRef } from "react";
import { Github, Linkedin, Mail, Download, ChevronDown, ExternalLink, Terminal } from "lucide-react";

const ACCENTS = { coral: "#FF6B4A", cyan: "#4CDFE8", yellow: "#FFD166" };

const PROJECTS = [
  {
    id: "hypervisor",
    title: "HyperVisor-Lite",
    tagline: "A Type-2 hypervisor that learns how to schedule its own VMs",
    date: "2026",
    stack: ["C", "Python", "KVM", "PPO", "Stable-Baselines3"],
    wave: "sched",
    color: ACCENTS.coral,
    bullets: [
      "Built a Type-2 KVM-based hypervisor in C, running real guest VMs on WSL2 Ubuntu 24.04 with VT-x virtualization confirmed across all 16 cores.",
      "Replaced static VM scheduling with a PPO reinforcement-learning agent (Stable-Baselines3, CPU-only PyTorch) that learns its scheduling policy from runtime reward signals instead of a fixed heuristic.",
      "The learned scheduler beat the baseline by 138% cumulative reward and cut best-case runtime by 34.5%.",
      "Spent an evening chasing a WSL2-specific quirk where KVM reports the COM1 serial port at 0xf8 instead of the standard 0x3f8 — the kind of bug that only exists on one specific platform.",
    ],
    metric: { value: 138, suffix: "%", label: "reward improvement over baseline scheduler" },
    github: "https://github.com/jainamay19112002/Hypervisor_lite_os",
  },
  {
    id: "leaksense",
    title: "LeakSense",
    tagline: "Runtime memory analysis that predicts leaks before they kill your process",
    date: "May 2026",
    stack: ["C", "Python", "LD_PRELOAD", "PyTorch", "Linux Internals"],
    wave: "spike",
    color: ACCENTS.coral,
    bullets: [
      "Intercepts every malloc/free/realloc call of a running Linux process via LD_PRELOAD injection — zero source changes to the target.",
      "Extracts allocation-rate, free-ratio and heap-growth-slope features from a 500-event sliding window; an LSTM trained on 20+ workloads hits ~89% accuracy, <5% false positives.",
      "Flags leaks 10–30 seconds before the OOM killer arrives, at under 0.5% runtime overhead — Valgrind costs you ~20x.",
    ],
    metric: { value: 89, suffix: "%", label: "leak detection accuracy" },
    github: "https://github.com/jainamay19112002",
  },
  {
    id: "autoscale",
    title: "Predictive Auto-Scaling",
    tagline: "Teaching Kubernetes to see load spikes coming instead of reacting to them",
    date: "March 2026",
    stack: ["TensorFlow", "Kubernetes", "GCP", "Docker", "Prometheus"],
    wave: "decay",
    color: ACCENTS.cyan,
    bullets: [
      "Bidirectional LSTM + multi-head attention forecasts CPU load with 0.46% MAE, trained on 44,629 minutes of Google's Borg 2019 trace.",
      "A PPO agent learns cost-aware scaling policy in a custom Gymnasium environment — 49.4% cheaper than a reactive baseline.",
      "Shipped as a live Flask prediction API plus a controller that patches real pod deployments through the Kubernetes Python client on GKE.",
    ],
    metric: { value: 49.4, suffix: "%", label: "cost reduction vs. reactive scaling" },
    github: "https://github.com/jainamay19112002",
  },
  {
    id: "moldiffusion",
    title: "Adaptive Molecular Diffusion",
    tagline: "Letting every token in a molecule decide its own noise schedule",
    date: "Feb 2026",
    stack: ["Python", "PyTorch", "Diffusion Models", "Molecular AI"],
    wave: "sine",
    color: ACCENTS.yellow,
    bullets: [
      "Atom-in-SMILES tokenization feeding a diffusion framework for molecular sequence generation.",
      "Token-level adaptive noise scheduling — each position in the sequence gets its own forward/reverse diffusion pace instead of one global schedule.",
      "Benchmarked DDPM, DDIM and DPM-Solver samplers on the same denoising pipeline to compare quality vs. sampling speed.",
    ],
    metric: { value: 3, suffix: "", label: "sampler families compared" },
    github: "https://github.com/jainamay19112002",
  },
  {
    id: "fairness",
    title: "Auditing Hiring Algorithms",
    tagline: "Stress-testing resume screeners for bias and adversarial gaming",
    date: "Oct 2025",
    stack: ["Python", "scikit-learn", "Machine Learning"],
    wave: "steady",
    color: ACCENTS.coral,
    bullets: [
      "Built a comparison framework across Linear SVM, RBF SVM and Gaussian Naive Bayes to audit fairness in automated resume screening.",
      "Surfaced interpretable failure modes via feature-weight analysis on biased training distributions.",
      "Evaluated robustness against adversarial keyword-stuffing — the classic 'resume full of buzzwords' attack.",
    ],
    metric: { value: 3, suffix: "", label: "classifiers audited head-to-head" },
    github: "https://github.com/jainamay19112002",
  },
  {
    id: "alu",
    title: "SimpleRISC ALU",
    tagline: "A 32-bit ALU built to hit 250 MHz, one gate at a time",
    date: "Aug 2025",
    stack: ["Verilog", "Computer Architecture", "RTL"],
    wave: "square",
    color: ACCENTS.cyan,
    bullets: [
      "Synthesizable 32-bit ALU for a single-cycle SimpleRISC core — arithmetic, logical, shift, comparison and signed mul/div.",
      "Timing-optimized RTL to close a 250 MHz synthesis constraint.",
    ],
    metric: { value: 250, suffix: " MHz", label: "synthesis target met" },
    github: "https://github.com/jainamay19112002",
  },
  {
    id: "turfs",
    title: "Find Your Turfs India",
    tagline: "Booking a turf without the group-chat chaos of double bookings",
    date: "May 2024",
    stack: ["Django", "PostgreSQL", "HTML/CSS", "JavaScript"],
    wave: "steady",
    color: ACCENTS.yellow,
    bullets: [
      "Full-stack app for real-time turf availability tracking and reservations with automated conflict prevention.",
      "PostgreSQL schema designed for fast booking lookups; responsive UI for players, owners and admins alike.",
    ],
    metric: { value: 3, suffix: "", label: "user roles supported" },
    github: "https://github.com/jainamay19112002",
  },
];

const RESEARCH_LOG = [
  {
    id: "nara",
    tag: "ongoing",
    title: "Teaching LLaDA to read molecules",
    timestamp: "PRAGYA cluster · 8×A100 80GB · epoch 2/5",
    summary:
      "Fine-tuning LLaDA-8B-Instruct with NaRA (noise-adaptive rank adaptation) adapters to turn SMILES strings into plain-language molecule captions.",
    body: [
      "The dataset is IWSLT14-Mol — about 324K SMILES-to-caption pairs pulled from CheBI-20. Before any of that reaches the model, a custom regex tokenizer (following the Schwaller et al. SMILES pattern) gets bolted onto LLaDA's BPE vocabulary as a pre-tokenizer, so the model sees chemically meaningful tokens instead of character soup.",
      "The single change that mattered most: bumping the LoRA-style rank r_ab from 32 to 128. Same training steps, ~38% better BLEU-4. Everything else — batch size 1 with 32 gradient accumulation steps for an effective batch of 256, bf16 mixed precision — stayed put.",
      "One config value is load-bearing and easy to break: remasking has to stay 'random'. Switching it to 'low_confidence' quietly tanks generation quality, in a way that doesn't show up until you actually read the captions.",
      "Getting here meant ripping DeepSpeed back out — it was throwing a MissingCUDAException on the cluster's driver setup — and chasing down NCCL deadlocks that turned out to need an unconditional accelerator.wait_for_everyone() barrier syncing all 8 ranks. After epoch 1: BLEU-4 of 21.02, ROUGE-L of 57.04. Training resumed from that checkpoint and is still climbing toward the epoch-5 target.",
    ],
    metric: { value: 21.02, label: "BLEU-4 after epoch 1" },
  },
  {
    id: "diffuseq",
    tag: "completed",
    title: "Diffusion models don't like to be rushed",
    timestamp: "PRAGYA cluster · QQP · 144,715 pairs",
    summary:
      "Trained DiffuSeq, a sequence-to-sequence diffusion model, on the QQP paraphrase dataset — and learned the hard way how many diffusion steps you actually need.",
    body: [
      "QQP gives you 144,715 training pairs of questions that mean the same thing phrased differently — a good stress test for a model that has to denoise its way to a coherent sentence rather than generate token-by-token.",
      "A quirk worth remembering for next time: the training loop only ever saves EMA checkpoints (ema_{rate}_{step}.pt) — the raw model checkpoint save is commented out in the codebase. If you go looking for a non-EMA checkpoint, it doesn't exist.",
      "After getting a stable run to ~50K steps, the more interesting experiment was inference-time: sampling at 2000, 10, and 2 diffusion steps to see where quality actually falls off a cliff versus where it just gets a little rougher.",
    ],
    metric: { value: 50000, label: "stable training steps" },
  },
  {
    id: "tokenizers",
    tag: "completed",
    title: "The tokenizer you pick matters more than the model you pick",
    timestamp: "MoleculeNet · PCBA, MUV, HIV, QM8, QM9",
    summary:
      "Benchmarked four ways of turning a molecule into tokens — fragSMILES+BPE, plain fragSMILES, character-level SMILES, and SELFIES — using identical BiLSTM models.",
    body: [
      "Same architecture, same training budget, four different tokenizers, five MoleculeNet datasets. The point wasn't to find a better model — it was to isolate how much of a model's performance on molecular property prediction is actually coming from how the molecule gets chopped into tokens in the first place.",
      "Used the chemicalgof library's BPETrainer and BPETokenizer for the fragment-based vocabularies. In parallel, explored a fragment-based tokenizer for molecule captioning on ChEBI-20, pairing a BiLSTM encoder with a Transformer decoder.",
    ],
    metric: { value: 4, label: "tokenization schemes compared" },
  },
];

const SKILLS = {
  Languages: ["C/C++", "Python", "SQL", "Java", "JavaScript", "HTML/CSS"],
  Frameworks: ["React", "Node.js", "Flask", "FastAPI", "TensorFlow", "Stable-Baselines3", "Kubernetes"],
  "Dev tools": ["Git", "Docker", "GKE", "Prometheus", "Icarus Verilog"],
  Libraries: ["PyTorch", "pandas", "NumPy", "Matplotlib", "scikit-learn"],
};

const ACHIEVEMENTS = [
  { label: "GATE CSE 2025", detail: "AIR 561 of ~200,000 candidates" },
  { label: "BARC CSE 2025", detail: "Written exam qualified — top 178" },
  { label: "LeetCode", detail: "Knight, rating 1879" },
  { label: "CodeKaze Round 1", detail: "Rank 17k of 80k participants" },
];

const EDUCATION = [
  { school: "IIT Delhi", degree: "M.Tech, Computer Technology", period: "Jul 2025 – May 2027", detail: "CGPA 8.2" },
  { school: "Medi-Caps University", degree: "B.Tech, Computer Science", period: "Aug 2020 – May 2024", detail: "CGPA 9.15" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

function HeroWave() {
  const canvasRef = useRef(null);
  const mouseX = useRef(0.5);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      const lines = [
        { color: ACCENTS.cyan, amp: 26, freq: 0.018, speed: 0.045, alpha: 0.9 },
        { color: ACCENTS.coral, amp: 16, freq: 0.026, speed: 0.03, alpha: 0.55 },
        { color: ACCENTS.yellow, amp: 10, freq: 0.04, speed: 0.06, alpha: 0.35 },
      ];

      lines.forEach((ln) => {
        ctx.beginPath();
        const boost = 1 + (1 - Math.abs(mouseX.current - 0.5) * 2) * 0.9;
        for (let x = 0; x <= w; x += 4) {
          const dx = x / w - mouseX.current;
          const focus = Math.exp(-dx * dx * 8);
          const y =
            h / 2 +
            Math.sin(x * ln.freq + t * ln.speed) * ln.amp * (1 + focus * boost * 0.8);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ln.color;
        ctx.globalAlpha = ln.alpha;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      t += 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    }

    draw();
    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseX.current = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

function MiniWave({ type, color }) {
  const paths = {
    spike: "M0,20 L10,20 L14,4 L18,32 L22,10 L26,20 L40,20 L44,28 L48,6 L52,20 L70,20",
    decay: "M0,8 C15,10 25,16 34,22 C45,29 55,31 70,32",
    sine: "M0,20 C8,4 16,4 24,20 C32,36 40,36 48,20 C56,4 64,4 70,20",
    square: "M0,26 L10,26 L10,10 L24,10 L24,26 L38,26 L38,10 L52,10 L52,26 L70,26",
    steady: "M0,20 L20,20 L24,14 L28,26 L32,20 L70,20",
    sched: "M0,24 L6,24 L6,10 L14,10 L14,26 L22,26 L22,6 L34,6 L34,20 L44,20 L44,14 L56,14 L56,24 L70,24",
  };
  return (
    <svg viewBox="0 0 70 40" className="mini-wave" aria-hidden="true">
      <path
        d={paths[type] || paths.steady}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCounter({ value, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const isFloat = value % 1 !== 0;
            const duration = 900;
            const start = performance.now();
            function tick(now) {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setCount(isFloat ? +(value * eased).toFixed(2) : Math.round(value * eased));
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div className="stat" ref={ref}>
      <div className="stat-value">
        {count}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ProjectCard({ p }) {
  return (
    <article className="project-card" style={{ "--accent": p.color }}>
      <div className="project-top">
        <MiniWave type={p.wave} color={p.color} />
        <span className="project-date">{p.date}</span>
      </div>
      <h3 className="project-title">{p.title}</h3>
      <p className="project-tagline">{p.tagline}</p>
      <ul className="project-bullets">
        {p.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <div className="project-footer">
        <StatCounter value={p.metric.value} suffix={p.metric.suffix} label={p.metric.label} />
        <div className="project-tags">
          {p.stack.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>
        <a href={p.github} className="project-link" target="_blank" rel="noreferrer">
          view repo <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}

function ResearchEntry({ entry, open, onToggle }) {
  return (
    <div className="log-entry">
      <button className="log-header" onClick={onToggle} aria-expanded={open}>
        <div className="log-header-left">
          <span className={`log-tag log-tag-${entry.tag}`}>{entry.tag}</span>
          <div>
            <div className="log-title">{entry.title}</div>
            <div className="log-timestamp">{entry.timestamp}</div>
          </div>
        </div>
        <ChevronDown size={18} className={`log-chevron ${open ? "log-chevron-open" : ""}`} />
      </button>
      <p className="log-summary">{entry.summary}</p>
      <div className={`log-body ${open ? "log-body-open" : ""}`}>
        <div className="log-body-inner">
          {entry.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <div className="log-metric">
            <Terminal size={14} />
            <span>
              {entry.metric.value} — {entry.metric.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [openLog, setOpenLog] = useState("nara");
  const [pulse, setPulse] = useState(false);

  return (
    <div className="pf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .pf-root {
          --bg: #12131a;
          --surface: #1c1f2e;
          --surface-2: #23273a;
          --text: #f2f0ea;
          --text-dim: #9aa0b4;
          --line: rgba(242,240,234,0.12);
          --coral: ${ACCENTS.coral};
          --cyan: ${ACCENTS.cyan};
          --yellow: ${ACCENTS.yellow};
          background: var(--bg);
          color: var(--text);
          font-family: 'IBM Plex Sans', sans-serif;
          min-height: 100vh;
          line-height: 1.6;
        }
        .pf-root * { box-sizing: border-box; }
        .pf-root h1, .pf-root h2, .pf-root h3 { font-family: 'Space Grotesk', sans-serif; margin: 0; }
        .mono { font-family: 'IBM Plex Mono', monospace; }

        .nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 6vw;
          background: rgba(18,19,26,0.85);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--line);
        }
        .nav-logo { font-weight: 700; font-size: 18px; letter-spacing: -0.02em; }
        .nav-logo .cursor { color: var(--cyan); animation: blink 1.1s steps(2) infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .nav-links { display: flex; gap: 28px; align-items: center; }
        .nav-links a {
          color: var(--text-dim); text-decoration: none; font-size: 14px;
          font-family: 'IBM Plex Mono', monospace; transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--cyan); }
        .nav-resume {
          display: flex; align-items: center; gap: 6px;
          border: 1px solid var(--coral); color: var(--coral);
          padding: 7px 14px; border-radius: 6px; font-size: 13px;
          font-family: 'IBM Plex Mono', monospace; text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .nav-resume:hover { background: var(--coral); color: #12131a; }

        section { padding: 90px 6vw; max-width: 1180px; margin: 0 auto; }

        .hero { position: relative; padding-top: 60px; min-height: 62vh; display: flex; flex-direction: column; justify-content: center; }
        .hero-canvas { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.55; pointer-events: none; }
        .hero-content { position: relative; z-index: 2; max-width: 780px; }
        .hero-eyebrow {
          font-family: 'IBM Plex Mono', monospace; color: var(--cyan); font-size: 13px;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 18px; display: block;
        }
        .hero-title { font-size: clamp(34px, 5.5vw, 60px); font-weight: 700; line-height: 1.08; letter-spacing: -0.01em; }
        .hero-title .accent { color: var(--coral); }
        .hero-sub { color: var(--text-dim); font-size: 18px; margin-top: 22px; max-width: 560px; }
        .hero-links { display: flex; gap: 14px; margin-top: 34px; flex-wrap: wrap; }
        .icon-btn {
          display: flex; align-items: center; gap: 8px;
          border: 1px solid var(--line); color: var(--text);
          padding: 10px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;
          font-family: 'IBM Plex Mono', monospace; transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .icon-btn:hover { border-color: var(--cyan); color: var(--cyan); transform: translateY(-1px); }

        .section-head { margin-bottom: 44px; }
        .section-eyebrow { font-family: 'IBM Plex Mono', monospace; color: var(--text-dim); font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
        .section-title { font-size: clamp(26px, 3.4vw, 36px); margin-top: 10px; }

        .about-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 56px; align-items: start; }
        .about-text p { color: var(--text-dim); font-size: 16px; margin: 0 0 16px; }
        .edu-list { display: flex; flex-direction: column; gap: 18px; }
        .edu-item { border-left: 2px solid var(--coral); padding-left: 16px; }
        .edu-item .school { font-weight: 600; font-size: 15px; }
        .edu-item .degree { color: var(--text-dim); font-size: 14px; margin-top: 2px; }
        .edu-item .meta { color: var(--text-dim); font-size: 12px; font-family: 'IBM Plex Mono', monospace; margin-top: 6px; }

        .achievements { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 40px; }
        .ach-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; }
        .ach-label { color: var(--yellow); font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 600; }
        .ach-detail { color: var(--text-dim); font-size: 13px; margin-top: 4px; }

        .skills-wrap { margin-top: 44px; }
        .skill-row { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; align-items: baseline; }
        .skill-cat { font-family: 'IBM Plex Mono', monospace; color: var(--text-dim); font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; min-width: 110px; }
        .chip-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 5px 13px; font-size: 13px; color: var(--text); }

        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px; }
        .project-card {
          background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
          padding: 24px; display: flex; flex-direction: column; transition: border-color 0.2s, transform 0.2s;
        }
        .project-card:hover { border-color: var(--accent); transform: translateY(-3px); }
        .project-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .mini-wave { width: 70px; height: 32px; }
        .project-date { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--text-dim); }
        .project-title { font-size: 20px; margin-bottom: 6px; }
        .project-tagline { color: var(--text-dim); font-size: 14px; margin: 0 0 14px; }
        .project-bullets { margin: 0 0 18px; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
        .project-bullets li { color: var(--text-dim); font-size: 13.5px; line-height: 1.55; }
        .project-footer { margin-top: auto; border-top: 1px solid var(--line); padding-top: 16px; }
        .stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; color: var(--accent); }
        .stat-label { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
        .project-tags { display: flex; gap: 6px; flex-wrap: wrap; margin: 12px 0; }
        .tag { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--text-dim); background: var(--surface-2); padding: 3px 9px; border-radius: 4px; }
        .project-link { display: inline-flex; align-items: center; gap: 5px; color: var(--accent); text-decoration: none; font-size: 13px; font-family: 'IBM Plex Mono', monospace; }
        .project-link:hover { text-decoration: underline; }

        .log-entry { border: 1px solid var(--line); border-radius: 12px; padding: 20px 22px; margin-bottom: 14px; background: var(--surface); }
        .log-header { width: 100%; background: none; border: none; display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 0; color: var(--text); }
        .log-header-left { display: flex; gap: 14px; align-items: flex-start; text-align: left; }
        .log-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; height: fit-content; margin-top: 3px; letter-spacing: 0.04em; }
        .log-tag-ongoing { background: rgba(76,223,232,0.15); color: var(--cyan); }
        .log-tag-completed { background: rgba(255,209,102,0.15); color: var(--yellow); }
        .log-title { font-size: 17px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .log-timestamp { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--text-dim); margin-top: 4px; }
        .log-chevron { color: var(--text-dim); flex-shrink: 0; transition: transform 0.25s; }
        .log-chevron-open { transform: rotate(180deg); }
        .log-summary { color: var(--text-dim); font-size: 14px; margin: 14px 0 0; }
        .log-body { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
        .log-body-open { max-height: 900px; }
        .log-body-inner { padding-top: 16px; border-top: 1px solid var(--line); margin-top: 16px; }
        .log-body-inner p { color: var(--text-dim); font-size: 14px; margin: 0 0 14px; }
        .log-metric { display: flex; align-items: center; gap: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--cyan); }

        .contact-box {
          background: var(--surface); border: 1px solid var(--line); border-radius: 16px;
          padding: 48px; text-align: center;
        }
        .contact-title { font-size: clamp(24px, 3vw, 34px); margin-bottom: 14px; }
        .contact-sub { color: var(--text-dim); margin-bottom: 30px; }
        .contact-links { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        .footer { text-align: center; padding: 30px 6vw 50px; color: var(--text-dim); font-size: 12px; font-family: 'IBM Plex Mono', monospace; }
        .footer button { background: none; border: none; color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; font-size: 12px; cursor: pointer; text-decoration: underline; }
        .easter { margin-top: 14px; color: var(--yellow); min-height: 16px; }

        @media (max-width: 860px) {
          .about-grid { grid-template-columns: 1fr; gap: 32px; }
          section { padding: 60px 6vw; }
          .nav-links { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-logo .cursor { animation: none; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-logo">
          amay<span className="cursor">_</span>
        </div>
        <div className="nav-links">
          <a href="#about">about</a>
          <a href="#projects">projects</a>
          <a href="#research">research log</a>
          <a href="#contact">contact</a>
        </div>
        <a className="nav-resume" href="#" download>
          <Download size={14} /> résumé
        </a>
      </nav>

      <header className="hero">
        <HeroWave />
        <div className="hero-content">
          <span className="hero-eyebrow">// M.Tech, Computer Technology · IIT Delhi</span>
          <h1 className="hero-title">
            I make broken systems <span className="accent">tell me</span> what's wrong with them.
          </h1>
          <p className="hero-sub">
            Amay Jain — I build things that watch, predict, and occasionally almost crash trying:
            memory leak detectors, self-scaling clusters, and language models that read molecules.
          </p>
          <div className="hero-links">
            <a className="icon-btn" href="mailto:eet252478@iitd.ac.in">
              <Mail size={15} /> email
            </a>
            <a className="icon-btn" href="https://github.com/jainamay19112002" target="_blank" rel="noreferrer">
              <Github size={15} /> github
            </a>
            <a className="icon-btn" href="#" target="_blank" rel="noreferrer">
              <Linkedin size={15} /> linkedin
            </a>
          </div>
        </div>
      </header>

      <section id="about">
        <div className="section-head">
          <span className="section-eyebrow">01 — about</span>
          <h2 className="section-title">Systems person, occasionally a molecule person</h2>
        </div>
        <div className="about-grid">
          <div className="about-text">
            <p>
              Most of what I build starts from the same question: how do you know a system is
              about to fail before it actually does? That question has taken me from intercepting
              syscalls with LD_PRELOAD to teaching a diffusion language model to caption molecules
              it's never seen — same instinct, very different domains.
            </p>
            <p>
              Currently at IIT Delhi, working on NaRA — noise-adaptive rank adaptation for
              fine-tuning large language models — applied to SMILES-to-caption molecule
              captioning on an 8×A100 cluster. Before that: predictive auto-scaling on GKE, a
              memory-leak predictor, and a Verilog ALU that had to hit 250 MHz or nothing.
            </p>
          </div>
          <div className="edu-list">
            {EDUCATION.map((e) => (
              <div className="edu-item" key={e.school}>
                <div className="school">{e.school}</div>
                <div className="degree">{e.degree}</div>
                <div className="meta">
                  {e.period} · {e.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="achievements">
          {ACHIEVEMENTS.map((a) => (
            <div className="ach-card" key={a.label}>
              <div className="ach-label">{a.label}</div>
              <div className="ach-detail">{a.detail}</div>
            </div>
          ))}
        </div>

        <div className="skills-wrap">
          {Object.entries(SKILLS).map(([cat, items]) => (
            <div className="skill-row" key={cat}>
              <span className="skill-cat">{cat}</span>
              <div className="chip-group">
                {items.map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="projects">
        <div className="section-head">
          <span className="section-eyebrow">02 — projects</span>
          <h2 className="section-title">Things I've shipped</h2>
        </div>
        <div className="projects-grid">
          {PROJECTS.map((p) => (
            <ProjectCard p={p} key={p.id} />
          ))}
        </div>
      </section>

      <section id="research">
        <div className="section-head">
          <span className="section-eyebrow">03 — research log</span>
          <h2 className="section-title">Lab notebook</h2>
          <p style={{ color: "var(--text-dim)", marginTop: "10px", maxWidth: "640px" }}>
            Longer-running research that doesn't fit in a resume bullet — including the bugs that
            ate a week each.
          </p>
        </div>
        {RESEARCH_LOG.map((entry) => (
          <ResearchEntry
            key={entry.id}
            entry={entry}
            open={openLog === entry.id}
            onToggle={() => setOpenLog(openLog === entry.id ? null : entry.id)}
          />
        ))}
      </section>

      <section id="contact">
        <div className="contact-box">
          <h2 className="contact-title">Want to talk systems, ML, or why remasking should never be "low_confidence"?</h2>
          <p className="contact-sub">I'm always up for a conversation about research, roles, or an interesting bug.</p>
          <div className="contact-links">
            <a className="icon-btn" href="mailto:eet252478@iitd.ac.in">
              <Mail size={15} /> eet252478@iitd.ac.in
            </a>
            <a className="icon-btn" href="https://github.com/jainamay19112002" target="_blank" rel="noreferrer">
              <Github size={15} /> github
            </a>
            <a className="icon-btn" href="#" target="_blank" rel="noreferrer">
              <Linkedin size={15} /> linkedin
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>built by amay jain · {new Date().getFullYear()}</div>
        <button onClick={() => setPulse(!pulse)}>sudo make-me-smile</button>
        <div className="easter">{pulse ? "$ segmentation fault (core dumped) — just kidding, have a nice day" : ""}</div>
      </footer>
    </div>
  );
}
