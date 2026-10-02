export type MetalId = 'Mg' | 'Zn' | 'Fe' | 'Cu' | 'Ag';

export interface ElectrodeData {
  id: MetalId;
  name: string; // e.g. "Seng (Zinc)"
  symbol: string; // e.g. "Zn"
  ionSymbol: string; // e.g. "Zn²⁺"
  ionName: string; // e.g. "Seng(II)"
  saltFormula: string; // e.g. "ZnSO₄"
  valency: number; // e.g. 2 for Zn²⁺, 1 for Ag⁺
  standardReductionPotential: number; // in Volts, e.g. -0.76
  color: string; // metal color hex/rgb
  accentColor: string; // metal accent
  solutionColor: string; // CSS color of the aqueous solution
  solutionHex: string;
  depositColor: string; // color of the deposited metal layer
  description: string;
}

export interface PresetPair {
  id: string;
  title: string;
  subtitle: string;
  anodeId: MetalId;
  cathodeId: MetalId;
  standardE0: number; // Katoda - Anoda
  anodeConcentration: number;
  cathodeConcentration: number;
  highlightText: string;
}

export interface NernstCalculationResult {
  E0_anode: number;
  E0_cathode: number;
  E0_cell: number;
  n: number; // electrons transferred
  anodeCoeff: number;
  cathodeCoeff: number;
  reactionQuotientQ: number;
  logQ: number;
  nernstCorrection: number; // (0.0592 / n) * log10(Q)
  E_cell: number;
  isSpontaneous: boolean;
  cellNotation: string;
  oxidationHalfReaction: string;
  reductionHalfReaction: string;
  overallRedoxReaction: string;
}

export interface ObservationItem {
  id: string;
  timestamp: string;
  pairName: string;
  anodeMetal: string;
  anodeConc: number;
  cathodeMetal: string;
  cathodeConc: number;
  E0_theory: number;
  E_measured: number;
  notes: string;
}
