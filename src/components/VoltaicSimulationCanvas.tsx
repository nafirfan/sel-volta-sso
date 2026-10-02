import React, { useEffect, useRef, useState } from 'react';
import { ELECTRODES } from '../constants/electrodes';
import { MetalId, NernstCalculationResult } from '../types/electrochemistry';
import { Play, Pause, RotateCcw, ZoomIn, Zap, Eye, Sparkles } from 'lucide-react';

interface Props {
  anodeId: MetalId;
  cathodeId: MetalId;
  anodeConc: number;
  cathodeConc: number;
  isSwitchOn: boolean;
  onToggleSwitch: () => void;
  onReset: () => void;
  nernstData: NernstCalculationResult;
  elapsedTime: number; // in seconds
  speedMultiplier: number;
  onSelectMicroscopicTab: (tab: 'anode' | 'cathode' | 'saltbridge') => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'cation' | 'anion' | 'dissolving' | 'depositing';
  label: string;
  color: string;
  radius: number;
  opacity: number;
  lifetime?: number;
}

interface SaltBridgeIon {
  progress: number; // 0 to 1 along U-path
  speed: number;
  type: 'K+' | 'NO3-';
}

export const VoltaicSimulationCanvas: React.FC<Props> = ({
  anodeId,
  cathodeId,
  anodeConc,
  cathodeConc,
  isSwitchOn,
  onToggleSwitch,
  onReset,
  nernstData,
  elapsedTime,
  speedMultiplier,
  onSelectMicroscopicTab,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Wire electron particle offsets
  const electronOffsetsRef = useRef<number[]>([]);
  // Salt bridge ions
  const saltBridgeIonsRef = useRef<SaltBridgeIon[]>([]);
  // Local solution particles
  const anodeParticlesRef = useRef<Particle[]>([]);
  const cathodeParticlesRef = useRef<Particle[]>([]);

  const anode = ELECTRODES[anodeId];
  const cathode = ELECTRODES[cathodeId];

  // Initialize particles
  useEffect(() => {
    // 16 electrons along wire path
    electronOffsetsRef.current = Array.from({ length: 18 }, (_, i) => i / 18);

    // Salt bridge ions (K+ moves towards cathode, NO3- moves towards anode)
    const sbIons: SaltBridgeIon[] = [];
    for (let i = 0; i < 24; i++) {
      sbIons.push({
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.002,
        type: i % 2 === 0 ? 'K+' : 'NO3-',
      });
    }
    saltBridgeIonsRef.current = sbIons;

    // Beaker particles
    const initParticles = (beakerX: number, beakerY: number, cationLabel: string, cationColor: string) => {
      const p: Particle[] = [];
      const count = 18;
      for (let i = 0; i < count; i++) {
        p.push({
          x: beakerX + 30 + Math.random() * 140,
          y: beakerY + 60 + Math.random() * 110,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          type: i % 2 === 0 ? 'cation' : 'anion',
          label: i % 2 === 0 ? cationLabel : 'SO₄²⁻',
          color: i % 2 === 0 ? cationColor : '#64748B',
          radius: i % 2 === 0 ? 7 : 8,
          opacity: 0.85,
        });
      }
      return p;
    };

    anodeParticlesRef.current = initParticles(160, 260, anode.ionSymbol, '#38BDF8');
    cathodeParticlesRef.current = initParticles(540, 260, cathode.ionSymbol, '#F59E0B');
  }, [anodeId, cathodeId]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Base canvas size: 900 x 500
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. LAB BACKGROUND WITH GRID & WORKBENCH
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(0.75, '#1E293B');
      bgGrad.addColorStop(1, '#0B0F19');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle lab bench surface
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 420, width, 80);
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(0, 420, width, 2);

      // Perspective table bevel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, 422, width, 6);

      // Lab wall lines (scientific tiles)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 420);
        ctx.stroke();
      }
      for (let y = 30; y < 420; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // COORDINATES
      // Left Beaker: x=140..340, y=240..420
      // Right Beaker: x=560..760, y=240..420
      const beakerLeftX = 150;
      const beakerRightX = 570;
      const beakerW = 200;
      const beakerH = 175;
      const beakerY = 245;

      // Thinning of anode and thickening of cathode
      const erosionFactor = isSwitchOn ? Math.min(elapsedTime * 0.015, 0.45) : 0;
      const depositFactor = isSwitchOn ? Math.min(elapsedTime * 0.015, 0.45) : 0;

      // ==========================================
      // 2. BEAKER SOLUTIONS & GLASS
      // ==========================================
      const drawBeaker = (
        bx: number,
        by: number,
        solutionColor: string,
        label: string,
        subLabel: string,
        conc: number,
        isLeft: boolean
      ) => {
        // Solution Fill
        const solGrad = ctx.createLinearGradient(bx, by + 45, bx, by + beakerH);
        solGrad.addColorStop(0, solutionColor);
        solGrad.addColorStop(1, solutionColor);
        ctx.fillStyle = solGrad;

        ctx.beginPath();
        ctx.roundRect(bx + 6, by + 40, beakerW - 12, beakerH - 45, [0, 0, 14, 14]);
        ctx.fill();

        // Liquid Meniscus line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(bx + beakerW / 2, by + 42, beakerW / 2 - 10, 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Volume graduation tick marks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '9px "JetBrains Mono", monospace';
        const gradY = [by + 60, by + 90, by + 120, by + 150];
        const gradLabels = ['200 mL', '150 mL', '100 mL', '50 mL'];
        gradY.forEach((gy, idx) => {
          ctx.beginPath();
          ctx.moveTo(bx + 12, gy);
          ctx.lineTo(bx + (idx % 2 === 0 ? 28 : 22), gy);
          ctx.stroke();
          ctx.fillText(gradLabels[idx], bx + 32, gy + 3);
        });

        // Glass outline & rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bx, by, beakerW, beakerH, [4, 4, 16, 16]);
        ctx.stroke();

        // Glass glossy highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx + 8, by + 20);
        ctx.lineTo(bx + 8, by + beakerH - 20);
        ctx.stroke();

        // Beaker bottom label plate
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(bx + 20, by + beakerH + 6, beakerW - 40, 22);
        ctx.strokeStyle = isLeft ? '#0284C7' : '#E11D48';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + 20, by + beakerH + 6, beakerW - 40, 22);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${label} (${conc.toFixed(2)} M)`, bx + beakerW / 2, by + beakerH + 21);
      };

      // Draw Beakers
      drawBeaker(
        beakerLeftX,
        beakerY,
        anode.solutionColor,
        `Larutan ${anode.saltFormula}`,
        `[${anode.ionSymbol}] = ${anodeConc.toFixed(2)} M`,
        anodeConc,
        true
      );
      drawBeaker(
        beakerRightX,
        beakerY,
        cathode.solutionColor,
        `Larutan ${cathode.saltFormula}`,
        `[${cathode.ionSymbol}] = ${cathodeConc.toFixed(2)} M`,
        cathodeConc,
        false
      );

      // ==========================================
      // 3. ELECTRODES (METALS)
      // ==========================================
      // Anode Electrode (Left)
      const anBaseW = 32;
      const anCurrentW = anBaseW * (1 - erosionFactor * 0.4);
      const anX = beakerLeftX + 50 + (anBaseW - anCurrentW) / 2;
      const anY = beakerY - 30;
      const anH = 150;

      // Anode Metal Bar
      const anGrad = ctx.createLinearGradient(anX, anY, anX + anCurrentW, anY);
      anGrad.addColorStop(0, anode.color);
      anGrad.addColorStop(0.5, '#FFFFFF');
      anGrad.addColorStop(1, anode.accentColor);
      ctx.fillStyle = anGrad;
      ctx.fillRect(anX, anY, anCurrentW, anH);

      // Anode erosion notches if active
      if (isSwitchOn && erosionFactor > 0.05) {
        ctx.fillStyle = anode.solutionColor;
        const pitCount = Math.floor(erosionFactor * 8);
        for (let i = 0; i < pitCount; i++) {
          const py = anY + 70 + (i * 12);
          ctx.beginPath();
          ctx.arc(anX + 2, py, 2 + Math.sin(i) * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(anX + anCurrentW - 2, py + 5, 2 + Math.cos(i) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(anX, anY, anCurrentW, anH);

      // Anode Polarity & Name Label
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(anX - 25, anY - 36, 80, 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`ANODA (-)`, anX + 15, anY - 24);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${anode.symbol} (s)`, anX + 15, anY - 14);

      // Cathode Electrode (Right)
      const catBaseW = 32;
      const catX = beakerRightX + beakerW - 82;
      const catY = beakerY - 30;
      const catH = 150;

      // Cathode Base Metal Bar
      const catGrad = ctx.createLinearGradient(catX, catY, catX + catBaseW, catY);
      catGrad.addColorStop(0, cathode.color);
      catGrad.addColorStop(0.5, '#FFF');
      catGrad.addColorStop(1, cathode.accentColor);
      ctx.fillStyle = catGrad;
      ctx.fillRect(catX, catY, catBaseW, catH);

      // Cathode Deposition Coat (grows when ON)
      if (depositFactor > 0.02) {
        const depW = 3 + depositFactor * 8;
        ctx.fillStyle = cathode.depositColor;
        // Submerged portion gets coating
        ctx.fillRect(catX - depW, catY + 70, catBaseW + depW * 2, catH - 70);

        // Granular crystalline texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 12; i++) {
          ctx.fillRect(catX - depW + (i % 3) * 6, catY + 80 + i * 5, 2, 2);
        }
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(catX, catY, catBaseW, catH);

      // Cathode Polarity & Name Label
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(catX - 25, catY - 36, 80, 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`KATODA (+)`, catX + 15, catY - 24);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${cathode.symbol} (s)`, catX + 15, catY - 14);

      // ==========================================
      // 4. JEMBATAN GARAM (SALT BRIDGE)
      // ==========================================
      // Inverted U tube bridging left & right beakers
      // Center is around x=460, spans from x=280 to x=640
      const sbLeftX = beakerLeftX + beakerW - 55; // 295
      const sbRightX = beakerRightX + 55; // 625
      const sbTopY = beakerY - 15; // 230
      const sbDipY = beakerY + 120; // 365
      const sbTubeRadius = 14;

      // Salt bridge glow / border
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Tube outer glass
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = sbTubeRadius * 2 + 6;
      ctx.beginPath();
      ctx.moveTo(sbLeftX, sbDipY);
      ctx.lineTo(sbLeftX, sbTopY + sbTubeRadius);
      ctx.arcTo(sbLeftX, sbTopY, sbLeftX + sbTubeRadius, sbTopY, sbTubeRadius);
      ctx.lineTo(sbRightX - sbTubeRadius, sbTopY);
      ctx.arcTo(sbRightX, sbTopY, sbRightX, sbTopY + sbTubeRadius, sbTubeRadius);
      ctx.lineTo(sbRightX, sbDipY);
      ctx.stroke();

      // Gel interior (Agar-agar + KNO3)
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.45)'; // soft lavender agar gel
      ctx.lineWidth = sbTubeRadius * 2;
      ctx.beginPath();
      ctx.moveTo(sbLeftX, sbDipY);
      ctx.lineTo(sbLeftX, sbTopY + sbTubeRadius);
      ctx.arcTo(sbLeftX, sbTopY, sbLeftX + sbTubeRadius, sbTopY, sbTubeRadius);
      ctx.lineTo(sbRightX - sbTubeRadius, sbTopY);
      ctx.arcTo(sbRightX, sbTopY, sbRightX, sbTopY + sbTubeRadius, sbTubeRadius);
      ctx.lineTo(sbRightX, sbDipY);
      ctx.stroke();

      // Porous Cotton Plugs at the tips
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(sbLeftX, sbDipY, sbTubeRadius - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sbRightX, sbDipY, sbTubeRadius - 1, 0, Math.PI * 2);
      ctx.fill();

      // Salt Bridge Ion movement along tube path when Switch ON
      if (isSwitchOn && nernstData.isSpontaneous) {
        const step = dt * speedMultiplier;
        const sbPathLength = (sbDipY - sbTopY) + (sbRightX - sbLeftX) + (sbDipY - sbTopY);

        saltBridgeIonsRef.current.forEach((ion) => {
          // K+ moves towards cathode (right), NO3- moves towards anode (left)
          if (ion.type === 'K+') {
            ion.progress += ion.speed * step * 8;
            if (ion.progress > 1) ion.progress = 0;
          } else {
            ion.progress -= ion.speed * step * 8;
            if (ion.progress < 0) ion.progress = 1;
          }

          // Calculate point along inverted U
          const d = ion.progress * sbPathLength;
          const leftVert = sbDipY - sbTopY;
          const horiz = sbRightX - sbLeftX;
          let px = sbLeftX;
          let py = sbDipY;

          if (d < leftVert) {
            // going up left leg
            px = sbLeftX;
            py = sbDipY - d;
          } else if (d < leftVert + horiz) {
            // going across top
            px = sbLeftX + (d - leftVert);
            py = sbTopY;
          } else {
            // going down right leg
            px = sbRightX;
            py = sbTopY + (d - leftVert - horiz);
          }

          // Draw ion
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = ion.type === 'K+' ? '#C084FC' : '#F43F5E';
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 6px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(ion.type === 'K+' ? 'K⁺' : 'NO₃⁻', px, py + 2);
        });
      }

      // Salt bridge label plaque
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#9333EA';
      ctx.lineWidth = 1;
      const sbPlaqueX = (sbLeftX + sbRightX) / 2 - 80;
      ctx.fillRect(sbPlaqueX, sbTopY - 26, 160, 20);
      ctx.strokeRect(sbPlaqueX, sbTopY - 26, 160, 20);
      ctx.fillStyle = '#E9D5FF';
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Jembatan Garam (KNO₃)', (sbLeftX + sbRightX) / 2, sbTopY - 13);

      // ==========================================
      // 5. VOLTMETER & LIGHT BULB & SWITCH
      // ==========================================
      // Voltmeter casing at center-top: x=410..510, y=40..130
      const vmX = 410;
      const vmY = 30;
      const vmW = 120;
      const vmH = 100;

      // Voltmeter shadow & casing
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(vmX, vmY, vmW, vmH, 10);
      ctx.fill();
      ctx.stroke();

      // Voltmeter dial window
      ctx.fillStyle = '#090D16';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(vmX + 10, vmY + 10, vmW - 20, 50, 6);
      ctx.fill();
      ctx.stroke();

      // Analog arc scale: -0.5 V to +3.0 V
      const dialCenterX = vmX + vmW / 2;
      const dialCenterY = vmY + 54;
      const dialRadius = 36;
      ctx.beginPath();
      ctx.arc(dialCenterX, dialCenterY, dialRadius, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Voltmeter needle
      const maxV = 3.0;
      const minV = -0.5;
      const currentVoltage = isSwitchOn ? nernstData.E_cell : 0.0;
      const clampedV = Math.max(minV, Math.min(maxV, currentVoltage));
      const vRatio = (clampedV - minV) / (maxV - minV);
      const needleAngle = Math.PI * 1.15 + vRatio * (Math.PI * 1.85 - Math.PI * 1.15);

      const needleLen = 30;
      const needleEndX = dialCenterX + Math.cos(needleAngle) * needleLen;
      const needleEndY = dialCenterY + Math.sin(needleAngle) * needleLen;

      ctx.strokeStyle = isSwitchOn ? '#38BDF8' : '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dialCenterX, dialCenterY);
      ctx.lineTo(needleEndX, needleEndY);
      ctx.stroke();

      // Center pivot pin
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(dialCenterX, dialCenterY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Digital 7-Segment style LED readout
      ctx.fillStyle = '#020617';
      ctx.fillRect(vmX + 15, vmY + 66, vmW - 30, 24);
      ctx.strokeStyle = '#0EA5E9';
      ctx.lineWidth = 1;
      ctx.strokeRect(vmX + 15, vmY + 66, vmW - 30, 24);

      ctx.fillStyle = isSwitchOn
        ? (nernstData.isSpontaneous ? '#38BDF8' : '#F43F5E')
        : '#475569';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const dispV = isSwitchOn ? `${currentVoltage >= 0 ? '+' : ''}${currentVoltage.toFixed(3)} V` : '0.000 V';
      ctx.fillText(dispV, vmX + vmW / 2, vmY + 83);

      // Voltmeter banner
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 8px system-ui, sans-serif';
      ctx.fillText('DIGITAL VOLTMETER', vmX + vmW / 2, vmY + 96);

      // KNIFE SWITCH (Interactive) at x=280..340, y=70..100
      const swX = 270;
      const swY = 65;
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(swX, swY, 70, 40, 6);
      ctx.fill();
      ctx.stroke();

      // Switch terminals
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(swX + 15, swY + 20, 4, 0, Math.PI * 2);
      ctx.arc(swX + 55, swY + 20, 4, 0, Math.PI * 2);
      ctx.fill();

      // Switch blade (open or closed)
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(swX + 15, swY + 20);
      if (isSwitchOn) {
        ctx.lineTo(swX + 55, swY + 20); // closed
      } else {
        ctx.lineTo(swX + 45, swY + 4); // open 40 deg
      }
      ctx.stroke();

      // Switch status text
      ctx.fillStyle = isSwitchOn ? '#10B981' : '#EF4444';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isSwitchOn ? 'SAKELAR ON' : 'SAKELAR OFF', swX + 35, swY + 35);

      // LIGHT BULB LOAD at x=610..670, y=60..105
      const bulbX = 640;
      const bulbY = 82;
      const bulbGlowIntensity = isSwitchOn && nernstData.isSpontaneous ? Math.min(nernstData.E_cell / 2.5, 1) : 0;

      if (bulbGlowIntensity > 0) {
        const glowRad = 35 * bulbGlowIntensity;
        const bulbGrad = ctx.createRadialGradient(bulbX, bulbY, 2, bulbX, bulbY, glowRad);
        bulbGrad.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
        bulbGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.35)');
        bulbGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = bulbGrad;
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, glowRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bulb glass
      ctx.fillStyle = bulbGlowIntensity > 0 ? '#FEF08A' : 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY - 6, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bulb filament
      ctx.strokeStyle = bulbGlowIntensity > 0 ? '#DC2626' : '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bulbX - 4, bulbY - 2);
      ctx.lineTo(bulbX, bulbY - 9);
      ctx.lineTo(bulbX + 4, bulbY - 2);
      ctx.stroke();

      // Bulb base
      ctx.fillStyle = '#64748B';
      ctx.fillRect(bulbX - 6, bulbY + 6, 12, 7);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '8px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Beban (Lampu)', bulbX, bulbY + 22);

      // ==========================================
      // 6. CIRCUIT WIRES & MOVING ELECTRONS
      // ==========================================
      // Wire path points:
      // Anode electrode top (anX + 15, anY) -> Up to swX + 15 -> Switch -> out to vmX + 10 -> Voltmeter -> out from vmX + vmW - 10 -> Bulb in -> Bulb out -> Down to Cathode electrode top (catX + 15, catY)
      const wirePath: [number, number][] = [
        [anX + 15, anY],
        [anX + 15, swY + 20],
        [swX + 15, swY + 20],
        // if switch closed, passes through
        [swX + 55, swY + 20],
        [vmX, swY + 20],
        [vmX, vmY + 60],
        [vmX + vmW, vmY + 60],
        [vmX + vmW, swY + 20],
        [bulbX - 6, swY + 20],
        [bulbX + 6, swY + 20],
        [catX + 15, swY + 20],
        [catX + 15, catY],
      ];

      // Draw baseline wire
      ctx.strokeStyle = '#D97706'; // copper wire
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(wirePath[0][0], wirePath[0][1]);
      ctx.lineTo(wirePath[1][0], wirePath[1][1]);
      ctx.lineTo(wirePath[2][0], wirePath[2][1]);
      ctx.stroke();

      if (isSwitchOn) {
        ctx.beginPath();
        ctx.moveTo(wirePath[3][0], wirePath[3][1]);
        for (let i = 4; i < wirePath.length; i++) {
          ctx.lineTo(wirePath[i][0], wirePath[i][1]);
        }
        ctx.stroke();
      }

      // Wire glow when active
      if (isSwitchOn && nernstData.isSpontaneous) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // Calculate total path length for electron interpolation
      let totalWireLen = 0;
      const segLengths: number[] = [];
      for (let i = 0; i < wirePath.length - 1; i++) {
        const dx = wirePath[i + 1][0] - wirePath[i][0];
        const dy = wirePath[i + 1][1] - wirePath[i][1];
        const l = Math.hypot(dx, dy);
        segLengths.push(l);
        totalWireLen += l;
      }

      const getWirePoint = (ratio: number) => {
        let dist = ratio * totalWireLen;
        for (let i = 0; i < segLengths.length; i++) {
          if (dist <= segLengths[i]) {
            const t = dist / segLengths[i];
            return {
              x: wirePath[i][0] + (wirePath[i + 1][0] - wirePath[i][0]) * t,
              y: wirePath[i][1] + (wirePath[i + 1][1] - wirePath[i][1]) * t,
            };
          }
          dist -= segLengths[i];
        }
        return { x: wirePath[wirePath.length - 1][0], y: wirePath[wirePath.length - 1][1] };
      };

      // Moving Electrons along the wire
      if (isSwitchOn && nernstData.isSpontaneous) {
        const step = dt * speedMultiplier * 0.15;
        electronOffsetsRef.current = electronOffsetsRef.current.map((offset) => {
          let next = offset + step;
          if (next > 1) next -= 1;
          return next;
        });

        electronOffsetsRef.current.forEach((offset) => {
          const pt = getWirePoint(offset);
          // Glow dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FDE047';
          ctx.fill();
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Particle label e-
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 6px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('e⁻', pt.x, pt.y + 2);
        });

        // Direction labels
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Aliran Elektron (e⁻) ➔', 220, swY - 6);
        ctx.fillText('Aliran Elektron (e⁻) ➔', 720, swY - 6);
      }

      // ==========================================
      // 7. BEAKER ION PARTICLES (BROWNIAN + DRIFT)
      // ==========================================
      const updateParticles = (
        particles: Particle[],
        bx: number,
        by: number,
        isAnodeBeaker: boolean
      ) => {
        particles.forEach((p) => {
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;

          // Boundary bounce inside beaker liquid
          const minX = bx + 16;
          const maxX = bx + beakerW - 20;
          const minY = by + 50;
          const maxY = by + beakerH - 12;

          if (p.x < minX) { p.x = minX; p.vx *= -1; }
          if (p.x > maxX) { p.x = maxX; p.vx *= -1; }
          if (p.y < minY) { p.y = minY; p.vy *= -1; }
          if (p.y > maxY) { p.y = maxY; p.vy *= -1; }

          // Draw ion
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 7px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.label, p.x, p.y + 2.5);
        });
      };

      updateParticles(anodeParticlesRef.current, beakerLeftX, beakerY, true);
      updateParticles(cathodeParticlesRef.current, beakerRightX, beakerY, false);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    anodeId,
    cathodeId,
    anodeConc,
    cathodeConc,
    isSwitchOn,
    nernstData,
    elapsedTime,
    speedMultiplier,
  ]);

  // Handle canvas mouse clicks for interactive switch and magnifiers
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked knife switch (x=270..340, y=65..105)
    if (clickX >= 260 && clickX <= 350 && clickY >= 55 && clickY <= 115) {
      onToggleSwitch();
      return;
    }

    // Check if clicked Left Beaker (Anode Zoom)
    if (clickX >= 150 && clickX <= 350 && clickY >= 230 && clickY <= 430) {
      onSelectMicroscopicTab('anode');
      return;
    }

    // Check if clicked Right Beaker (Cathode Zoom)
    if (clickX >= 570 && clickX <= 770 && clickY >= 230 && clickY <= 430) {
      onSelectMicroscopicTab('cathode');
      return;
    }

    // Check if clicked Salt Bridge (Salt bridge Zoom)
    if (clickX >= 340 && clickX <= 570 && clickY >= 180 && clickY <= 300) {
      onSelectMicroscopicTab('saltbridge');
      return;
    }
  };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Simulation Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Visualisasi Makroskopik & Sirkuit Sel Volta
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs font-mono text-cyan-400">
            Waktu: {elapsedTime.toFixed(1)}s
          </span>
        </div>

        {/* Quick controls right on top */}
        <div className="flex items-center gap-2">
          {/* Magnifier Quick Links */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onSelectMicroscopicTab('anode')}
              className="px-2 py-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors"
              title="Perbesar Antarmuka Anoda"
            >
              <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
              <span>Mikro Anoda</span>
            </button>
            <button
              onClick={() => onSelectMicroscopicTab('cathode')}
              className="px-2 py-1 text-slate-300 hover:text-rose-300 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors"
              title="Perbesar Antarmuka Katoda"
            >
              <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
              <span>Mikro Katoda</span>
            </button>
            <button
              onClick={() => onSelectMicroscopicTab('saltbridge')}
              className="px-2 py-1 text-slate-300 hover:text-purple-300 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors"
              title="Perbesar Jembatan Garam"
            >
              <ZoomIn className="w-3.5 h-3.5 text-purple-400" />
              <span>Mikro Jembatan</span>
            </button>
          </div>

          {/* Sakelar ON/OFF button */}
          <button
            onClick={onToggleSwitch}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              isSwitchOn
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSwitchOn ? 'fill-current text-white' : ''}`} />
            <span>{isSwitchOn ? 'SAKELAR [ON]' : 'SAKELAR [OFF]'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            title="Reset Kondisi Simulasi"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main HTML5 Canvas */}
      <div className="relative aspect-[16/9] w-full max-h-[520px] bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-pointer select-none"
        />

        {/* Floating Hint Overlay on bottom left */}
        <div className="absolute bottom-3 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-md px-2.5 py-1 text-[11px] text-slate-400 pointer-events-none flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Klik sakelar atau bejana untuk zoom mikroskopik</span>
        </div>

        {/* Spontaneity Badge floating on bottom right */}
        <div className="absolute bottom-3 right-4 bg-slate-950/85 backdrop-blur border border-slate-800 rounded-md px-3 py-1 text-[11px] flex items-center gap-2">
          <span className="text-slate-400">Reaksi:</span>
          {isSwitchOn ? (
            nernstData.isSpontaneous ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Spontan (E_sel &gt; 0)
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                Non-Spontan (E_sel &le; 0)
              </span>
            )
          ) : (
            <span className="text-slate-500 font-mono">Sirkuit Terbuka</span>
          )}
        </div>
      </div>
    </div>
  );
};
