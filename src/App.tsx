import React, { useState, useEffect } from 'react';
import { ELECTRODES, PRESET_PAIRS } from './constants/electrodes';
import { MetalId, NernstCalculationResult, ObservationItem } from './types/electrochemistry';
import { calculateNernst } from './utils/nernstCalculator';
import { VoltaicSimulationCanvas } from './components/VoltaicSimulationCanvas';
import { MicroscopicMagnifier } from './components/MicroscopicMagnifier';
import { EducationalPanel } from './components/EducationalPanel';
import { LKPDModal } from './components/LKPDModal';
import { ConceptQuizModal } from './components/ConceptQuizModal';
import { generateStandaloneHtml } from './utils/generateSingleHtml';
import {
  Zap,
  RotateCcw,
  Sliders,
  FileSpreadsheet,
  GraduationCap,
  Download,
  Info,
  Layers,
  Sparkles,
  FlaskConical,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Primary simulation state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pair-1');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [anodeId, setAnodeId] = useState<MetalId>('Zn');
  const [cathodeId, setCathodeId] = useState<MetalId>('Cu');
  const [anodeConc, setAnodeConc] = useState<number>(1.0);
  const [cathodeConc, setCathodeConc] = useState<number>(1.0);
  const [isSwitchOn, setIsSwitchOn] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  // Microscopic view tab
  const [microTab, setMicroTab] = useState<'anode' | 'cathode' | 'saltbridge'>('anode');

  // Modals state
  const [isLKPDOpen, setIsLKPDOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  // Observations log for LKPD
  const [observations, setObservations] = useState<ObservationItem[]>([
    {
      id: 'init-1',
      timestamp: '10:00:15',
      pairName: 'Sel Daniell (Zn || Cu)',
      anodeMetal: 'Zn (s)',
      anodeConc: 1.0,
      cathodeMetal: 'Cu (s)',
      cathodeConc: 1.0,
      E0_theory: 1.10,
      E_measured: 1.10,
      notes: 'Kondisi standar 1,00 M. Voltmeter stabil di +1,10 V, elektron mengalir dari Zn ke Cu.'
    }
  ]);

  // Scientific calculation result
  const nernstData: NernstCalculationResult = calculateNernst(
    anodeId,
    cathodeId,
    anodeConc,
    cathodeConc
  );

  // Simulation timer when Switch is ON
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSwitchOn) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1 * speedMultiplier);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSwitchOn, speedMultiplier]);

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_PAIRS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
    setAnodeId(preset.anodeId);
    setCathodeId(preset.cathodeId);
    setAnodeConc(preset.anodeConcentration);
    setCathodeConc(preset.cathodeConcentration);
    setElapsedTime(0);
  };

  // Toggle switch
  const handleToggleSwitch = () => {
    setIsSwitchOn((prev) => !prev);
  };

  // Reset simulation condition
  const handleReset = () => {
    setElapsedTime(0);
    setAnodeConc(1.0);
    setCathodeConc(1.0);
    setIsSwitchOn(true);
  };

  // Add observation record to LKPD
  const handleAddObservation = (notes: string) => {
    const anode = ELECTRODES[anodeId];
    const cathode = ELECTRODES[cathodeId];
    const newRecord: ObservationItem = {
      id: `obs-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      pairName: isCustomMode ? `${anode.symbol} || ${cathode.symbol}` : (PRESET_PAIRS.find(p => p.id === selectedPresetId)?.title || 'Eksperimen'),
      anodeMetal: `${anode.symbol} (s)`,
      anodeConc,
      cathodeMetal: `${cathode.symbol} (s)`,
      cathodeConc,
      E0_theory: nernstData.E0_cell,
      E_measured: nernstData.E_cell,
      notes,
    };
    setObservations((prev) => [newRecord, ...prev]);
  };

  const handleRemoveObservation = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
  };

  const handleClearAllObservations = () => {
    setObservations([]);
  };

  // Download standalone index.html
  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    const htmlContent = generateStandaloneHtml();
    navigator.clipboard.writeText(htmlContent).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  Laboratorium Virtual Sel Volta SMA
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Kimia Kelas XII
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Simulasi Interaktif Elektrokimia: Makroskopik, Mikroskopik, & Persamaan Nernst
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLKPDOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Buka Lembar Kerja Peserta Didik"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>LKPD Virtual</span>
              {observations.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {observations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Kuis Uji Pemahaman Konsep"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Kuis Konsep</span>
            </button>

            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all active:scale-95"
              title="Unduh index.html Mandiri (Netlify Ready)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh index.html Mandiri (Netlify)</span>
              <span className="sm:hidden">index.html</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================================================== */}
        {/* LEFT COLUMN: CONTROLS & EXPERIMENT SETTINGS (4 COLS) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* Preset Pairs Selector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pasangan Elektroda & Elektrolit
                </h2>
              </div>
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                  isCustomMode
                    ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isCustomMode ? 'Kembali ke Preset' : 'Mode Kustom'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="space-y-2">
                {PRESET_PAIRS.map((pair) => {
                  const isSelected = selectedPresetId === pair.id;
                  const an = ELECTRODES[pair.anodeId];
                  const cat = ELECTRODES[pair.cathodeId];
                  return (
                    <button
                      key={pair.id}
                      onClick={() => handleSelectPreset(pair.id)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/60 border-slate-800/90 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {pair.title}
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-emerald-400">
                          +{pair.standardE0.toFixed(2)} V
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {pair.subtitle}
                      </div>
                      {isSelected && (
                        <div className="mt-1.5 text-[10px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                          {pair.highlightText}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Custom Electrode Selection */
              <div className="space-y-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <label className="block text-sky-400 font-semibold mb-1">
                    Pilih Logam Anoda (Oksidasi):
                  </label>
                  <select
                    value={anodeId}
                    onChange={(e) => {
                      setAnodeId(e.target.value as MetalId);
                      setElapsedTime(0);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Mg">Magnesium (Mg) | E° = -2,37 V</option>
                    <option value="Zn">Seng (Zn) | E° = -0,76 V</option>
                    <option value="Fe">Besi (Fe) | E° = -0,44 V</option>
                    <option value="Cu">Tembaga (Cu) | E° = +0,34 V</option>
                    <option value="Ag">Perak (Ag) | E° = +0,80 V</option>
                  </select>
                </div>

                <div>
                  <label className="block text-rose-400 font-semibold mb-1">
                    Pilih Logam Katoda (Reduksi):
                  </label>
                  <select
                    value={cathodeId}
                    onChange={(e) => {
                      setCathodeId(e.target.value as MetalId);
                      setElapsedTime(0);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="Cu">Tembaga (Cu) | E° = +0,34 V</option>
                    <option value="Ag">Perak (Ag) | E° = +0,80 V</option>
                    <option value="Fe">Besi (Fe) | E° = -0,44 V</option>
                    <option value="Zn">Seng (Zn) | E° = -0,76 V</option>
                    <option value="Mg">Magnesium (Mg) | E° = -2,37 V</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Concentration Sliders Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Pengaturan Konsentrasi Larutan
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">0.1 M - 2.0 M</span>
            </div>

            {/* Anode Solution Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  [{ELECTRODES[anodeId].ionSymbol}] Larutan Anoda ({ELECTRODES[anodeId].saltFormula})
                </span>
                <span className="font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {anodeConc.toFixed(2)} M
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={anodeConc}
                onChange={(e) => setAnodeConc(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.10 M</span>
                <span>1.00 M (Standar)</span>
                <span>2.00 M</span>
              </div>
            </div>

            {/* Cathode Solution Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  [{ELECTRODES[cathodeId].ionSymbol}] Larutan Katoda ({ELECTRODES[cathodeId].saltFormula})
                </span>
                <span className="font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {cathodeConc.toFixed(2)} M
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={cathodeConc}
                onChange={(e) => setCathodeConc(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.10 M</span>
                <span>1.00 M (Standar)</span>
                <span>2.00 M</span>
              </div>
            </div>

            {/* Quick concentration preset chips */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Variasi Cepat:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setAnodeConc(1.0); setCathodeConc(1.0); }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono transition-colors"
                >
                  Standar (1M:1M)
                </button>
                <button
                  onClick={() => { setAnodeConc(0.1); setCathodeConc(2.0); }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono transition-colors"
                  title="E sel meningkat maksimal"
                >
                  E_sel Maks
                </button>
                <button
                  onClick={() => { setAnodeConc(2.0); setCathodeConc(0.1); }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono transition-colors"
                  title="E sel menurun"
                >
                  E_sel Min
                </button>
              </div>
            </div>
          </div>

          {/* Primary Operations & Simulation Speed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Kontrol Sirkuit & Kecepatan
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleSwitch}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isSwitchOn
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isSwitchOn ? 'SAKELAR [ON]' : 'SAKELAR [OFF]'}</span>
              </button>

              <button
                onClick={handleReset}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Eksperimen</span>
              </button>
            </div>

            {/* Speed selection */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Kecepatan Animasi:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                      speedMultiplier === s
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Instrument Overview Card */}
          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 shadow-xl space-y-2 text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Voltmeter Digital (Beda Potensial Nyata)
            </div>
            <div
              className={`font-mono text-3xl font-extrabold tracking-wider ${
                isSwitchOn
                  ? nernstData.isSpontaneous
                    ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                    : 'text-rose-400'
                  : 'text-slate-600'
              }`}
            >
              {isSwitchOn
                ? `${nernstData.E_cell >= 0 ? '+' : ''}${nernstData.E_cell.toFixed(3)} V`
                : '0.000 V'}
            </div>
            <div className="text-xs flex items-center justify-center gap-2">
              <span className="text-slate-400">Potensial Standar:</span>
              <span className="font-mono text-slate-200 font-bold">
                E°_sel = {nernstData.E0_cell > 0 ? '+' : ''}{nernstData.E0_cell.toFixed(2)} V
              </span>
            </div>
            {isSwitchOn && (
              <div
                className={`text-[11px] font-semibold flex items-center justify-center gap-1 ${
                  nernstData.isSpontaneous ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {nernstData.isSpontaneous ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reaksi Berlangsung Spontan</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Reaksi Non-Spontan (Membutuhkan Arus Luar)</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: SIMULATION CANVAS, MICROSCOPIC, EDU PANEL */}
        {/* ======================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Macro Visualizer Canvas */}
          <VoltaicSimulationCanvas
            anodeId={anodeId}
            cathodeId={cathodeId}
            anodeConc={anodeConc}
            cathodeConc={cathodeConc}
            isSwitchOn={isSwitchOn}
            onToggleSwitch={handleToggleSwitch}
            onReset={handleReset}
            nernstData={nernstData}
            elapsedTime={elapsedTime}
            speedMultiplier={speedMultiplier}
            onSelectMicroscopicTab={(tab) => setMicroTab(tab)}
          />

          {/* 2. Microscopic View / Magnifier Inset */}
          <MicroscopicMagnifier
            anodeId={anodeId}
            cathodeId={cathodeId}
            anodeConc={anodeConc}
            cathodeConc={cathodeConc}
            isSwitchOn={isSwitchOn}
            nernstData={nernstData}
            activeTab={microTab}
            onSelectTab={(tab) => setMicroTab(tab)}
          />

          {/* 3. Educational & Chemical Reaction Panel */}
          <EducationalPanel
            anodeId={anodeId}
            cathodeId={cathodeId}
            anodeConc={anodeConc}
            cathodeConc={cathodeConc}
            isSwitchOn={isSwitchOn}
            nernstData={nernstData}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div>
          Laboratorium Virtual Sel Volta SMA · Standar Kurikulum Kimia Elektrokimia SMA / MA Kelas XII
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>© 2026 Pengembang Instruksional Kimia</span>
          <span>·</span>
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Deploy ke Netlify (index.html)
          </button>
        </div>
      </footer>

      {/* LKPD Virtual Modal */}
      <LKPDModal
        isOpen={isLKPDOpen}
        onClose={() => setIsLKPDOpen(false)}
        observations={observations}
        onAddCurrentObservation={handleAddObservation}
        onRemoveObservation={handleRemoveObservation}
        onClearAll={handleClearAllObservations}
      />

      {/* Concept Quiz Modal */}
      <ConceptQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      {/* Standalone Netlify Ready HTML Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Kode index.html Tunggal (Siap Deploy Langsung ke Netlify)
                  </h2>
                  <p className="text-xs text-slate-400">
                    File mandiri berisi seluruh HTML, Tailwind CSS CDN, Canvas simulasi, dan JavaScript tanpa perlu build npm/Node.js.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Instructions & Actions */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-200 space-y-2">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Cara Deploy Instan ke Netlify Drop:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                  <li>Klik tombol hijau <strong>"Unduh File index.html"</strong> di bawah ini.</li>
                  <li>Masukkan file <code>index.html</code> tersebut ke dalam satu folder kosong (misal: folder bernama <code>sel-volta-lab</code>).</li>
                  <li>Buka browser dan kunjungi <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">app.netlify.com/drop</a>.</li>
                  <li>Drag & drop folder tersebut ke area Netlify Drop. Aplikasi web virtual lab Anda akan langsung online aktif dalam hitungan detik!</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File index.html Sekarang</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
                >
                  {codeCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Kode Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Seluruh Kode HTML</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code preview box */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Pratinjau Kode Sumber index.html</span>
                  <span>~400 baris kode murni</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto font-mono text-xs text-slate-300">
                  <pre>{generateStandaloneHtml()}</pre>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
