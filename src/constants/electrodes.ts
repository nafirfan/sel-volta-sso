import { ElectrodeData, MetalId, PresetPair } from '../types/electrochemistry';

export const ELECTRODES: Record<MetalId, ElectrodeData> = {
  Mg: {
    id: 'Mg',
    name: 'Magnesium',
    symbol: 'Mg',
    ionSymbol: 'Mg²⁺',
    ionName: 'Magnesium(II)',
    saltFormula: 'MgSO₄',
    valency: 2,
    standardReductionPotential: -2.37,
    color: '#D4D8DD', // bright silvery grey
    accentColor: '#9CA3AF',
    solutionColor: 'rgba(230, 240, 255, 0.25)', // almost clear/colorless with slight shimmer
    solutionHex: '#E2E8F0',
    depositColor: '#C0C5CC',
    description: 'Logam reaktif golongan 2, agen pereduksi (reduktor) sangat kuat dengan E° = -2,37 V.'
  },
  Zn: {
    id: 'Zn',
    name: 'Seng (Zinc)',
    symbol: 'Zn',
    ionSymbol: 'Zn²⁺',
    ionName: 'Seng(II)',
    saltFormula: 'ZnSO₄',
    valency: 2,
    standardReductionPotential: -0.76,
    color: '#B0B8C4', // bluish silver grey
    accentColor: '#64748B',
    solutionColor: 'rgba(225, 235, 245, 0.28)', // clear transparent aqueous solution
    solutionHex: '#CBD5E1',
    depositColor: '#94A3B8',
    description: 'Logam standar anoda pada Sel Daniell, mudah teroksidasi melepaskan 2 elektron dengan E° = -0,76 V.'
  },
  Fe: {
    id: 'Fe',
    name: 'Besi (Iron)',
    symbol: 'Fe',
    ionSymbol: 'Fe²⁺',
    ionName: 'Besi(II)',
    saltFormula: 'FeSO₄',
    valency: 2,
    standardReductionPotential: -0.44,
    color: '#8A95A5', // dark steel slate
    accentColor: '#475569',
    solutionColor: 'rgba(167, 243, 208, 0.40)', // pale green (khas ion Fe²⁺ terhidrasi)
    solutionHex: '#A7F3D0',
    depositColor: '#64748B',
    description: 'Logam transisi dengan larutan ion Fe²⁺ berwarna hijau muda pucat, E° = -0,44 V.'
  },
  Cu: {
    id: 'Cu',
    name: 'Tembaga (Copper)',
    symbol: 'Cu',
    ionSymbol: 'Cu²⁺',
    ionName: 'Tembaga(II)',
    saltFormula: 'CuSO₄',
    valency: 2,
    standardReductionPotential: 0.34,
    color: '#D97746', // copper bronze orange
    accentColor: '#B45309',
    solutionColor: 'rgba(56, 189, 248, 0.50)', // intense cyan / royal blue sky
    solutionHex: '#38BDF8',
    depositColor: '#C25E30',
    description: 'Logam katoda standar pada Sel Daniell; ion Cu²⁺ berwarna biru menyerap elektron membentuk endapan tembaga merah bata.'
  },
  Ag: {
    id: 'Ag',
    name: 'Perak (Silver)',
    symbol: 'Ag',
    ionSymbol: 'Ag⁺',
    ionName: 'Perak(I)',
    saltFormula: 'AgNO₃',
    valency: 1,
    standardReductionPotential: 0.80,
    color: '#E8ECF2', // lustrous reflective white silver
    accentColor: '#94A3B8',
    solutionColor: 'rgba(241, 245, 249, 0.30)', // clear colorless aqueous AgNO3
    solutionHex: '#F1F5F9',
    depositColor: '#F8FAFC',
    description: 'Logam mulia dengan potensial reduksi tinggi (+0,80 V); menerima 1 elektron per ion membentuk kristal perak berkilau di katoda.'
  }
};

export const PRESET_PAIRS: PresetPair[] = [
  {
    id: 'pair-1',
    title: 'Pasangan 1: Sel Daniell Standar (Zn || Cu)',
    subtitle: 'Anoda Zn / ZnSO₄ & Katoda Cu / CuSO₄',
    anodeId: 'Zn',
    cathodeId: 'Cu',
    standardE0: 1.10,
    anodeConcentration: 1.0,
    cathodeConcentration: 1.0,
    highlightText: 'Sistem klasik John Frederic Daniell (1836). Nilai E° standar = +1,10 V.'
  },
  {
    id: 'pair-2',
    title: 'Pasangan 2: Tegangan Tinggi (Mg || Cu)',
    subtitle: 'Anoda Mg / MgSO₄ & Katoda Cu / CuSO₄',
    anodeId: 'Mg',
    cathodeId: 'Cu',
    standardE0: 2.71,
    anodeConcentration: 1.0,
    cathodeConcentration: 1.0,
    highlightText: 'Beda potensial sangat tinggi (+2,71 V) karena Mg sangat elektropositif dan reduktor kuat.'
  },
  {
    id: 'pair-3',
    title: 'Pasangan 3: Beda Potensial Sedang (Fe || Cu)',
    subtitle: 'Anoda Fe / FeSO₄ & Katoda Cu / CuSO₄',
    anodeId: 'Fe',
    cathodeId: 'Cu',
    standardE0: 0.78,
    anodeConcentration: 1.0,
    cathodeConcentration: 1.0,
    highlightText: 'Reaksi redoks besi-tembaga menghasilkan E° = +0,78 V dengan larutan Fe²⁺ hijau pucat.'
  },
  {
    id: 'pair-4',
    title: 'Pasangan 4: Transfer Multi-Elektron (Zn || Ag)',
    subtitle: 'Anoda Zn / ZnSO₄ & Katoda Ag / AgNO₃',
    anodeId: 'Zn',
    cathodeId: 'Ag',
    standardE0: 1.56,
    anodeConcentration: 1.0,
    cathodeConcentration: 1.0,
    highlightText: 'Reaksi stoikiometri n = 2 elektron: Zn + 2Ag⁺ → Zn²⁺ + 2Ag dengan Q = [Zn²⁺]/[Ag⁺]².'
  }
];
