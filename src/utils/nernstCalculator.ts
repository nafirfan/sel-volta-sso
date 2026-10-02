import { ELECTRODES } from '../constants/electrodes';
import { MetalId, NernstCalculationResult } from '../types/electrochemistry';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function calculateNernst(
  anodeId: MetalId,
  cathodeId: MetalId,
  anodeConc: number,
  cathodeConc: number
): NernstCalculationResult {
  const anode = ELECTRODES[anodeId];
  const cathode = ELECTRODES[cathodeId];

  const E0_anode = anode.standardReductionPotential;
  const E0_cathode = cathode.standardReductionPotential;
  const E0_cell = Number((E0_cathode - E0_anode).toFixed(3));

  // Determine electron transfer n and stoichiometric coefficients
  const vA = anode.valency;
  const vK = cathode.valency;
  const n = lcm(vA, vK);
  const anodeCoeff = n / vA;
  const cathodeCoeff = n / vK;

  // Q = [Anode_ion]^anodeCoeff / [Cathode_ion]^cathodeCoeff
  const numerator = Math.pow(anodeConc, anodeCoeff);
  const denominator = Math.pow(cathodeConc, cathodeCoeff);
  const reactionQuotientQ = numerator / denominator;
  const logQ = Math.log10(reactionQuotientQ);

  // Nernst Equation: E_sel = E0_sel - (0.0592 / n) * log10(Q)
  const nernstFactor = 0.0592 / n;
  const nernstCorrection = Number((nernstFactor * logQ).toFixed(4));
  const rawE_cell = E0_cell - nernstCorrection;
  const E_cell = Number(rawE_cell.toFixed(3));
  const isSpontaneous = E_cell > 0;

  // Formatting Cell Notation: Anoda(s) | Ion_Anoda(aq, C1 M) || Ion_Katoda(aq, C2 M) | Katoda(s)
  const cellNotation = `${anode.symbol}(s) | ${anode.ionSymbol}(aq, ${anodeConc.toFixed(2)} M) || ${cathode.ionSymbol}(aq, ${cathodeConc.toFixed(2)} M) | ${cathode.symbol}(s)`;

  // Half-reactions
  const oxElec = vA > 1 ? `${vA}e⁻` : `e⁻`;
  const redElec = vK > 1 ? `${vK}e⁻` : `e⁻`;
  const oxidationHalfReaction = `${anode.symbol}(s) → ${anode.ionSymbol}(aq) + ${oxElec}`;
  const reductionHalfReaction = `${cathode.ionSymbol}(aq) + ${redElec} → ${cathode.symbol}(s)`;

  // Overall balanced redox reaction
  const anSolidCoeffStr = anodeCoeff > 1 ? `${anodeCoeff}` : '';
  const anIonCoeffStr = anodeCoeff > 1 ? `${anodeCoeff}` : '';
  const catIonCoeffStr = cathodeCoeff > 1 ? `${cathodeCoeff}` : '';
  const catSolidCoeffStr = cathodeCoeff > 1 ? `${cathodeCoeff}` : '';

  const overallRedoxReaction = `${anSolidCoeffStr}${anode.symbol}(s) + ${catIonCoeffStr}${cathode.ionSymbol}(aq) → ${anIonCoeffStr}${anode.ionSymbol}(aq) + ${catSolidCoeffStr}${cathode.symbol}(s)`;

  return {
    E0_anode,
    E0_cathode,
    E0_cell,
    n,
    anodeCoeff,
    cathodeCoeff,
    reactionQuotientQ,
    logQ,
    nernstCorrection,
    E_cell,
    isSpontaneous,
    cellNotation,
    oxidationHalfReaction,
    reductionHalfReaction,
    overallRedoxReaction,
  };
}
