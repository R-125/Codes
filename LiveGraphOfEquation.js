import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Calculator, AlertCircle, X, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

// --- Core Logic: Safe Math Parser (No 'eval' or 'new Function') ---

const PRECEDENCE = {
  '+': 1, '-': 1,
  '*': 2, '/': 2,
  '^': 3,
  'u-': 4, // Unary minus
};

const tokenize = (expr) => {
  const tokens = [];
  // Matches: numbers, words (funcs/vars), operators, parens
  const regex = /([0-9]+\.?[0-9]*|\.[0-9]+)|([a-z]+)|([\+\-\*\/\^\(\)])/g;
  let match;
  while ((match = regex.exec(expr.toLowerCase())) !== null) {
    const [_, num, str, op] = match;
    if (num) tokens.push({ type: 'NUM', value: parseFloat(num) });
    else if (str) {
      if (str === 'x') tokens.push({ type: 'VAR', value: 'x' });
      else if (str === 'pi') tokens.push({ type: 'NUM', value: Math.PI });
      else if (str === 'e') tokens.push({ type: 'NUM', value: Math.E });
      else tokens.push({ type: 'FUNC', value: str });
    }
    else if (op) tokens.push({ type: 'OP', value: op });
  }
  return tokens;
};

const shuntingYard = (tokens) => {
  const output = [];
  const ops = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = i > 0 ? tokens[i-1] : null;

    // Handle implicit multiplication: 2x, x(2), (2)(3)
    // Insert '*' if current is VAR/FUNC/NUM/'(' and previous was NUM/VAR/')'
    if (['VAR', 'FUNC', 'NUM'].includes(token.type) || (token.type === 'OP' && token.value === '(')) {
      if (prev && (['NUM', 'VAR'].includes(prev.type) || (prev.type === 'OP' && prev.value === ')'))) {
        while (ops.length && ops[ops.length - 1].value !== '(' && (PRECEDENCE['*'] <= (PRECEDENCE[ops[ops.length - 1].value] || 0))) {
           output.push(ops.pop());
        }
        ops.push({ type: 'OP', value: '*' });
      }
    }

    if (token.type === 'NUM' || token.type === 'VAR') {
      output.push(token);
    } else if (token.type === 'FUNC') {
      ops.push(token);
    } else if (token.type === 'OP') {
      if (token.value === '(') {
        ops.push(token);
      } else if (token.value === ')') {
        while (ops.length && ops[ops.length - 1].value !== '(') {
          output.push(ops.pop());
        }
        ops.pop(); // Pop '('
        if (ops.length && ops[ops.length - 1].type === 'FUNC') {
          output.push(ops.pop());
        }
      } else {
        // Operator logic
        // Unary minus check: Start of expr, or after another operator or '('
        let isUnary = false;
        if (token.value === '-') {
           if (i === 0 || (prev && (prev.type === 'OP' && prev.value !== ')') || prev.value === '(')) {
             isUnary = true;
           }
        }
        
        const currentOp = isUnary ? 'u-' : token.value;
        const currentPrec = PRECEDENCE[currentOp] || 0;
        const isRightAssoc = currentOp === '^' || currentOp === 'u-';

        while (ops.length && ops[ops.length - 1].value !== '(') {
           const topOp = ops[ops.length - 1].value;
           const topPrec = PRECEDENCE[topOp] || 0;
           if ((!isRightAssoc && currentPrec <= topPrec) || (isRightAssoc && currentPrec < topPrec)) {
             output.push(ops.pop());
           } else {
             break;
           }
        }
        ops.push({ type: 'OP', value: currentOp });
      }
    }
  }
  while (ops.length) output.push(ops.pop());
  return output;
};

const evaluateRPN = (rpn, x) => {
  const stack = [];
  for (const token of rpn) {
    if (token.type === 'NUM') stack.push(token.value);
    else if (token.type === 'VAR') stack.push(x);
    else if (token.type === 'OP') {
      if (token.value === 'u-') {
        const a = stack.pop();
        stack.push(-a);
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) return NaN; // Error
        switch (token.value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/': stack.push(a / b); break;
          case '^': stack.push(Math.pow(a, b)); break;
          default: return NaN;
        }
      }
    } else if (token.type === 'FUNC') {
      const a = stack.pop();
      if (a === undefined) return NaN;
      switch (token.value) {
        case 'sin': stack.push(Math.sin(a)); break;
        case 'cos': stack.push(Math.cos(a)); break;
        case 'tan': stack.push(Math.tan(a)); break;
        case 'sqrt': stack.push(Math.sqrt(a)); break;
        case 'log': stack.push(Math.log10(a)); break;
        case 'ln': stack.push(Math.log(a)); break;
        case 'abs': stack.push(Math.abs(a)); break;
        default: stack.push(NaN);
      }
    }
  }
  return stack.length ? stack[0] : NaN;
};

