import React, { useEffect, useRef, useState } from 'react';
import { ELECTRODES } from '../constants/electrodes';
import { MetalId, NernstCalculationResult } from '../types/electrochemistry';
import { ZoomIn, Info, ShieldAlert, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  anodeId: MetalId;
  cathodeId: MetalId;
  anodeConc: number;
  cathodeConc: number;
  isSwitchOn: boolean;
  nernstData: NernstCalculationResult;
  activeTab: 'anode' | 'cathode' | 'saltbridge';
  onSelectTab: (tab: 'anode' | 'cathode' | 'saltbridge') => void;
}

export const MicroscopicMagnifier: React.FC<Props> = ({
  anodeId,
  cathodeId,
  anodeConc,
  cathodeConc,
  isSwitchOn,
  nernstData,
  activeTab,
  onSelectTab,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const anode = ELECTRODES[anodeId];
  const cathode = ELECTRODES[cathodeId];

  // Micro-particles state
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    // Generate initial microscopic particles based on active tab
    const p: any[] = [];
    if (activeTab === 'anode') {
      // Free solution ions on the right side
      for (let i = 0; i < 14; i++) {
        p.push({
          x: 280 + Math.random() * 280,
          y: 40 + Math.random() * 220,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          type: 'solution-ion',
          symbol: anode.ionSymbol,
          color: '#38BDF8',
          radius: 12,
        });
      }
      // Detached ions actively moving away
      for (let i = 0; i < 4; i++) {
        p.push({
          x: 200 + Math.random() * 40,
          y: 60 + i * 45,
          vx: 0.8 + Math.random() * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          type: 'dissolving',
          symbol: anode.ionSymbol,
          color: '#38BDF8',
          radius: 12,
        });
      }
    } else if (activeTab === 'cathode') {
      // Approaching ions on the right drifting towards the left lattice
      for (let i = 0; i < 12; i++) {
        p.push({
          x: 240 + Math.random() * 320,
          y: 40 + Math.random() * 220,
          vx: -0.6 - Math.random() * 0.5,
          vy: (Math.random() - 0.5) * 0.4,
          type: 'approaching',
          symbol: cathode.ionSymbol,
          color: '#F59E0B',
          radius: 12,
        });
      }
    } else {
      // Salt bridge: K+ (purple) and NO3- (red)
      for (let i = 0; i < 22; i++) {
        const isK = i % 2 === 0;
        p.push({
          x: Math.random() * 560,
          y: 60 + Math.random() * 160,
          vx: isK ? 1.2 : -1.2,
          vy: (Math.random() - 0.5) * 0.3,
          type: isK ? 'K+' : 'NO3-',
          symbol: isK ? 'K⁺' : 'NO₃⁻',
          color: isK ? '#C084FC' : '#F43F5E',
          radius: 10,
        });
      }
    }
    particlesRef.current = p;
  }, [activeTab, anodeId, cathodeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Microscopic background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 2);
      bg.addColorStop(0, '#090D16');
      bg.addColorStop(1, '#020617');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Circular magnifier vignette overlay
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let r = 80; r < 360; r += 70) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (activeTab === 'anode') {
        // ==========================================
        // ANODE INTERFACE: OXIDATION AT ATOMIC LEVEL
        // ==========================================
        // Left side: Solid metal crystal lattice
        const latticeW = 180;
        const gradLattice = ctx.createLinearGradient(0, 0, latticeW, 0);
        gradLattice.addColorStop(0, '#1E293B');
        gradLattice.addColorStop(1, '#334155');
        ctx.fillStyle = gradLattice;
        ctx.fillRect(0, 0, latticeW, h);

        // Water background for right side
        const solGrad = ctx.createLinearGradient(latticeW, 0, w, 0);
        solGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        solGrad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');
        ctx.fillStyle = solGrad;
        ctx.fillRect(latticeW, 0, w - latticeW, h);

        // Interface dividing line
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(latticeW, 0);
        ctx.lineTo(latticeW, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Metal Crystal Lattice Atoms (neutral M^0)
        const rows = 6;
        const cols = 4;
        const atomRad = 15;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const ax = 35 + c * 38;
            const ay = 35 + r * 44 + (c % 2 === 1 ? 16 : 0);

            // If it's on the boundary and switch is ON, some dissolve
            if (c === cols - 1 && isSwitchOn && (r + Math.floor(tick / 60)) % 3 === 0) {
              // Dissolving atom shimmer
              ctx.beginPath();
              ctx.arc(ax, ay, atomRad + 2, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
              ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(ax, ay, atomRad, 0, Math.PI * 2);
            ctx.fillStyle = anode.color;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#0F172A';
            ctx.font = 'bold 10px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${anode.symbol}⁰`, ax, ay + 3.5);
          }
        }

        // Animated Electrons travelling into wire at top
        if (isSwitchOn && nernstData.isSpontaneous) {
          const eY = (h - (tick * 2.5) % h);
          ctx.beginPath();
          ctx.arc(latticeW - 20, eY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#FDE047';
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = 'bold 7px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('2e⁻', latticeW - 20, eY + 2);

          // Electron trail line
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(latticeW - 20, 0);
          ctx.lineTo(latticeW - 20, h);
          ctx.stroke();

          // Label
          ctx.fillStyle = '#FDE047';
          ctx.font = 'bold 11px system-ui';
          ctx.textAlign = 'left';
          ctx.fillText('▲ Elektron (e⁻) menuju kawat luar', 20, 24);
        }

        // Update solution ions
        particlesRef.current.forEach((p) => {
          if (p.type === 'dissolving') {
            if (isSwitchOn) {
              p.x += p.vx;
              p.y += p.vy;
              if (p.x > w - 40) {
                p.x = latticeW + 10;
                p.y = 50 + Math.random() * (h - 100);
              }
            }
          } else {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < latticeW + 20) { p.x = latticeW + 20; p.vx *= -1; }
            if (p.x > w - 20) { p.x = w - 20; p.vx *= -1; }
            if (p.y < 30) { p.y = 30; p.vy *= -1; }
            if (p.y > h - 30) { p.y = h - 30; p.vy *= -1; }
          }

          // Hydration shell (water dipoles) around ion
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 5, 0, Math.PI * 2);
          ctx.stroke();

          // Hydrated cation
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#0284C7';
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.symbol, p.x, p.y + 3);
        });

      } else if (activeTab === 'cathode') {
        // ==========================================
        // CATHODE INTERFACE: REDUCTION & DEPOSITION
        // ==========================================
        const latticeW = 180;
        const gradLattice = ctx.createLinearGradient(0, 0, latticeW, 0);
        gradLattice.addColorStop(0, '#1E293B');
        gradLattice.addColorStop(1, '#475569');
        ctx.fillStyle = gradLattice;
        ctx.fillRect(0, 0, latticeW, h);

        // Solution background
        const solGrad = ctx.createLinearGradient(latticeW, 0, w, 0);
        solGrad.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
        solGrad.addColorStop(1, 'rgba(245, 158, 11, 0.02)');
        ctx.fillStyle = solGrad;
        ctx.fillRect(latticeW, 0, w - latticeW, h);

        // Interface line
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(latticeW, 0);
        ctx.lineTo(latticeW, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Incoming electrons down from wire
        if (isSwitchOn && nernstData.isSpontaneous) {
          const eY = (tick * 2.5) % h;
          ctx.beginPath();
          ctx.arc(latticeW - 20, eY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#FDE047';
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = 'bold 7px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('2e⁻', latticeW - 20, eY + 2);

          ctx.fillStyle = '#FDE047';
          ctx.font = 'bold 11px system-ui';
          ctx.textAlign = 'left';
          ctx.fillText('▼ Elektron (e⁻) tiba dari kawat luar', 20, 24);
        }

        // Metal Crystal Lattice Atoms
        const rows = 6;
        const cols = 4;
        const atomRad = 15;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const ax = 35 + c * 38;
            const ay = 35 + r * 44 + (c % 2 === 1 ? 16 : 0);

            ctx.beginPath();
            ctx.arc(ax, ay, atomRad, 0, Math.PI * 2);
            ctx.fillStyle = cathode.color;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#0F172A';
            ctx.font = 'bold 10px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${cathode.symbol}⁰`, ax, ay + 3.5);
          }
        }

        // Deposited Layer (extra atoms adhering to boundary)
        const depCount = 5;
        for (let i = 0; i < depCount; i++) {
          const dY = 40 + i * 50;
          ctx.beginPath();
          ctx.arc(latticeW + 6, dY, atomRad - 2, 0, Math.PI * 2);
          ctx.fillStyle = cathode.depositColor;
          ctx.fill();
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 8px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(`${cathode.symbol}⁰`, latticeW + 6, dY + 3);
        }

        // Approaching cations in solution
        particlesRef.current.forEach((p) => {
          if (isSwitchOn && nernstData.isSpontaneous) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < latticeW + 18) {
              // Reached surface, reset to far right
              p.x = w - 40;
              p.y = 40 + Math.random() * (h - 80);
            }
          } else {
            p.x += (Math.random() - 0.5) * 0.5;
            p.y += (Math.random() - 0.5) * 0.5;
          }

          // Hydration ring
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
          ctx.stroke();

          // Cation body
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#D97706';
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.symbol, p.x, p.y + 3);
        });

      } else {
        // ==========================================
        // SALT BRIDGE: IONIC NEUTRALITY MIGRATION
        // ==========================================
        // Cross section of tube with porous glass/agar-agar
        const tubeTop = 50;
        const tubeBottom = 230;
        const tubeH = tubeBottom - tubeTop;

        // Anode Chamber on the left, Cathode Chamber on the right
        ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';
        ctx.fillRect(0, 0, 100, h);
        ctx.fillStyle = 'rgba(225, 29, 72, 0.12)';
        ctx.fillRect(w - 100, 0, 100, h);

        // Salt Bridge Tube body
        ctx.fillStyle = 'rgba(147, 51, 234, 0.15)';
        ctx.fillRect(80, tubeTop, w - 160, tubeH);

        // Porous cotton plugs
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(70, tubeTop, 20, tubeH);
        ctx.fillRect(w - 90, tubeTop, 20, tubeH);

        // Tube borders
        ctx.strokeStyle = '#9333EA';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, tubeTop, w - 160, tubeH);

        // Porous plug labels
        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Sumbat Berpori', 80, tubeBottom + 16);
        ctx.fillText('Sumbat Berpori', w - 80, tubeBottom + 16);

        // Migrating ions K+ (right) and NO3- (left)
        particlesRef.current.forEach((p) => {
          if (isSwitchOn && nernstData.isSpontaneous) {
            p.x += p.vx;
            if (p.type === 'K+' && p.x > w - 70) {
              p.x = 90;
            }
            if (p.type === 'NO3-' && p.x < 70) {
              p.x = w - 90;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 7px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(p.symbol, p.x, p.y + 2.5);
        });

        // Direction indicators
        ctx.fillStyle = '#F43F5E';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('◀ Migrasi Anion NO₃⁻ (Menetralkan kelebihan kation Zn²⁺/Mg²⁺ di Anoda)', w / 2, tubeTop + 24);

        ctx.fillStyle = '#C084FC';
        ctx.fillText('Migrasi Kation K⁺ (Menggantikan kation Cu²⁺/Ag⁺ yang mengendap di Katoda) ▶', w / 2, tubeBottom - 18);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeTab, anodeId, cathodeId, isSwitchOn, nernstData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header with tabs */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <ZoomIn className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Jendela Pembesar Mikroskopik (Tingkat Atomik)
          </h3>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => onSelectTab('anode')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeTab === 'anode'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Antarmuka Anoda
          </button>
          <button
            onClick={() => onSelectTab('cathode')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeTab === 'cathode'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Antarmuka Katoda
          </button>
          <button
            onClick={() => onSelectTab('saltbridge')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeTab === 'saltbridge'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Jembatan Garam
          </button>
        </div>
      </div>

      {/* Canvas viewport */}
      <div className="relative aspect-[16/8] w-full max-h-[340px] bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-full object-contain"
        />

        {/* Inset status notice when switch is off */}
        {!isSwitchOn && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg px-4 py-2 text-center max-w-sm">
              <span className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 mb-1">
                <ShieldAlert className="w-4 h-4" />
                Sirkuit Listrik Terputus (Sakelar OFF)
              </span>
              <p className="text-[11px] text-slate-300">
                Tutup sakelar (posisi ON) untuk mengamati pergerakan elektron, reaksi transfer muatan pada permukaan logam, dan migrasi ion jembatan garam.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chemistry Insight Explanatory Card below Canvas */}
      <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
        {activeTab === 'anode' && (
          <div>
            <div className="flex items-center justify-between font-semibold text-sky-400 mb-1">
              <span>Mekanisme Reaksi Anoda: Oksidasi Logam {anode.name}</span>
              <span className="font-mono text-[11px] bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800 text-sky-300">
                {nernstData.oxidationHalfReaction}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Setiap atom logam <strong className="text-slate-200">{anode.symbol}</strong> pada kisi kristal melepaskan {anode.valency} elektron ke kawat sirkuit luar (mengalir menuju katoda). Ion positif <strong className="text-slate-200">{anode.ionSymbol}</strong> yang terbentuk terhidrasi oleh molekul air dan lepas ke dalam larutan. Akibatnya, <strong className="text-sky-300">massa batang anoda mengikis dan menipis seiring berjalannya reaksi</strong>.
            </p>
          </div>
        )}

        {activeTab === 'cathode' && (
          <div>
            <div className="flex items-center justify-between font-semibold text-rose-400 mb-1">
              <span>Mekanisme Reaksi Katoda: Reduksi Ion {cathode.ionName}</span>
              <span className="font-mono text-[11px] bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800 text-rose-300">
                {nernstData.reductionHalfReaction}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Elektron dari kawat luar tiba di permukaan elektroda katoda. Kation <strong className="text-slate-200">{cathode.ionSymbol}</strong> dari larutan bergerak mendekat, menyerap elektron, dan mengendap menjadi atom logam netral <strong className="text-slate-200">{cathode.symbol}⁰</strong> pada kisi logam. Akibatnya, <strong className="text-rose-300">massa batang katoda bertambah tebal dan terbentuk lapisan endapan logam baru</strong>.
            </p>
          </div>
        )}

        {activeTab === 'saltbridge' && (
          <div>
            <div className="flex items-center justify-between font-semibold text-purple-400 mb-1">
              <span>Peran Vital Jembatan Garam: Menjaga Netralitas Muatan Listrik</span>
              <span className="font-mono text-[11px] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800 text-purple-300">
                K⁺ ➔ Katoda | NO₃⁻ ➔ Anoda
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Jika tidak ada jembatan garam, bejana anoda akan mengalami akumulasi muatan positif (kelebihan {anode.ionSymbol}) dan bejana katoda akan mengalami akumulasi muatan negatif (kehilangan {cathode.ionSymbol}), menyebabkan aliran elektron terhenti seketika. <strong className="text-purple-300">Anion NO₃⁻ berdifusi ke anoda</strong> untuk menetralkan kation baru, sedangkan <strong className="text-purple-300">kation K⁺ berdifusi ke katoda</strong> untuk menetralkan anion yang ditinggalkan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
