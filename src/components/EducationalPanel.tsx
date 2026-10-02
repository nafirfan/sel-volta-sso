import React, { useState } from 'react';
import { ELECTRODES } from '../constants/electrodes';
import { MetalId, NernstCalculationResult } from '../types/electrochemistry';
import { BookOpen, Calculator, Layers, ArrowRight, Zap, CheckCircle2, AlertTriangle, HelpCircle, Info } from 'lucide-react';

interface Props {
  anodeId: MetalId;
  cathodeId: MetalId;
  anodeConc: number;
  cathodeConc: number;
  isSwitchOn: boolean;
  nernstData: NernstCalculationResult;
}

export const EducationalPanel: React.FC<Props> = ({
  anodeId,
  cathodeId,
  anodeConc,
  cathodeConc,
  isSwitchOn,
  nernstData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reactions' | 'nernst' | 'voltaSeries'>('reactions');

  const anode = ELECTRODES[anodeId];
  const cathode = ELECTRODES[cathodeId];

  // Deret Volta metals list for reference
  const voltaSeries = [
    { s: 'Li', e: -3.04 },
    { s: 'K', e: -2.92 },
    { s: 'Ba', e: -2.90 },
    { s: 'Ca', e: -2.87 },
    { s: 'Na', e: -2.71 },
    { s: 'Mg', e: -2.37, active: anodeId === 'Mg' || cathodeId === 'Mg' },
    { s: 'Al', e: -1.66 },
    { s: 'Mn', e: -1.18 },
    { s: 'Zn', e: -0.76, active: anodeId === 'Zn' || cathodeId === 'Zn' },
    { s: 'Cr', e: -0.74 },
    { s: 'Fe', e: -0.44, active: anodeId === 'Fe' || cathodeId === 'Fe' },
    { s: 'Ni', e: -0.25 },
    { s: 'Sn', e: -0.14 },
    { s: 'Pb', e: -0.13 },
    { s: 'H', e: 0.00 },
    { s: 'Cu', e: +0.34, active: anodeId === 'Cu' || cathodeId === 'Cu' },
    { s: 'Hg', e: +0.79 },
    { s: 'Ag', e: +0.80, active: anodeId === 'Ag' || cathodeId === 'Ag' },
    { s: 'Pt', e: +1.20 },
    { s: 'Au', e: +1.50 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Tab navigation */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Panel Edukasi & Analisis Reaksi Kimia
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveSubTab('reactions')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeSubTab === 'reactions'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Notasi & Reaksi
          </button>
          <button
            onClick={() => setActiveSubTab('nernst')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeSubTab === 'nernst'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Langkah Persamaan Nernst
          </button>
          <button
            onClick={() => setActiveSubTab('voltaSeries')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeSubTab === 'voltaSeries'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deret Volta & Potensial
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {activeSubTab === 'reactions' && (
          <div className="space-y-4">
            {/* Cell Notation Banner */}
            <div className="p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Notasi Sel Volta (Diagram Sel)</span>
                <span className="text-slate-400 font-normal">Anoda | Ion Anoda || Ion Katoda | Katoda</span>
              </div>
              <div className="text-base sm:text-lg font-mono font-bold text-slate-100 tracking-wide bg-slate-900/90 py-2 px-3 rounded-lg border border-slate-800 text-center">
                <span className="text-sky-400">{anode.symbol}(s)</span>
                <span className="text-slate-500 mx-1">|</span>
                <span className="text-sky-300">{anode.ionSymbol}(aq, {anodeConc.toFixed(2)} M)</span>
                <span className="text-purple-400 mx-2 font-black">||</span>
                <span className="text-rose-300">{cathode.ionSymbol}(aq, {cathodeConc.toFixed(2)} M)</span>
                <span className="text-slate-500 mx-1">|</span>
                <span className="text-rose-400">{cathode.symbol}(s)</span>
              </div>
            </div>

            {/* Reaction Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Anode Half-reaction */}
              <div className="p-3 bg-slate-950/70 border border-sky-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Anoda (Oksidasi) [-]
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    E° = {anode.standardReductionPotential > 0 ? '+' : ''}{anode.standardReductionPotential.toFixed(2)} V
                  </span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-sky-200 text-center font-bold">
                  {nernstData.oxidationHalfReaction}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Logam <strong className="text-slate-200">{anode.name}</strong> melepaskan elektron, larut membentuk ion {anode.ionSymbol}. Batang anoda <strong className="text-sky-300">berkurang massanya</strong>.
                </p>
              </div>

              {/* Cathode Half-reaction */}
              <div className="p-3 bg-slate-950/70 border border-rose-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Katoda (Reduksi) [+]
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    E° = {cathode.standardReductionPotential > 0 ? '+' : ''}{cathode.standardReductionPotential.toFixed(2)} V
                  </span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-rose-200 text-center font-bold">
                  {nernstData.reductionHalfReaction}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Kation <strong className="text-slate-200">{cathode.ionName}</strong> menyerap elektron dari anoda, mengendap pada batang. Massa katoda <strong className="text-rose-300">bertambah</strong>.
                </p>
              </div>

              {/* Overall Redox */}
              <div className="p-3 bg-slate-950/70 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Reaksi Redoks Total
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    E°_sel = {nernstData.E0_cell > 0 ? '+' : ''}{nernstData.E0_cell.toFixed(2)} V
                  </span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-200 text-center font-bold">
                  {nernstData.overallRedoxReaction}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Transfer muatan setara: <strong className="text-emerald-300">n = {nernstData.n} mol elektron</strong> per siklus reaksi stoikiometri penuh.
                </p>
              </div>
            </div>

            {/* Quick Principles Banner */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-0.5">Arah Aliran Elektron vs Arus Listrik</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Elektron mengalir secara fisik melalui kawat dari <strong className="text-sky-300">Anoda (kutub negatif)</strong> menuju <strong className="text-rose-300">Katoda (kutub positif)</strong>. Arus konvensional didefinisikan ke arah sebaliknya.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-0.5">Fungsi Jembatan Garam</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Menjembatani sirkuit internal dan menjaga kenetralan muatan larutan dengan menyalurkan <strong className="text-purple-300">anion ke bejana anoda</strong> dan <strong className="text-purple-300">kation ke bejana katoda</strong> tanpa percampuran larutan langsung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'nernst' && (
          <div className="space-y-4">
            {/* Nernst Formula Overview */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  Formula Persamaan Nernst (T = 298 K / 25°C)
                </span>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  E_sel = E°_sel - (0,0592 / n) · log Q
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Persamaan Nernst memungkinkan perhitungan potensial sel nyata ketika konsentrasi ion elektrolit berada pada kondisi non-standar (berbeda dari 1,00 M standar).
              </p>
            </div>

            {/* Step-by-Step Calculation Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Langkah 1: Menghitung E°_sel Standar</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    E°_sel = E°_katoda - E°_anoda
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  E°_sel = ({cathode.standardReductionPotential > 0 ? '+' : ''}{cathode.standardReductionPotential.toFixed(2)}) - ({anode.standardReductionPotential > 0 ? '+' : ''}{anode.standardReductionPotential.toFixed(2)}) V<br />
                  <strong className="text-cyan-300 font-bold">E°_sel = {nernstData.E0_cell > 0 ? '+' : ''}{nernstData.E0_cell.toFixed(3)} V</strong>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Langkah 2: Menentukan n dan Nilai Q</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    Q = [Produk]^p / [Reaktan]^q
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  Jumlah mol elektron n = <strong className="text-cyan-300">{nernstData.n}</strong><br />
                  Q = [{anode.ionSymbol}]^{nernstData.anodeCoeff} / [{cathode.ionSymbol}]^{nernstData.cathodeCoeff} = ({anodeConc.toFixed(2)})^{nernstData.anodeCoeff} / ({cathodeConc.toFixed(2)})^{nernstData.cathodeCoeff}<br />
                  <strong className="text-cyan-300 font-bold">Q = {nernstData.reactionQuotientQ.toFixed(4)}</strong> (log₁₀ Q = {nernstData.logQ.toFixed(4)})
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Langkah 3: Menghitung Koreksi Nernst</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    ΔE = (0,0592 / n) · log Q
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  ΔE = (0,0592 / {nernstData.n}) · ({nernstData.logQ.toFixed(4)})<br />
                  ΔE = {(0.0592 / nernstData.n).toFixed(4)} · ({nernstData.logQ.toFixed(4)})<br />
                  <strong className="text-cyan-300 font-bold">Koreksi = {nernstData.nernstCorrection >= 0 ? '+' : ''}{nernstData.nernstCorrection.toFixed(4)} V</strong>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Langkah 4: Hasil Akhir Potensial Sel</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    E_sel = E°_sel - Koreksi
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  E_sel = {nernstData.E0_cell.toFixed(3)} - ({nernstData.nernstCorrection.toFixed(4)})<br />
                  <strong className="text-emerald-400 text-sm font-bold">
                    E_sel = {nernstData.E_cell >= 0 ? '+' : ''}{nernstData.E_cell.toFixed(3)} Volt
                  </strong>
                </div>
              </div>
            </div>

            {/* Le Chatelier & Concentration effect insight */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl flex items-start gap-2 text-xs text-cyan-200">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-cyan-300">Prinsip Le Chatelier pada Sel Volta:</strong>{' '}
                Menaikkan konsentrasi reaktan ion katoda [{cathode.ionSymbol}] menggeser kesetimbangan ke kanan sehingga memperbesar potensial sel (E<sub>sel</sub> naik). Sebaliknya, menaikkan konsentrasi produk ion anoda [{anode.ionSymbol}] menurunkan potensial sel (E<sub>sel</sub> turun).
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'voltaSeries' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Deret Volta (Aktivitas Logam)
                </span>
                <span className="text-[11px] text-slate-400">
                  Kiri: Mudah Oksidasi (Reduktor) ➔ Kanan: Mudah Reduksi (Oksidator)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Logam di sebelah kiri memiliki potensial elektroda standar ($E^\circ$) lebih negatif, bertindak sebagai <strong>Anoda (mengalami oksidasi)</strong> terhadap logam di sebelah kanannya.
              </p>

              {/* Volta strip visualizer */}
              <div className="flex flex-wrap items-center gap-1.5 py-2">
                {voltaSeries.map((item) => (
                  <div
                    key={item.s}
                    className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                      item.s === anode.symbol
                        ? 'bg-sky-600/30 border-sky-400 text-sky-200 font-bold scale-105'
                        : item.s === cathode.symbol
                        ? 'bg-rose-600/30 border-rose-400 text-rose-200 font-bold scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{item.s}</div>
                    <div className="text-[9px] font-mono text-slate-500">
                      {item.e > 0 ? `+${item.e}` : item.e}V
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/70 border border-sky-900/40 rounded-xl">
                <div className="font-semibold text-sky-300 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Posisi Anoda Terpilih: {anode.name} ({anode.symbol})
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Logam {anode.symbol} memiliki E° = {anode.standardReductionPotential.toFixed(2)} V. Karena posisinya lebih ke kiri (E° lebih kecil/negatif), atom {anode.symbol} mendesak ion {cathode.symbol} dan bertindak sebagai donor elektron (pereduksi).
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-rose-900/40 rounded-xl">
                <div className="font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Posisi Katoda Terpilih: {cathode.name} ({cathode.symbol})
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Logam {cathode.symbol} memiliki E° = +{cathode.standardReductionPotential.toFixed(2)} V. Karena posisinya lebih ke kanan (E° lebih besar/positif), ion {cathode.ionSymbol} bertindak sebagai akseptor elektron (pengoksidasi).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