const parseExpression = (expression) => {
  try {
    const tokens = tokenize(expression);
    if (!tokens.length) return null;
    const rpn = shuntingYard(tokens);
    return rpn;
  } catch (e) {
    return null;
  }
};

/**
 * Generates points for the canvas to draw.
 */
const generateGraphPoints = (rpn, width, height, xRange, yRange) => {
  const points = [];
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  
  if (!width || !height) return [];

  // Resolution: Calculate a point for every pixel horizontally
  const step = (xMax - xMin) / width; 

  for (let pixelX = 0; pixelX <= width; pixelX++) {
    const x = xMin + (pixelX * step);
    const y = evaluateRPN(rpn, x);

    if (isFinite(y) && !isNaN(y)) {
      const pixelY = height - ((y - yMin) / (yMax - yMin)) * height;
      points.push({ x: pixelX, y: pixelY });
    } else {
      points.push(null); // Discontinuity
    }
  }
  return points;
};

// --- Components ---

const GraphCanvas = ({ rpn, xRange, yRange }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Robust Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);
    
    // 2. Draw Grid & Axes
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    const toPixelX = (val) => ((val - xMin) / (xMax - xMin)) * width;
    const toPixelY = (val) => height - ((val - yMin) / (yMax - yMin)) * height;

    // Style
    ctx.lineWidth = 1;
    ctx.font = '10px Inter, sans-serif';
    
    // Grid Lines
    const xStep = (xMax - xMin) / 10;
    const yStep = (yMax - yMin) / 10;
    
    ctx.strokeStyle = '#374151'; // Gray-700
    ctx.fillStyle = '#9CA3AF'; // Gray-400

    // Vertical Grid
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const px = toPixelX(x);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
      if (Math.abs(x) > 0.001) ctx.fillText(x.toFixed(1), px + 4, height - 10);
    }

    // Horizontal Grid
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const py = toPixelY(y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
      if (Math.abs(y) > 0.001) ctx.fillText(y.toFixed(1), 5, py - 4);
    }

    // Axes
    ctx.strokeStyle = '#E5E7EB'; // Gray-200
    ctx.lineWidth = 2;
    
    const yAxisX = toPixelX(0);
    if (yAxisX >= 0 && yAxisX <= width) {
      ctx.beginPath();
      ctx.moveTo(yAxisX, 0);
      ctx.lineTo(yAxisX, height);
      ctx.stroke();
    }

    const xAxisY = toPixelY(0);
    if (xAxisY >= 0 && xAxisY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, xAxisY);
      ctx.lineTo(width, xAxisY);
      ctx.stroke();
    }

    // 3. Draw Function
    if (!rpn) return;

    ctx.strokeStyle = '#60A5FA'; // Blue-400
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = generateGraphPoints(rpn, width, height, xRange, yRange);
    
    ctx.beginPath();
    let isDrawing = false;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p === null) {
        isDrawing = false;
        continue;
      }
      
      // Optimization: Avoid drawing vertical asymptotes
      if (isDrawing && points[i-1] && Math.abs(p.y - points[i-1].y) > height) {
         isDrawing = false;
         ctx.stroke();
         ctx.beginPath();
         continue;
      }

      if (!isDrawing) {
        ctx.moveTo(p.x, p.y);
        isDrawing = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();

  }, [rpn, dimensions, xRange, yRange]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-gray-900 rounded-lg shadow-inner border border-gray-800">
      <canvas 
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
      />
      <div className="absolute top-4 right-4 pointer-events-none text-xs text-gray-500 font-mono">
        Res: {Math.round(dimensions.width)}x{Math.round(dimensions.height)}
      </div>
    </div>
  );
};

