'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type GraphMode = '2d' | '3d' | 'vector';

interface Equation {
  id: number;
  expr: string;
  type: 'cartesian' | 'polar';
  color: string;
}

const COLORS = ['#00c896', '#00a8ff', '#f43f5e', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'];

const EXAMPLES = {
  '2d': [
    { expr: 'sin(x)',       type: 'cartesian' as const, label: 'y=sin(x)' },
    { expr: 'x^2',         type: 'cartesian' as const, label: 'y=x²' },
    { expr: 'x^3-x',       type: 'cartesian' as const, label: 'y=x³-x' },
    { expr: 'cos(3*theta)', type: 'polar' as const,     label: 'r=cos(3θ)' },
    { expr: '1/x',         type: 'cartesian' as const, label: 'y=1/x' },
    { expr: 'sqrt(abs(x))',type: 'cartesian' as const, label: 'y=√|x|' },
  ],
  '3d': [
    { expr: 'sin(sqrt(x^2+y^2))', label: 'sin(√(x²+y²))' },
    { expr: 'x^2+y^2',            label: 'z=x²+y²' },
    { expr: 'sin(x)*cos(y)',       label: 'sin(x)·cos(y)' },
    { expr: 'x*y',                 label: 'z=xy' },
    { expr: '-x^2-y^2+4',         label: 'z=4-x²-y²' },
  ],
  vector: [
    { expr: '-y, x',     label: 'Rotation' },
    { expr: 'x, y',      label: 'Radial' },
    { expr: '-x, -y',    label: 'Sink' },
    { expr: 'y, sin(x)', label: 'y, sin(x)' },
  ],
};

export default function GraphPlotter({ locale }: { locale: string }) {
  const isBn = locale === 'bn';
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const canvas3DRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const [mode, setMode] = useState<GraphMode>('2d');
  const [equations, setEquations] = useState<Equation[]>([
    { id: 1, expr: 'sin(x)', type: 'cartesian', color: '#00c896' },
  ]);
  const [newExpr, setNewExpr] = useState('');
  const [newType, setNewType] = useState<'cartesian' | 'polar'>('cartesian');
  const [scale, setScale] = useState(50);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 3D state
  const [expr3D, setExpr3D] = useState('sin(sqrt(x^2+y^2))');
  const [rotX, setRotX] = useState(0.5);
  const [rotZ, setRotZ] = useState(0.5);
  const [is3DDragging, setIs3DDragging] = useState(false);
  const [drag3DStart, setDrag3DStart] = useState({ x: 0, y: 0, rx: 0, rz: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  // Vector state
  const [vectorExpr, setVectorExpr] = useState('-y, x');

  const evalExpr = useCallback((expr: string, vars: Record<string, number>): number => {
    try {
      const safe = expr
        .replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt').replace(/abs/g, 'Math.abs').replace(/log/g, 'Math.log')
        .replace(/exp/g, 'Math.exp').replace(/pi/g, 'Math.PI').replace(/e(?![a-zA-Z])/g, 'Math.E')
        .replace(/\^/g, '**');
      const keys = Object.keys(vars);
      const vals = Object.values(vars);
      // eslint-disable-next-line no-new-func
      return new Function(...keys, `return ${safe}`)(...vals);
    } catch { return NaN; }
  }, []);

  // ── 2D Draw ──
  const draw2D = useCallback(() => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2 + offset.x, cy = H / 2 + offset.y;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#060f1e' : '#f0faf7';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(0,200,150,0.08)' : 'rgba(0,150,100,0.1)';
    ctx.lineWidth = 1;
    for (let x = cx % scale; x < W; x += scale) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = cy % scale; y < H; y += scale) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Axes
    ctx.strokeStyle = isDark ? 'rgba(0,200,150,0.5)' : 'rgba(0,150,100,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    // Labels
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    ctx.font = '10px monospace';
    for (let i = -15; i <= 15; i++) {
      if (i===0) continue;
      const px = cx + i * scale, py = cy + i * scale;
      ctx.textAlign = 'center';
      if (px > 5 && px < W-5) ctx.fillText(String(i), px, cy + 14);
      ctx.textAlign = 'right';
      if (py > 5 && py < H-5) ctx.fillText(String(-i), cx - 5, py + 3);
    }

    // Curves
    equations.forEach(eq => {
      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = eq.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      let penDown = false;
      if (eq.type === 'cartesian') {
        for (let px = 0; px <= W; px += 1) {
          const x = (px - cx) / scale;
          const y = evalExpr(eq.expr, { x });
          if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1000) { penDown = false; continue; }
          const py = cy - y * scale;
          if (!penDown) { ctx.moveTo(px, py); penDown = true; } else ctx.lineTo(px, py);
        }
      } else {
        for (let t = 0; t <= Math.PI * 2; t += 0.005) {
          const r = evalExpr(eq.expr, { theta: t });
          if (isNaN(r) || !isFinite(r)) { penDown = false; continue; }
          const px = cx + r * Math.cos(t) * scale;
          const py = cy - r * Math.sin(t) * scale;
          if (!penDown) { ctx.moveTo(px, py); penDown = true; } else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }, [equations, scale, offset, evalExpr]);

  // ── 3D Draw ──
  const draw3D = useCallback((time = 0) => {
    const canvas = canvas3DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#060f1e' : '#f0faf7';
    ctx.fillRect(0, 0, W, H);

    const currentRotZ = autoRotate ? rotZ + time * 0.0005 : rotZ;
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosZ = Math.cos(currentRotZ), sinZ = Math.sin(currentRotZ);

    const project = (x: number, y: number, z: number) => {
      const rx = x * cosZ - y * sinZ;
      const ry = x * sinZ + y * cosZ;
      const rz = ry * sinX + z * cosX;
      const ry2 = ry * cosX - z * sinX;
      const scale3d = 80;
      const fov = 500;
      const perspective = fov / (fov + ry2 * scale3d);
      return {
        sx: W/2 + rx * scale3d * perspective,
        sy: H/2 - rz * scale3d * perspective,
        depth: ry2
      };
    };

    const N = 40;
    const range = 3;
    const pts: { sx: number; sy: number; depth: number; z: number }[][] = [];

    for (let i = 0; i <= N; i++) {
      pts[i] = [];
      for (let j = 0; j <= N; j++) {
        const x = (i/N * 2 - 1) * range;
        const y = (j/N * 2 - 1) * range;
        const z = evalExpr(expr3D, { x, y });
        const p = project(x, y, isNaN(z) || !isFinite(z) ? 0 : Math.max(-3, Math.min(3, z)));
        pts[i][j] = { ...p, z: isNaN(z) ? 0 : z };
      }
    }

    // Find z range for coloring
    let minZ = Infinity, maxZ = -Infinity;
    pts.flat().forEach(p => { if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z; });

    // Draw quads sorted by depth
    const quads: { depth: number; i: number; j: number }[] = [];
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        quads.push({ depth: (pts[i][j].depth + pts[i+1][j].depth + pts[i][j+1].depth + pts[i+1][j+1].depth) / 4, i, j });
    quads.sort((a, b) => b.depth - a.depth);

    quads.forEach(({ i, j }) => {
      const p00 = pts[i][j], p10 = pts[i+1][j], p01 = pts[i][j+1], p11 = pts[i+1][j+1];
      const avgZ = (p00.z + p10.z + p01.z + p11.z) / 4;
      const t = Math.max(0, Math.min(1, (avgZ - minZ) / (maxZ - minZ + 0.001)));

      // Color: cyan → green → blue gradient
      const r = Math.round(0 + t * 0);
      const g = Math.round(168 + t * 32);
      const b = Math.round(255 - t * 155);
      const alpha = isDark ? 0.85 : 0.9;

      ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.4})`;
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      ctx.moveTo(p00.sx, p00.sy);
      ctx.lineTo(p10.sx, p10.sy);
      ctx.lineTo(p11.sx, p11.sy);
      ctx.lineTo(p01.sx, p01.sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Axes
    const o = project(0, 0, 0);
    const ax = project(2, 0, 0), ay = project(0, 2, 0), az = project(0, 0, 2);
    [[ax, '#f43f5e', 'X'], [ay, '#00c896', 'Y'], [az, '#00a8ff', 'Z']].forEach(([p, c, label]) => {
      ctx.strokeStyle = c as string; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(o.sx, o.sy); ctx.lineTo((p as typeof o).sx, (p as typeof o).sy); ctx.stroke();
      ctx.fillStyle = c as string; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(label as string, (p as typeof o).sx, (p as typeof o).sy - 5);
    });
  }, [expr3D, rotX, rotZ, autoRotate, evalExpr]);

  // ── Vector Draw ──
  const drawVector = useCallback(() => {
    const canvas = canvas3DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#060f1e' : '#f0faf7';
    ctx.fillRect(0, 0, W, H);

    const cx = W/2, cy = H/2;
    const gridScale = 55;
    const parts = vectorExpr.split(',');
    if (parts.length < 2) return;
    const [exprU, exprV] = parts;

    // Grid lines
    ctx.strokeStyle = isDark ? 'rgba(0,200,150,0.08)' : 'rgba(0,150,100,0.1)';
    ctx.lineWidth = 1;
    for (let x = cx % gridScale; x < W; x += gridScale) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = cy % gridScale; y < H; y += gridScale) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const cols = Math.floor(W / gridScale) + 1;
    const rows = Math.floor(H / gridScale) + 1;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const px = (i - Math.floor(cols/2)) * gridScale;
        const py = -(j - Math.floor(rows/2)) * gridScale;
        const x = px / gridScale, y = py / gridScale;
        const u = evalExpr(exprU.trim(), { x, y });
        const v = evalExpr(exprV.trim(), { x, y });
        if (isNaN(u) || isNaN(v)) continue;

        const mag = Math.sqrt(u*u + v*v);
        if (mag === 0) continue;
        const maxLen = gridScale * 0.42;
        const len = Math.min(maxLen, mag * 12);
        const nx = u / mag, ny = -v / mag;

        const startX = cx + px, startY = cy - py;
        const endX = startX + nx * len, endY = startY + ny * len;

        // Color by magnitude
        const t = Math.min(1, mag / 3);
        const r = Math.round(0 + t * 244), g = Math.round(200 - t * 137), b = Math.round(150 + t * 105);
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 1.5;

        // Arrow line
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(endY - startY, endX - startX);
        const aLen = 6;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - aLen * Math.cos(angle - 0.4), endY - aLen * Math.sin(angle - 0.4));
        ctx.lineTo(endX - aLen * Math.cos(angle + 0.4), endY - aLen * Math.sin(angle + 0.4));
        ctx.closePath(); ctx.fill();
      }
    }

    // Axes
    const isDark2 = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDark2 ? 'rgba(0,200,150,0.5)' : 'rgba(0,150,100,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();
  }, [vectorExpr, evalExpr]);

  // Animation loop for 3D
  useEffect(() => {
    if (mode === '3d' && autoRotate) {
      let start: number;
      const animate = (t: number) => {
        if (!start) start = t;
        draw3D(t - start);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animRef.current);
    } else {
      cancelAnimationFrame(animRef.current);
      if (mode === '3d') draw3D(0);
      if (mode === 'vector') drawVector();
    }
  }, [mode, autoRotate, draw3D, drawVector]);

  useEffect(() => {
    if (mode === '2d') draw2D();
  }, [mode, draw2D]);

  const addEquation = () => {
    if (!newExpr.trim()) return;
    setEquations(prev => [...prev, { id: Date.now(), expr: newExpr.trim(), type: newType, color: COLORS[prev.length % COLORS.length] }]);
    setNewExpr('');
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.max(20, Math.min(200, s - e.deltaY * 0.1)));
  };
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  const handle3DMouseDown = (e: React.MouseEvent) => { setIs3DDragging(true); setDrag3DStart({ x: e.clientX, y: e.clientY, rx: rotX, rz: rotZ }); };
  const handle3DMouseMove = (e: React.MouseEvent) => {
    if (!is3DDragging) return;
    setAutoRotate(false);
    setRotX(drag3DStart.rx + (e.clientY - drag3DStart.y) * 0.01);
    setRotZ(drag3DStart.rz + (e.clientX - drag3DStart.x) * 0.01);
  };
  const handle3DMouseUp = () => setIs3DDragging(false);

  const modeLabels = [
    { key: '2d', label: '2D', icon: '📈' },
    { key: '3d', label: '3D', icon: '🧊' },
    { key: 'vector', label: isBn ? 'ভেক্টর' : 'Vector', icon: '➡️' },
  ];

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        {modeLabels.map(m => (
          <button key={m.key} onClick={() => setMode(m.key as GraphMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mode === m.key
                ? 'text-black shadow-lg shadow-[#00c896]/30'
                : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
            style={mode === m.key ? { background: 'linear-gradient(135deg, #00c896, #00a8ff)' } : {}}>
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* 2D Controls */}
      {mode === '2d' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shrink-0">
              {(['cartesian', 'polar'] as const).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all ${
                    newType === t ? 'bg-[#00c896] text-black' : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                  } ${t === 'polar' ? 'border-l border-gray-200 dark:border-white/10' : ''}`}>
                  {t === 'cartesian' ? 'y=f(x)' : 'r=f(θ)'}
                </button>
              ))}
            </div>
            <input value={newExpr} onChange={e => setNewExpr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEquation()}
              placeholder={newType === 'cartesian' ? 'sin(x)' : 'cos(3*theta)'}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-[#00c896]" />
            <button onClick={addEquation}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-all shrink-0"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
              + {isBn ? 'যোগ' : 'Add'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">{isBn ? 'উদাহরণ:' : 'Examples:'}</span>
            {EXAMPLES['2d'].map(ex => (
              <button key={ex.label} onClick={() => { setNewExpr(ex.expr); setNewType(ex.type); }}
                className="px-3 py-1 rounded-lg text-xs border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-[#00c896]/50 hover:text-[#00c896] transition-all font-mono">
                {ex.label}
              </button>
            ))}
          </div>

          {equations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {equations.map(eq => (
                <div key={eq.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: eq.color, boxShadow: `0 0 6px ${eq.color}` }} />
                  <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                    {eq.type === 'cartesian' ? `y=${eq.expr}` : `r=${eq.expr}`}
                  </span>
                  <button onClick={() => setEquations(p => p.filter(e => e.id !== eq.id))} className="text-gray-400 hover:text-red-400 text-xs ml-1">✕</button>
                </div>
              ))}
              <button onClick={() => setEquations([])} className="px-3 py-1.5 rounded-lg text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                {isBn ? 'সব মুছুন' : 'Clear all'}
              </button>
            </div>
          )}
        </>
      )}

      {/* 3D Controls */}
      {mode === '3d' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <input value={expr3D} onChange={e => setExpr3D(e.target.value)}
              placeholder="sin(sqrt(x^2+y^2))"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-[#00c896]" />
            <button onClick={() => setAutoRotate(a => !a)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${autoRotate ? 'bg-[#00c896] text-black' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>
              {autoRotate ? '⏸ Auto' : '▶ Auto'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">{isBn ? 'উদাহরণ:' : 'Examples:'}</span>
            {EXAMPLES['3d'].map(ex => (
              <button key={ex.label} onClick={() => setExpr3D(ex.expr)}
                className="px-3 py-1 rounded-lg text-xs border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-[#00c896]/50 hover:text-[#00c896] transition-all font-mono">
                {ex.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isBn ? 'ড্র্যাগ করে ঘোরান • স্ক্রোল করে জুম করুন' : 'Drag to rotate • variables: x, y'}
          </p>
        </div>
      )}

      {/* Vector Controls */}
      {mode === 'vector' && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 shrink-0 font-mono">(u, v) =</span>
            <input value={vectorExpr} onChange={e => setVectorExpr(e.target.value)}
              placeholder="-y, x"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-[#00c896]" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">{isBn ? 'উদাহরণ:' : 'Examples:'}</span>
            {EXAMPLES.vector.map(ex => (
              <button key={ex.label} onClick={() => setVectorExpr(ex.expr)}
                className="px-3 py-1 rounded-lg text-xs border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-[#00c896]/50 hover:text-[#00c896] transition-all font-mono">
                {ex.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isBn ? 'রঙ = magnitude • তীর = দিক' : 'Color = magnitude • Arrow = direction • variables: x, y'}
          </p>
        </div>
      )}

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10" style={{ background: '#060f1e' }}>
        {/* 2D Canvas */}
        <canvas ref={canvas2DRef} width={800} height={480}
          className={`w-full touch-none cursor-grab active:cursor-grabbing ${mode === '2d' ? 'block' : 'hidden'}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {/* 3D + Vector Canvas */}
        <canvas ref={canvas3DRef} width={800} height={480}
          className={`w-full touch-none ${mode === '3d' ? 'cursor-grab active:cursor-grabbing block' : mode === 'vector' ? 'cursor-default block' : 'hidden'}`}
          onMouseDown={mode === '3d' ? handle3DMouseDown : undefined}
          onMouseMove={mode === '3d' ? handle3DMouseMove : undefined}
          onMouseUp={mode === '3d' ? handle3DMouseUp : undefined}
          onMouseLeave={mode === '3d' ? handle3DMouseUp : undefined}
        />

        {/* Controls overlay */}
        {mode === '2d' && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {['+', '−'].map((btn, i) => (
              <button key={btn} onClick={() => setScale(s => i === 0 ? Math.min(200, s + 10) : Math.max(20, s - 10))}
                className="w-8 h-8 rounded-lg bg-black/50 text-white text-sm font-bold hover:bg-black/70 transition-all border border-white/10">
                {btn}
              </button>
            ))}
            <button onClick={() => { setScale(50); setOffset({ x: 0, y: 0 }); }}
              className="px-2.5 h-8 rounded-lg bg-black/50 text-white text-xs hover:bg-black/70 transition-all border border-white/10">
              ↺
            </button>
          </div>
        )}
        {mode === '3d' && (
          <div className="absolute bottom-3 right-3">
            <button onClick={() => { setRotX(0.5); setRotZ(0.5); setAutoRotate(true); }}
              className="px-3 h-8 rounded-lg bg-black/50 text-white text-xs hover:bg-black/70 transition-all border border-white/10">
              ↺ {isBn ? 'রিসেট' : 'Reset'}
            </button>
          </div>
        )}
        <div className="absolute top-3 left-3 text-xs text-gray-400 bg-black/40 px-2.5 py-1 rounded-lg font-mono">
          {mode === '2d' ? (isBn ? 'স্ক্রোল=জুম ড্র্যাগ=মুভ' : 'Scroll=Zoom Drag=Pan') :
           mode === '3d' ? (isBn ? 'ড্র্যাগ=ঘোরান' : 'Drag=Rotate') :
           (isBn ? 'ভেক্টর ফিল্ড' : 'Vector Field')}
        </div>
      </div>
    </div>
  );
}
