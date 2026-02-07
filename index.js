import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Cpu, 
  Layers, 
  Zap, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin, 
  ArrowUpRight, 
  Code2, 
  Sparkles,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Theme & Constants ---
const COLORS = {
  obsidian: '#0B0B0B',
  indigo: '#6366F1',
  slate: '#94A3B8',
};

const PROJECTS = [
  {
    title: "VibeFlow Engine",
    description: "An AI-orchestrated workflow manager built for rapid prototyping and deployment.",
    tags: ["Next.js", "Cursor", "Supabase"],
    link: "#",
    color: "from-indigo-500/20 to-purple-500/20"
  },
  {
    title: "Cyber-Minimal UI",
    description: "A component library focused on high-performance motion and glassmorphism.",
    tags: ["Tailwind", "Framer Motion"],
    link: "#",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "SpeedCode AI",
    description: "Real-time code generation assistant leveraging custom LLM fine-tuning.",
    tags: ["Python", "FastAPI", "OpenAI"],
    link: "#",
    color: "from-emerald-500/20 to-teal-500/20"
  }
];

const MODULES = [
  { name: "Cursor", icon: <Command size={16} /> },
  { name: "Next.js", icon: <Layers size={16} /> },
  { name: "Vercel", icon: <Zap size={16} /> },
  { name: "Tailwind", icon: <Code2 size={16} /> },
  { name: "Supabase", icon: <Cpu size={16} /> },
];

// --- Components ---

const BackgroundMesh = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B0B0B]">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
    <div 
      className="absolute inset-0 opacity-[0.03]" 
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
  </div>
);

const TerminalComponent = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'Welcome to Rabin.os v2.5.0' },
    { type: 'system', content: 'Type "whois" or "contact" to interact.' }
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = input.toLowerCase().trim();
    let response = '';

    if (cmd === 'whois') {
      response = "Rakib Ul Hasan Rabin: A Vibe Coder & Full-Stack Architect. Obsessed with building at the speed of thought.";
    } else if (cmd === 'contact') {
      response = "Email: hello@rabin.dev | Twitter: @rabin_vibe";
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd !== '') {
      response = `Command not found: ${cmd}`;
    }

    if (cmd !== '') {
      setHistory([...history, { type: 'user', content: cmd }, { type: 'system', content: response }]);
    }
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-20 font-mono text-sm border border-white/10 bg-black/40 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
        </div>
        <span className="text-white/40 text-[10px] ml-2">bash — raven-os</span>
      </div>
      <div ref={scrollRef} className="p-4 h-48 overflow-y-auto space-y-2 custom-scrollbar">
        {history.map((line, i) => (
          <div key={i} className={line.type === 'user' ? 'text-indigo-400' : 'text-slate-300'}>
            {line.type === 'user' ? '> ' : ''}{line.content}
          </div>
        ))}
        <form onSubmit={handleCommand} className="flex gap-2">
          <span className="text-indigo-500">❯</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white border-none p-0 focus:ring-0"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

const ProjectCard = ({ project }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
  >
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`} />
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
        <Sparkles size={20} />
      </div>
      <a href={project.link} className="text-white/30 hover:text-white transition-colors">
        <ArrowUpRight size={20} />
      </a>
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed mb-6">
      {project.description}
    </p>
    <div className="flex flex-wrap gap-2">
      {project.tags.map(tag => (
        <span key={tag} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);

export default function App() {
  return (
    <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30">
      <BackgroundMesh />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-md bg-black/20 p-4 rounded-2xl border border-white/5">
          <div className="font-bold tracking-tighter text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">R</div>
            <span>Rabin<span className="text-indigo-500">.</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#work" className="hover:text-white transition-colors">Work</a>
            <a href="#stack" className="hover:text-white transition-colors">Stack</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all duration-300">
            Resume
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="relative text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Available for new vibes
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Rakib Ul Hasan Rabin
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
              Vibe Coder & Full-Stack Architect turning <span className="text-white font-medium italic underline decoration-indigo-500/50">speed of thought</span> into production-ready reality.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20">
                View Projects
              </button>
              <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                Let's Talk
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <TerminalComponent />
          </motion.div>
        </section>

        {/* Vibe Stack */}
        <section id="stack" className="py-20 border-t border-white/5 mt-20">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">The Vibe Stack</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {MODULES.map((module, i) => (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white hover:border-indigo-500/50 hover:bg-white/[0.05] transition-all group"
              >
                <span className="text-indigo-400 group-hover:scale-110 transition-transform">
                  {module.icon}
                </span>
                <span className="font-mono text-sm tracking-widest">{module.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Grid */}
        <section id="work" className="py-20">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">Production Output</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project, i) => (
              <ProjectCard key={i} project={project} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="pt-40 pb-10 text-center">
          <div className="mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">Ready to build?</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">No legacy friction. Just pure execution and high-energy products.</p>
            <a href="mailto:hello@rabin.dev" className="text-2xl md:text-4xl font-mono text-indigo-400 hover:text-white transition-colors underline underline-offset-8 decoration-indigo-500/30">
              hello@rabin.dev
            </a>
          </div>
          
          <div className="flex justify-center gap-6 mb-12 text-slate-500">
            <a href="#" className="hover:text-indigo-400 transition-colors"><Github size={24} /></a>
            <a href="#" className="hover:text-indigo-400 transition-colors"><Twitter size={24} /></a>
            <a href="#" className="hover:text-indigo-400 transition-colors"><Linkedin size={24} /></a>
          </div>
          
          <div className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-mono">
            Designed for the era of AI-Native development • 2024
          </div>
        </footer>
      </main>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100;300;400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
          
          body {
            font-family: 'Geist', sans-serif;
            background-color: #0B0B0B;
            margin: 0;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
        `}
      </style>
    </div>
  );
}