export default function App() {
  const [inputVal, setInputVal] = useState('sin(x) * x');
  const [rpn, setRpn] = useState(null);
  const [xRange, setXRange] = useState([-10, 10]);
  const [yRange, setYRange] = useState([-10, 10]);
  const [error, setError] = useState(null);

  // Debounced parsing
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed = parseExpression(inputVal);
      if (parsed) {
        // Validation check with x=1
        const val = evaluateRPN(parsed, 1);
        if (isNaN(val)) {
           setError("Invalid expression syntax");
           setRpn(null);
        } else {
           setRpn(parsed);
           setError(null);
        }
      } else {
        setRpn(null);
        if (inputVal.trim()) setError("Invalid characters");
        else setError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputVal]);

  const handleZoom = (factor) => {
    setXRange([xRange[0] * factor, xRange[1] * factor]);
    setYRange([yRange[0] * factor, yRange[1] * factor]);
  };

  const handleReset = () => {
    setXRange([-10, 10]);
    setYRange([-10, 10]);
  };

  const examples = [
    "sin(x)",
    "x^2 - 4",
    "tan(x)",
    "sin(x) / x",
    "log(x)",
    "x * sin(x^2)"
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT: Graph Area */}
      <div className="flex-1 h-[50vh] md:h-screen p-4 flex flex-col relative z-0">
        <header className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-gray-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-700 shadow-sm">
          <LineChart size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-gray-200 tracking-wide">Live Graph</span>
        </header>

        {/* Controls Overlay */}
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
           <div className="flex gap-2 bg-gray-900/90 backdrop-blur p-2 rounded-lg border border-gray-800 shadow-xl">
            <button onClick={() => handleZoom(0.8)} className="p-2 hover:bg-gray-700 rounded transition text-gray-300" title="Zoom In">
              <ZoomIn size={20} />
            </button>
            <button onClick={() => handleZoom(1.2)} className="p-2 hover:bg-gray-700 rounded transition text-gray-300" title="Zoom Out">
              <ZoomOut size={20} />
            </button>
            <div className="w-px bg-gray-700 mx-1"></div>
            <button onClick={handleReset} className="p-2 hover:bg-gray-700 rounded transition text-gray-300" title="Reset View">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full h-full">
            <GraphCanvas rpn={rpn} xRange={xRange} yRange={yRange} />
        </div>
      </div>

      {/* RIGHT: Input Area */}
      <div className="w-full md:w-[400px] bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl relative z-20">
        
        {/* Input Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900">
           <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
             <Calculator className="text-blue-500" />
             Input
           </h2>
           <p className="text-gray-400 text-sm">Enter a function of x to visualize it.</p>
        </div>

        {/* Editor */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Main Input */}
            <div className="group relative">
               <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 ml-1">
                 f(x) =
               </label>
               <div className="relative">
                 <input 
                    type="text" 
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. x^2 + 2x"
                    className="w-full bg-gray-950 text-2xl font-mono text-blue-100 p-4 rounded-xl border-2 border-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner placeholder:text-gray-700"
                    spellCheck="false"
                 />
                 {inputVal && (
                   <button 
                    onClick={() => setInputVal('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition"
                   >
                     <X size={16} />
                   </button>
                 )}
               </div>
               {error && (
                 <div className="mt-2 text-red-400 text-sm flex items-center gap-2">
                   <AlertCircle size={14} />
                   {error}
                 </div>
               )}
            </div>

            {/* Syntax Help */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Syntax Guide</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
                <div className="flex items-center justify-between bg-gray-900/50 px-2 py-1.5 rounded">
                  <span>Power</span>
                  <span className="text-blue-400">x^n</span>
                </div>
                <div className="flex items-center justify-between bg-gray-900/50 px-2 py-1.5 rounded">
                  <span>Implicit</span>
                  <span className="text-blue-400">2x</span>
                </div>
                <div className="flex items-center justify-between bg-gray-900/50 px-2 py-1.5 rounded">
                  <span>Trig</span>
                  <span className="text-blue-400">sin, cos</span>
                </div>
                <div className="flex items-center justify-between bg-gray-900/50 px-2 py-1.5 rounded">
                  <span>Root</span>
                  <span className="text-blue-400">sqrt(x)</span>
                </div>
                <div className="flex items-center justify-between bg-gray-900/50 px-2 py-1.5 rounded">
                  <span>Log</span>
                  <span className="text-blue-400">log, ln</span>
                </div>
                <div className="flex items-center justify-between bg-gray-900/50 px-2 py-1.5 rounded">
                  <span>Const</span>
                  <span className="text-blue-400">pi, e</span>
                </div>
              </div>
            </div>

            {/* Quick Examples */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Examples</h3>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setInputVal(ex)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-xs text-blue-200 font-mono transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 text-center">
          <p className="text-xs text-gray-600">
            Powered by Custom Safe Math Engine
          </p>
        </div>

      </div>
    </div>
  );
}
