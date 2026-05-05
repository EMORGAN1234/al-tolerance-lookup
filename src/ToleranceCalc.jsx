import React, { useState, useMemo } from 'react';
import { Ruler, RefreshCw, AlertCircle, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

// ============================================================
// ANSI H35.2-2024 — DIMENSIONAL TOLERANCES FOR ALUMINUM MILL PRODUCTS
// All data sourced directly from the 2024 edition of this standard.
// ASTM B209 incorporates these tolerances by reference.
// ============================================================

// ── Alloy classification ────────────────────────────────────
// Table 7.7b applies to alloys specified for AEROSPACE APPLICATIONS
// All others use Table 7.7a — determined via alloyInfo.aerospace flag

// ── Table 7.7a — Non-Aerospace, Symmetric ± (in inches) ────
// Width bands (upper limits): 39.37, 59.06, 78.74, 98.43, 118.11, 137.80, 157.48, 177.17
// null = not applicable for that thickness/width combination
const BANDS_7A = [39.37, 59.06, 78.74, 98.43, 118.11, 137.80, 157.48, 177.17];
const TABLE_7_7A = [
  //                               W1       W2       W3       W4        W5        W6        W7        W8
  //                            ≤39.37  39-59.06 59-78.74 78-98.43 98-118.11 118-137.8 137-157.5 157-177.2
  { minT:0.0059, maxT:0.010,  t:[0.0010, 0.0015,  null,    null,    null,     null,     null,     null   ] },
  { minT:0.010,  maxT:0.016,  t:[0.0010, 0.0015,  null,    null,    null,     null,     null,     null   ] },
  { minT:0.016,  maxT:0.025,  t:[0.0015, 0.0020,  0.0030,  0.0035,  null,     null,     null,     null   ] },
  { minT:0.025,  maxT:0.032,  t:[0.0020, 0.0025,  0.0035,  0.0040,  null,     null,     null,     null   ] },
  { minT:0.032,  maxT:0.039,  t:[0.0020, 0.0030,  0.0035,  0.0045,  0.006,    null,     null,     null   ] },
  { minT:0.039,  maxT:0.047,  t:[0.0025, 0.0035,  0.0045,  0.006,   0.007,    0.008,    null,     null   ] },
  { minT:0.047,  maxT:0.063,  t:[0.0030, 0.0035,  0.0050,  0.006,   0.007,    0.009,    null,     null   ] },
  { minT:0.063,  maxT:0.079,  t:[0.0035, 0.0040,  0.006,   0.007,   0.008,    0.010,    null,     null   ] },
  { minT:0.079,  maxT:0.098,  t:[0.0035, 0.0045,  0.006,   0.007,   0.009,    0.011,    null,     null   ] },
  { minT:0.098,  maxT:0.126,  t:[0.0045, 0.006,   0.007,   0.009,   0.011,    0.013,    null,     null   ] },
  { minT:0.126,  maxT:0.158,  t:[0.006,  0.007,   0.009,   0.011,   0.013,    0.015,    null,     null   ] },
  { minT:0.158,  maxT:0.197,  t:[0.007,  0.009,   0.011,   0.013,   0.015,    0.018,    null,     null   ] },
  { minT:0.197,  maxT:0.248,  t:[0.009,  0.011,   0.013,   0.015,   0.018,    0.022,    0.027,    null   ] },
  { minT:0.248,  maxT:0.315,  t:[0.012,  0.014,   0.015,   0.018,   0.022,    0.027,    0.035,    0.043  ] },
  { minT:0.315,  maxT:0.394,  t:[0.015,  0.017,   0.020,   0.023,   0.027,    0.033,    0.041,    0.051  ] },
  { minT:0.394,  maxT:0.630,  t:[0.023,  0.023,   0.027,   0.032,   0.035,    0.043,    0.053,    0.065  ] },
  { minT:0.630,  maxT:0.984,  t:[0.031,  0.031,   0.037,   0.043,   0.047,    0.058,    0.070,    0.085  ] },
  { minT:0.984,  maxT:1.575,  t:[0.039,  0.039,   0.047,   0.055,   0.065,    0.075,    0.090,    0.105  ] },
  { minT:1.575,  maxT:2.362,  t:[0.055,  0.055,   0.060,   0.070,   0.085,    0.100,    0.115,    null   ] },
  { minT:2.362,  maxT:3.150,  t:[0.075,  0.075,   0.085,   0.100,   0.105,    0.125,    null,     null   ] },
  { minT:3.150,  maxT:3.937,  t:[0.100,  0.100,   0.115,   0.125,   0.130,    0.160,    null,     null   ] },
  { minT:3.937,  maxT:6.299,  t:[0.130,  0.130,   0.145,   0.165,   null,     null,     null,     null   ] },
  { minT:6.300,  maxT:8.000,  t:[0.160,  0.160,   0.160,   0.165,   null,     null,     null,     null   ] },
  { minT:8.001,  maxT:12.001, t:[0.190,  0.190,   0.190,   0.190,   null,     null,     null,     null   ] },
];

// ── Table 7.7b — Aerospace Alloys, Symmetric ± ─────────────
// 12 width columns (finer resolution than 7.7a)
const BANDS_7B = [39.37, 47.24, 55.12, 59.06, 70.87, 78.74, 86.61, 98.43, 118.11, 137.80, 157.48, 177.17];
const TABLE_7_7B = [
  //                              W1      W2      W3      W4       W5       W6       W7       W8       W9      W10      W11      W12
  //                           ≤39.37 39-47.24 47-55.12 55-59.06 59-70.87 70-78.74 78-86.61 86-98.43 98-118 118-137 137-157 157-177
  { minT:0.0059, maxT:0.010,  t:[0.0010, 0.0020, 0.0020, 0.0020,  null,    null,    null,    null,    null,   null,   null,   null  ] },
  { minT:0.010,  maxT:0.016,  t:[0.0015, 0.0025, 0.0025, 0.0025,  null,    null,    null,    null,    null,   null,   null,   null  ] },
  { minT:0.016,  maxT:0.025,  t:[0.0015, 0.0025, 0.0025, 0.0025,  null,    null,    null,    null,    null,   null,   null,   null  ] },
  { minT:0.025,  maxT:0.032,  t:[0.0015, 0.0015, 0.0020, 0.0030,  0.0030,  null,    null,    null,    null,   null,   null,   null  ] },
  { minT:0.032,  maxT:0.039,  t:[0.0015, 0.0015, 0.0020, 0.0030,  0.0030,  0.0035,  0.0035,  0.007,   null,   null,   null,   null  ] },
  { minT:0.039,  maxT:0.047,  t:[0.0020, 0.0020, 0.0020, 0.0030,  0.0030,  0.0035,  0.0035,  0.008,   0.010,  0.011,  null,   null  ] },
  { minT:0.047,  maxT:0.063,  t:[0.0020, 0.0020, 0.0030, 0.0030,  0.0030,  0.0035,  0.0035,  0.009,   0.011,  0.013,  null,   null  ] },
  { minT:0.063,  maxT:0.079,  t:[0.0020, 0.0020, 0.0030, 0.0035,  0.0035,  0.0035,  0.0035,  0.010,   0.013,  0.015,  null,   null  ] },
  { minT:0.079,  maxT:0.098,  t:[0.0025, 0.0025, 0.0035, 0.0040,  0.0040,  0.0045,  0.0045,  0.011,   0.015,  0.018,  null,   null  ] },
  { minT:0.098,  maxT:0.126,  t:[0.0035, 0.0035, 0.0035, 0.0045,  0.0045,  0.0045,  0.0045,  0.013,   0.016,  0.020,  null,   null  ] },
  { minT:0.126,  maxT:0.158,  t:[0.0040, 0.0040, 0.0045, 0.007,   0.007,   0.009,   0.009,   0.015,   0.018,  0.022,  null,   null  ] },
  { minT:0.158,  maxT:0.197,  t:[0.006,  0.007,  0.007,  0.009,   0.009,   0.011,   0.011,   0.018,   0.022,  0.026,  null,   null  ] },
  { minT:0.197,  maxT:0.248,  t:[0.009,  0.012,  0.012,  0.012,   0.017,   0.017,   0.021,   0.021,   0.025,  0.029,  null,   null  ] },
  { minT:0.248,  maxT:0.315,  t:[0.012,  0.015,  0.015,  0.015,   0.019,   0.019,   0.024,   0.024,   0.029,  0.033,  0.041,  0.051 ] },
  { minT:0.315,  maxT:0.394,  t:[0.017,  0.018,  0.018,  0.018,   0.022,   0.022,   0.028,   0.028,   0.033,  0.039,  0.047,  0.059 ] },
  { minT:0.394,  maxT:0.630,  t:[0.023,  0.023,  0.023,  0.023,   0.028,   0.028,   0.033,   0.033,   0.039,  0.047,  0.059,  0.070 ] },
  { minT:0.630,  maxT:0.984,  t:[0.031,  0.031,  0.031,  0.031,   0.037,   0.037,   0.043,   0.043,   0.051,  0.060,  0.070,  0.085 ] },
  { minT:0.984,  maxT:1.575,  t:[0.039,  0.039,  0.039,  0.039,   0.047,   0.047,   0.055,   0.055,   0.065,  0.075,  0.090,  0.105 ] },
  { minT:1.575,  maxT:2.362,  t:[0.055,  0.055,  0.055,  0.055,   0.060,   0.060,   0.070,   0.070,   0.090,  0.100,  0.115,  null  ] },
  { minT:2.362,  maxT:3.150,  t:[0.075,  0.075,  0.075,  0.075,   0.085,   0.085,   0.100,   0.100,   0.110,  0.125,  null,   null  ] },
  { minT:3.150,  maxT:3.937,  t:[0.100,  0.100,  0.100,  0.100,   0.115,   0.115,   0.130,   0.130,   0.150,  0.160,  null,   null  ] },
  { minT:3.937,  maxT:6.299,  t:[0.130,  0.130,  0.130,  0.130,   0.145,   0.145,   0.165,   0.165,   null,   null,   null,   null  ] },
  { minT:6.300,  maxT:8.000,  t:[0.160,  0.160,  0.160,  0.160,   0.160,   0.160,   0.165,   0.165,   null,   null,   null,   null  ] },
  { minT:8.001,  maxT:10.001, t:[0.190,  0.190,  0.190,  0.190,   0.190,   0.190,   0.190,   0.190,   null,   null,   null,   null  ] },
];

function getThickTol(th, w, isAerospace) {
  const table  = isAerospace ? TABLE_7_7B : TABLE_7_7A;
  const bands  = isAerospace ? BANDS_7B   : BANDS_7A;
  const row    = table.find(r => th > r.minT - 0.000005 && th <= r.maxT);
  if (!row) return null;
  const wIdx   = bands.findIndex(b => w <= b);
  const col    = wIdx === -1 ? bands.length - 1 : wIdx;
  const tol    = row.t[col];
  return tol === null ? null : tol;
}

// ── Table 7.8 — Width Tolerances, Sheared Flat Sheet & Plate ──
// Width bands (in): 6, 24, 60, 96, 132, 168
// Sheet (< 0.250"): SYMMETRIC ±    Plate (0.250-0.499"): PLUS ONLY
const W_BANDS_7_8 = [6, 24, 60, 96, 132, 168];
const T7_8 = {
  // thickness class → [±tol or +tol per width band], sym=true means ±
  thin:  { range:'0.006–0.124"', sym:true,  vals:[1/16,   3/32,  1/8,   1/8,   5/32,  null ] },
  thick: { range:'0.125–0.249"', sym:true,  vals:[3/32,   3/32,  1/8,   5/32,  3/16,  null ] },
  plate: { range:'0.250–0.499"', sym:false, vals:[1/4,    5/16,  3/8,   3/8,   7/16,  1/2  ] },
};
function getWidthSheared(th, w) {
  const cls = th < 0.125 ? 'thin' : th < 0.250 ? 'thick' : 'plate';
  const row = T7_8[cls];
  const idx = W_BANDS_7_8.findIndex(b => w <= b);
  const col = idx === -1 ? W_BANDS_7_8.length - 1 : idx;
  const val = row.vals[col];
  if (val === null) return null;
  return { tol: val, sym: row.sym, range: row.range };
}

// ── Table 7.9 — Length Tolerances, Sheared Flat Sheet & Plate ──
// Length bands (in): 30, 60, 120, 240, 360, 480, 600, 720
// Sheet: SYMMETRIC ±     Plate (0.250-0.499"): PLUS ONLY
const L_BANDS_7_9 = [30, 60, 120, 240, 360, 480, 600, 720];
const T7_9 = {
  thin:  { sym:true,  vals:[1/16,  3/32,  1/8,   5/32,  3/16,  7/32,  9/32,  null ] },
  thick: { sym:true,  vals:[3/32,  3/32,  1/8,   5/32,  7/32,  1/4,   5/16,  null ] },
  plate: { sym:false, vals:[1/4,   3/8,   7/16,  1/2,   9/16,  5/8,  11/16,  3/4  ] },
};
function getLengthSheared(th, l) {
  const cls = th < 0.125 ? 'thin' : th < 0.250 ? 'thick' : 'plate';
  const row = T7_9[cls];
  const idx = L_BANDS_7_9.findIndex(b => l <= b);
  const col = idx === -1 ? L_BANDS_7_9.length - 1 : idx;
  const val = row.vals[col];
  if (val === null) return null;
  return { tol: val, sym: row.sym };
}

// ── Table 7.10 — Width & Length, Sawed Flat Sheet & Plate ──
// Single table for both width and length (same tolerances)
// Bands (in): 30, 60, 120, 240, 360, 480, 600, 720
const T7_10 = {
  sheet: { range:'0.080–0.249"', sym:true,  vals:[1/8,   1/8,   3/16,  1/4,   1/4,   5/16,  3/8,  7/16 ] },
  plate: { range:'0.250–12.000"',sym:false, vals:[1/4,   5/16,  3/8,   1/2,   9/16,  5/8,   3/4,  7/8  ] },
};
function getSawed(th, dim) {
  if (th < 0.080) return null; // minimum for sawed is 0.080"
  const cls = th < 0.250 ? 'sheet' : 'plate';
  const row = T7_10[cls];
  const bands = [30, 60, 120, 240, 360, 480, 600, 720];
  const idx = bands.findIndex(b => dim <= b);
  const col = idx === -1 ? bands.length - 1 : idx;
  return { tol: row.vals[col], sym: row.sym, range: row.range };
}

// ── Table 7.11 — Width Tolerances, Slit Coiled Sheet (Symmetric ±) ──
// Width bands (in): 6, 12, 24, 48, 60, 96
const COIL_BANDS = [6, 12, 24, 48, 60, 96];
const T7_11 = [
  { minT:0.006, maxT:0.125, vals:[0.010,  1/64,  1/32,  3/64,  1/16,  1/8  ] },
  { minT:0.126, maxT:0.186, vals:[0.012,  1/32,  1/32,  1/16,  3/32,  null ] },
  { minT:0.187, maxT:0.249, vals:[0.016,  1/32,  3/64,  3/32,  1/8,   null ] },
];
function getCoilWidth(th, w) {
  const row = T7_11.find(r => th >= r.minT && th <= r.maxT);
  if (!row) return null;
  const idx = COIL_BANDS.findIndex(b => w <= b);
  const col = idx === -1 ? COIL_BANDS.length - 1 : idx;
  const val = row.vals[col];
  return val === null ? null : { tol: val, sym: true };
}

// ── Table 7.14 — Squareness (diagonal difference) ──
// width/length in INCHES → convert to feet for formula
function getSquareness(wIn, lIn) {
  if (!wIn || !lIn) return null;
  const wFt = wIn / 12;
  const lFt = lIn / 12;
  let factor;
  if (wFt <= 3) factor = lFt <= 12 ? 3/32 : 9/64;
  else          factor = lFt <= 12 ? 5/64 : 7/64;
  // Round up to nearest 1/16"
  const raw = factor * wFt;
  const rounded = Math.ceil(raw * 16) / 16;
  return { tol: rounded, factor, wFt, lFt };
}

// ── Alloy data ──────────────────────────────────────────────
const ALLOY_DATA = {
  '1100': { std:'H35.2', forms:['sheet','plate','coil'], aerospace:false, note:null },
  '2014': { std:'H35.2', forms:['sheet','plate'],       aerospace:true,  note:'Aerospace alloy — uses H35.2 Table 7.7b (tighter tolerances)' },
  '2024': { std:'H35.2', forms:['sheet','plate','coil'],aerospace:true,  note:'Aerospace alloy — uses H35.2 Table 7.7b (tighter tolerances)' },
  '2219': { std:'H35.2', forms:['sheet','plate'],       aerospace:true,  note:'Aerospace alloy — uses H35.2 Table 7.7b' },
  '3003': { std:'H35.2', forms:['sheet','plate','coil'],aerospace:false, note:null },
  '3004': { std:'H35.2', forms:['sheet','coil'],        aerospace:false, sheetOnly:true, note:'Sheet/coil only per standard scope; plate is non-standard' },
  '3105': { std:'H35.2', forms:['sheet','coil'],        aerospace:false, sheetOnly:true, note:'Sheet/coil only per standard scope' },
  '5005': { std:'H35.2', forms:['sheet','plate','coil'],aerospace:false, note:null },
  '5052': { std:'H35.2', forms:['sheet','plate','coil'],aerospace:false, note:null },
  '5083': { std:'H35.2', forms:['sheet','plate'],       aerospace:false, note:null },
  '5086': { std:'H35.2', forms:['sheet','plate'],       aerospace:false, note:null },
  '5454': { std:'H35.2', forms:['sheet','plate'],       aerospace:false, note:null },
  '5456': { std:'H35.2', forms:['sheet','plate'],       aerospace:false, note:null },
  '6061': { std:'H35.2', forms:['sheet','plate','coil'],aerospace:false, note:null },
  '7050': { std:'H35.2', forms:['plate'],               aerospace:true,  plateOnly:true, note:'Aerospace alloy, plate only — uses H35.2 Table 7.7b. Cert typically per AMS 4050/4342.' },
  '7075': { std:'H35.2', forms:['sheet','plate'],       aerospace:true,  note:'Aerospace alloy — uses H35.2 Table 7.7b' },
  '7475': { std:'H35.2', forms:['sheet','plate'],       aerospace:true,  note:'Aerospace alloy — uses H35.2 Table 7.7b. Cert typically per AMS-QQ-A-250/13.' },
};

const TEMPER_MAP = {
  '1100':['O','H12','H14','H16','H18','H22','H24','H26'],
  '2014':['O','T3','T4','T451','T6','T651'],
  '2024':['O','T3','T351','T4','T6','T651','T81','T851','T87'],
  '2219':['O','T31','T351','T37','T81','T851','T87'],
  '3003':['O','H12','H14','H16','H18','H22','H24','H26'],
  '3004':['O','H32','H34','H36','H38'],
  '3105':['O','H12','H14','H16','H18','H22','H24','H25'],
  '5005':['O','H12','H14','H16','H18','H32','H34','H36','H38'],
  '5052':['O','H32','H34','H36','H38'],
  '5083':['O','H111','H112','H116','H321'],
  '5086':['O','H111','H112','H116','H32','H34'],
  '5454':['O','H111','H112','H32','H34'],
  '5456':['O','H111','H112','H116','H321'],
  '6061':['O','T4','T451','T6','T651'],
  '7050':['T7451','T7452'],
  '7075':['O','T6','T651','T73','T7351','T76','T7651'],
  '7475':['T61','T651','T761','T7351'],
};

// ── Flatness group ──────────────────────────────────────────
// Table 7.17 (sheet) / Table 7.18 (plate)
function getFlatnessGroup(alloy) {
  const grp1 = new Set(['1060','1100','1350','3003','3005','3105','5005','5050']);
  return grp1.has(alloy) ? 1 : 2;
}

// Table 7.17 flat sheet flatness (per distance between buckles)
// Group 1: soft alloys; Group 2: 5052, 5083, 5086, heat treatable, etc.
// Distance bands (ft): ≤2, 2-3, 3-4, 4-6, >6
const SHEET_FLAT_G1 = {
  thin:  [1/8,  3/16, 3/16, 5/16, 3/8],  // 0.020-0.064"
  thick: [1/8,  3/16, 5/16, 3/8,  1/2],  // 0.065-0.249"
};
const SHEET_FLAT_G2 = {
  thin:  [3/16, 3/16, 5/16, 3/8,  1/2],  // 0.020-0.064"
  thick: [3/16, 5/16, 3/8,  1/2,  9/16], // 0.065-0.249"
};

function fmt(v, d=4) { return Number(v).toFixed(d); }
function fmtFrac(dec) {
  const fracs = [[1/64,'1/64"'],[1/32,'1/32"'],[3/64,'3/64"'],[1/16,'1/16"'],[5/64,'5/64"'],
    [3/32,'3/32"'],[7/64,'7/64"'],[1/8,'1/8"'],[9/64,'9/64"'],[5/32,'5/32"'],[11/64,'11/64"'],
    [3/16,'3/16"'],[13/64,'13/64"'],[7/32,'7/32"'],[15/64,'15/64"'],[1/4,'1/4"'],
    [5/16,'5/16"'],[3/8,'3/8"'],[7/16,'7/16"'],[1/2,'1/2"'],[9/16,'9/16"'],[5/8,'5/8"'],
    [11/16,'11/16"'],[3/4,'3/4"'],[7/8,'7/8"'],[1,'1"']];
  const match = fracs.find(f => Math.abs(f[0] - dec) < 0.0001);
  return match ? match[1] : fmt(dec, 4)+'"';
}

// ============================================================
export default function ToleranceCalc() {
  const [alloy,  setAlloy]  = useState('5052');
  const [temper, setTemper] = useState('H32');
  const [form,   setForm]   = useState('sheet');
  const [cut,    setCut]    = useState('sheared'); // 'sheared' | 'sawed' (flat) | 'slit' (coil)
  const [thick,  setThick]  = useState('');
  const [width,  setWidth]  = useState('');
  const [length, setLength] = useState('');
  const [showRef, setShowRef] = useState(false);

  const alloyInfo  = ALLOY_DATA[alloy];
  const isAero     = alloyInfo?.aerospace || false;

  const handleAlloyChange = (a) => {
    setAlloy(a);
    setTemper(TEMPER_MAP[a]?.[0] || '');
    const info = ALLOY_DATA[a];
    if (info?.plateOnly) { setForm('plate'); setCut('sawed'); }
    else if (info?.sheetOnly && form === 'plate') setForm('sheet');
  };

  const handleFormChange = (f) => {
    setForm(f);
    if (f === 'coil') setCut('slit');
    else if (f === 'plate' && cut === 'slit') setCut('sawed');
    else if (f === 'sheet' && cut === 'slit') setCut('sheared');
  };

  const handleReset = () => {
    setAlloy('5052'); setTemper('H32'); setForm('sheet'); setCut('sheared');
    setThick(''); setWidth(''); setLength('');
  };

  // ── Compute ──────────────────────────────────────────────
  const results = useMemo(() => {
    const th = parseFloat(thick);
    const w  = parseFloat(width);
    const l  = parseFloat(length);
    if (!th || th <= 0 || !alloyInfo) return null;

    const isCoil  = form === 'coil';
    const isPlate = form === 'plate';
    const warnings = [];

    if (alloyInfo.sheetOnly && isPlate) {
      warnings.push({ level:'error', msg:`${alloy} is not a standard plate alloy per H35.2. Plate is non-standard — confirm with your mill.` });
    }
    if (alloyInfo.plateOnly && !isPlate) {
      warnings.push({ level:'error', msg:`${alloy} is a plate-only alloy. No standard sheet or coil product exists for this alloy.` });
    }
    if (alloyInfo.note) {
      warnings.push({ level: isAero ? 'aero' : 'info', msg: alloyInfo.note });
    }
    if (isCoil && th >= 0.250) {
      return { warnings, invalid:true, msg:`Coil thickness of ${th}" is ≥ 0.250" — this is plate range and is not covered by Table 7.11. Select Plate form.` };
    }
    if (isPlate && th < 0.250) {
      return { warnings, invalid:true, msg:`Plate form selected but thickness ${th}" < 0.250". Switch to Sheet form.` };
    }

    // ── Thickness ──────────────────────────────────────────
    const thTol = w > 0 ? getThickTol(th, w, isAero) : null;
    const thTolNoWidth = !w ? getThickTol(th, 39.37, isAero) : null; // narrow band estimate if no width
    const tableRef = isAero ? 'H35.2 Table 7.7b' : 'H35.2 Table 7.7a';
    const wBandLabel = w > 0 ? (() => {
      const bands = isAero ? BANDS_7B : BANDS_7A;
      const idx = bands.findIndex(b => w <= b);
      const col = idx === -1 ? bands.length - 1 : idx;
      const lo = col === 0 ? '0' : bands[col-1].toFixed(2);
      return `${lo}"–${bands[col].toFixed(2)}"`;
    })() : null;

    // ── Width ──────────────────────────────────────────────
    let widthTol = null;
    if (w > 0) {
      if (isCoil) {
        const r = getCoilWidth(th, w);
        if (r) widthTol = { ...r, ref:'H35.2 Table 7.11', note:'Slit coil — symmetric ±' };
      } else if (cut === 'sheared') {
        const r = getWidthSheared(th, w);
        if (r) widthTol = { ...r, ref:'H35.2 Table 7.8', note: r.sym ? 'Sheared sheet — symmetric ±' : 'Sheared plate — plus only' };
      } else {
        const r = getSawed(th, w);
        if (r) widthTol = { ...r, ref:'H35.2 Table 7.10', note: r.sym ? 'Sawed sheet — symmetric ±' : 'Sawed plate — plus only' };
      }
    }

    // ── Length ──────────────────────────────────────────────
    let lengthTol = null;
    if (l > 0 && !isCoil) {
      if (cut === 'sheared') {
        const r = getLengthSheared(th, l);
        if (r) lengthTol = { ...r, ref:'H35.2 Table 7.9', note: r.sym ? 'Sheared sheet — symmetric ±' : 'Sheared plate — plus only' };
      } else {
        const r = getSawed(th, l);
        if (r) lengthTol = { ...r, ref:'H35.2 Table 7.10', note: r.sym ? 'Sawed sheet — symmetric ±' : 'Sawed plate — plus only' };
      }
    }

    // ── Squareness ─────────────────────────────────────────
    const sq = (!isCoil && w > 0 && l > 0) ? getSquareness(w, l) : null;

    // ── Flatness ───────────────────────────────────────────
    let flatness = null;
    if (isCoil) {
      flatness = { label:'Coil set / edge wave — see H35.2 Table 7.12', note:'Sheet flatness (Table 7.17) does not apply to coil. Coil lateral bow per Table 7.12 by width and thickness.' };
    } else if (!isPlate) {
      const grp = getFlatnessGroup(alloy);
      const cls = th <= 0.064 ? 'thin' : 'thick';
      const vals = grp === 1 ? SHEET_FLAT_G1[cls] : SHEET_FLAT_G2[cls];
      flatness = {
        label:`Group ${grp} Sheet — H35.2 Table 7.17`,
        note:'Allowable bow by distance between buckles (ft). Not applicable to sheet over 60" wide, or O/F/HX8 tempers.',
        rows: [
          { band:'≤ 2 ft', tol:vals[0] },
          { band:'2–3 ft', tol:vals[1] },
          { band:'3–4 ft', tol:vals[2] },
          { band:'4–6 ft', tol:vals[3] },
          { band:'> 6 ft', tol:vals[4] },
        ],
        isTable: true,
      };
    } else {
      // Table 7.18 plate flatness — simplified longitudinal values
      const isTX51 = ['T351','T451','T651','T851','T7351','T7451','T7651'].includes(temper);
      const long = th <= 3.000
        ? (isTX51 ? '3/16" in any 6 ft' : '1/4" in any 6 ft or less')
        : (isTX51 ? '1/8" in any 6 ft' : '1/4" in any 6 ft or less');
      flatness = {
        label:'Plate Flatness — H35.2 Table 7.18',
        note:`Longitudinal: ${long}. Transverse and short-span flatness have additional requirements per Table 7.18 (vary by thickness, width, and temper).`,
        isTable: false,
        simple: long,
      };
    }

    const useThTol = thTol ?? thTolNoWidth;
    const thRange = useThTol ? {
      min: parseFloat((th - useThTol).toFixed(4)),
      max: parseFloat((th + useThTol).toFixed(4)),
    } : null;

    return {
      invalid:false, isAero, isCoil, isPlate, isSheet, form, cut,
      th, w, l, useThTol, thTol, thTolNoWidth, wBandLabel, tableRef,
      widthTol, lengthTol, sq, flatness, thRange, warnings,
      noWidthEntered: !w,
    };
  }, [thick, width, length, alloy, form, cut, temper, isAero, alloyInfo]);

  // ── UI helpers ───────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white font-medium text-neutral-900 outline-none";
  const labelCls = "block text-xs font-semibold mb-1.5 text-neutral-600";
  const hasResults = results && !results.invalid;

  const TolCard = ({ title, color, border, ref:refLabel, dimmed, children }) => (
    <div style={{ borderTopColor:border }}
      className={`bg-white rounded-2xl shadow p-5 border-t-2 hover:shadow-md transition-shadow ${dimmed?'opacity-40 pointer-events-none':''}`}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color }} className="text-xs font-bold uppercase tracking-wider">{title}</p>
        {refLabel && <span className="text-xs text-neutral-400 font-mono">{refLabel}</span>}
      </div>
      {children}
    </div>
  );

  const TolDisplay = ({ tol, sym, nominal, label }) => (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-neutral-900 leading-none">{sym ? '±' : '+'}{fmtFrac(tol)}</div>
          <div className="text-xs font-semibold text-green-600">({fmt(tol,4)}")</div>
        </div>
        {!sym && (
          <>
            <div className="text-neutral-200 text-xl">/</div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-neutral-400 leading-none">0"</div>
              <div className="text-xs font-semibold text-neutral-300">No minus</div>
            </div>
          </>
        )}
      </div>
      {nominal > 0 && (
        <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-200 text-xs space-y-0.5">
          <div className="flex justify-between"><span className="text-neutral-400">Specified</span><span className="font-bold text-neutral-800">{fmt(nominal)}"</span></div>
          {sym && <div className="flex justify-between"><span className="text-neutral-400">Min Accept.</span><span className="font-bold text-red-700">{fmt(nominal - tol)}"</span></div>}
          <div className="flex justify-between"><span className="text-neutral-400">Max Accept.</span><span className="font-bold text-green-700">{fmt(nominal + tol)}"</span></div>
        </div>
      )}
    </>
  );

  const WarnBanner = ({ warn }) => {
    const cfg = {
      error:{ bg:'bg-red-50',   bd:'border-red-300',   ic:'text-red-500',   tx:'text-red-800',   lbl:'Error' },
      aero: { bg:'bg-blue-50',  bd:'border-blue-300',  ic:'text-blue-500',  tx:'text-blue-800',  lbl:'Aerospace Alloy' },
      info: { bg:'bg-amber-50', bd:'border-amber-200', ic:'text-amber-500', tx:'text-amber-800', lbl:'Note' },
    }[warn.level] || {};
    return (
      <div className={`${cfg.bg} border ${cfg.bd} rounded-xl p-3 flex items-start gap-2`}>
        <AlertCircle className={`w-4 h-4 ${cfg.ic} flex-shrink-0 mt-0.5`}/>
        <p className={`text-xs ${cfg.tx}`}><span className="font-bold">{cfg.lbl}: </span>{warn.msg}</p>
      </div>
    );
  };

  const cutOptions = form === 'coil'
    ? [{ v:'slit', l:'Slit Coil' }]
    : [{ v:'sheared', l:'Sheared' }, { v:'sawed', l:'Sawed' }];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0;}
        input::-webkit-inner-spin-button,input::-webkit-outer-spin-button{-webkit-appearance:none;}
        input[type=number]{-moz-appearance:textfield;}
        .glass-card{background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);}
        .rrow{transition:background 0.1s;}
        .rrow:hover{background:#f8fafc;}
        .hrow td{font-weight:700 !important;background:#fef2f2 !important;}
        .aerorow td{font-weight:700 !important;background:#eff6ff !important;}
      `}}/>

      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-4 sm:p-6"
           style={{fontFamily:"'Inter',sans-serif"}}>
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Header */}
          <div className="glass-card rounded-2xl shadow-2xl p-5 border-t-4 border-red-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">Aluminum Tolerance Lookup</h1>
                <p className="text-sm text-neutral-500 font-medium">ANSI H35.2-2024 — All tolerances from published standard</p>
              </div>
              <button onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-neutral-700 to-neutral-800 text-white rounded-xl hover:from-neutral-800 hover:to-neutral-900 font-semibold text-sm border border-neutral-600">
                <RefreshCw className="w-4 h-4"/>Clear
              </button>
            </div>

            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-4 border border-neutral-200">
              <h2 className="text-sm font-bold mb-3 text-neutral-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                Material Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
                <div>
                  <label className={labelCls}>Alloy</label>
                  <select value={alloy} onChange={e=>handleAlloyChange(e.target.value)} className={inputCls}>
                    <optgroup label="1xxx">{['1100'].map(a=><option key={a}>{a}</option>)}</optgroup>
                    <optgroup label="2xxx">{['2014','2024','2219'].map(a=><option key={a}>{a}</option>)}</optgroup>
                    <optgroup label="3xxx">{['3003','3004','3105'].map(a=><option key={a}>{a}</option>)}</optgroup>
                    <optgroup label="5xxx">{['5005','5052','5083','5086','5454','5456'].map(a=><option key={a}>{a}</option>)}</optgroup>
                    <optgroup label="6xxx">{['6061'].map(a=><option key={a}>{a}</option>)}</optgroup>
                    <optgroup label="7xxx">{['7050','7075','7475'].map(a=><option key={a}>{a}</option>)}</optgroup>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Temper</label>
                  <select value={temper} onChange={e=>setTemper(e.target.value)} className={inputCls}>
                    {(TEMPER_MAP[alloy]||[]).map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Form</label>
                  <select value={form} onChange={e=>handleFormChange(e.target.value)} className={inputCls}>
                    {(alloyInfo?.forms||['sheet','plate','coil']).map(f=>(
                      <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Cut Method</label>
                  <select value={cut} onChange={e=>setCut(e.target.value)} className={inputCls}>
                    {cutOptions.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Thickness (in) <span className="text-red-600">*</span></label>
                  <input type="number" step="0.001" min="0.006" max="12" value={thick}
                    onChange={e=>setThick(e.target.value)} placeholder="e.g. 0.125" className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>Width (in) <span className="text-red-600">*</span></label>
                  <input type="number" step="0.125" min="1" max="200" value={width}
                    onChange={e=>setWidth(e.target.value)} placeholder="e.g. 48.0" className={inputCls}/>
                  {!width && <p className="text-xs text-red-400 mt-0.5">Required for gauge tol</p>}
                </div>
                <div>
                  <label className={labelCls}>Length (in)</label>
                  <input type="number" step="0.25" min="1" max="720" value={length}
                    onChange={e=>setLength(e.target.value)} placeholder="e.g. 120" className={inputCls}
                    disabled={form==='coil'} style={form==='coil'?{opacity:0.4}:{}}/>
                </div>
              </div>
              {/* Badges */}
              {hasResults && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border
                    ${results.isAero ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                    {results.isAero ? 'Aerospace — Table 7.7b' : 'Standard — Table 7.7a'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border
                    ${results.isCoil ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : results.isPlate ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {form} / {cut}
                  </span>
                  {results.wBandLabel && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Width band: {results.wBandLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {results?.warnings?.length > 0 && (
            <div className="space-y-2">{results.warnings.map((w,i)=><WarnBanner key={i} warn={w}/>)}</div>
          )}

          {/* Error */}
          {results?.invalid && (
            <div className="glass-card rounded-2xl shadow p-5 flex items-center gap-3 border-l-4 border-red-500">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0"/>
              <p className="text-sm font-semibold text-red-700">{results.msg}</p>
            </div>
          )}

          {/* Placeholder */}
          {!results && (
            <div className="glass-card rounded-2xl shadow p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-8 h-8 text-neutral-300"/>
              </div>
              <p className="text-neutral-500 font-semibold text-lg">Enter thickness and width to begin</p>
              <p className="text-neutral-400 text-sm mt-1">Width is required — gauge tolerance varies by width band in H35.2 Tables 7.7a/b</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200">Non-aerospace → Table 7.7a (8 width bands)</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">2014/2024/2219/7050/7075/7475 → Table 7.7b (tighter, 12 bands)</span>
                <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">Sheet width/length are ±, not plus-only</span>
              </div>
            </div>
          )}

          {/* Results */}
          {hasResults && (<>

            {/* Row 1 — Dimensional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Thickness */}
              <TolCard title="Thickness (Gauge)" color="#b91c1c" border="#dc2626" ref={results.tableRef}>
                {results.noWidthEntered ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <p className="font-bold mb-1">Width required</p>
                    <p>Gauge tolerance in H35.2 is a function of BOTH thickness and width. Enter width to get the correct value.</p>
                  </div>
                ) : results.useThTol === null ? (
                  <p className="text-sm text-red-600 font-semibold">No applicable tolerance — width exceeds the table range for this thickness.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-center">
                        <div className="text-2xl font-extrabold text-neutral-900 leading-none">±{fmt(results.useThTol)}"</div>
                        <div className="text-xs font-semibold text-blue-600">Symmetric ±</div>
                      </div>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-200 text-xs space-y-0.5">
                      <div className="flex justify-between"><span className="text-neutral-400">Nominal</span><span className="font-bold text-neutral-800">{fmt(results.th)}"</span></div>
                      <div className="flex justify-between"><span className="text-neutral-400">Min Accept.</span><span className="font-bold text-red-700">{fmt(results.thRange?.min)}"</span></div>
                      <div className="flex justify-between"><span className="text-neutral-400">Max Accept.</span><span className="font-bold text-green-700">{fmt(results.thRange?.max)}"</span></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Width band: <span className="font-bold">{results.wBandLabel}</span></p>
                  </>
                )}
              </TolCard>

              {/* Width */}
              {results.widthTol ? (
                <TolCard title="Width" color="#1d4ed8" border="#3b82f6" ref={results.widthTol.ref}>
                  <TolDisplay tol={results.widthTol.tol} sym={results.widthTol.sym} nominal={results.w}/>
                  <p className="text-xs text-neutral-500 mt-2">{results.widthTol.note}</p>
                </TolCard>
              ) : (
                <TolCard title="Width" color="#9ca3af" border="#d1d5db" dimmed>
                  <p className="text-sm text-neutral-400 italic mt-6">Enter width to calculate</p>
                </TolCard>
              )}

              {/* Length */}
              {results.isCoil ? (
                <TolCard title="Length" color="#9ca3af" border="#d1d5db" dimmed>
                  <p className="text-sm font-bold text-purple-700 mt-2">N/A — Coil</p>
                  <p className="text-xs text-neutral-400 mt-1">Coil is continuous — length tolerance does not apply.</p>
                </TolCard>
              ) : results.lengthTol ? (
                <TolCard title="Length" color="#7e22ce" border="#a855f7" ref={results.lengthTol.ref}>
                  <TolDisplay tol={results.lengthTol.tol} sym={results.lengthTol.sym} nominal={results.l}/>
                  <p className="text-xs text-neutral-500 mt-2">{results.lengthTol.note}</p>
                </TolCard>
              ) : (
                <TolCard title="Length" color="#9ca3af" border="#d1d5db" dimmed>
                  <p className="text-sm text-neutral-400 italic mt-6">Enter length to calculate</p>
                </TolCard>
              )}
            </div>

            {/* Row 2 — Form tolerances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Flatness */}
              <TolCard title="Flatness / Bow" color="#92400e" border="#f59e0b" ref={results.flatness?.label}>
                {results.flatness?.isTable ? (
                  <>
                    <p className="text-xs text-neutral-500 mb-2">{results.flatness.note}</p>
                    <div className="space-y-1">
                      {results.flatness.rows.map((r,i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-neutral-100 last:border-0">
                          <span className="text-xs text-neutral-500">{r.band}</span>
                          <span className="text-xs font-bold text-neutral-800">{fmtFrac(r.tol)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-extrabold text-neutral-900 leading-tight mb-2">{results.flatness?.simple}</p>
                    <p className="text-xs text-neutral-500">{results.flatness?.note}</p>
                  </>
                )}
              </TolCard>

              {/* Squareness */}
              {results.sq ? (
                <TolCard title="Squareness" color="#065f46" border="#10b981" ref="H35.2 Table 7.14">
                  <p className="text-2xl font-extrabold text-neutral-900 leading-none mb-1">Δ max {fmtFrac(results.sq.tol)}</p>
                  <p className="text-xs text-neutral-500 mb-2">({fmt(results.sq.tol,4)}")</p>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs text-neutral-600 space-y-0.5">
                    <p>Width = {results.sq.wFt.toFixed(2)} ft | Length = {results.sq.lFt.toFixed(2)} ft</p>
                    <p>Difference between diagonal lengths must not exceed this value</p>
                    <p className="text-neutral-400">Rounded up to nearest 1/16" per Table 7.14 footnote</p>
                  </div>
                </TolCard>
              ) : (
                <TolCard title="Squareness" color="#9ca3af" border="#d1d5db" dimmed>
                  {results.isCoil
                    ? <p className="text-sm font-bold text-purple-700 mt-2">N/A — Coil</p>
                    : <p className="text-sm text-neutral-400 italic mt-6">Enter width and length to calculate</p>}
                </TolCard>
              )}

              {/* Lateral Bow / Camber */}
              <TolCard title="Lateral Bow" color="#9a3412" border="#f97316" ref={results.isCoil ? 'H35.2 Table 7.12' : 'H35.2 Table 7.13'}>
                {results.isCoil ? (
                  <>
                    <p className="text-xs text-neutral-500 mb-2">Coil lateral bow per Table 7.12 — varies by width and thickness</p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-800">
                      See H35.2 Table 7.12: allowable deviation in 6 ft span, by width band
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-neutral-500 mb-2">H35.2 Table 7.13 — deviation of edge from straight, by width and length</p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-800">
                      Values scale with width and length. Open reference table below for full H35.2 Table 7.13.
                    </div>
                  </>
                )}
              </TolCard>
            </div>

            {/* Summary */}
            <div className="bg-neutral-800 rounded-2xl px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className={`font-bold px-2 py-1 rounded uppercase tracking-wide ${results.isAero ? 'bg-blue-700 text-white' : 'bg-red-700 text-white'}`}>
                  ANSI H35.2-2024
                </span>
                <span className="font-bold text-neutral-200">
                  {alloy}-{temper} {form} {fmt(results.th,3)}"
                  {results.w?` × ${fmt(results.w,3)}"`:''}{results.l&&!results.isCoil?` × ${fmt(results.l,3)}"`:''}</span>
                {results.useThTol !== null && !results.noWidthEntered && (
                  <span className="text-white">
                    Gauge: <span className="font-bold text-amber-400">±{fmt(results.useThTol)}"</span>
                    <span className="text-neutral-400 ml-2">({fmt(results.thRange?.min)}"–{fmt(results.thRange?.max)}")</span>
                  </span>
                )}
                {results.widthTol && (
                  <span className="text-white">
                    Width: <span className="font-bold text-blue-400">{results.widthTol.sym ? '±' : '+'}{fmtFrac(results.widthTol.tol)}</span>
                  </span>
                )}
                {results.lengthTol && (
                  <span className="text-white">
                    Length: <span className="font-bold text-purple-400">{results.lengthTol.sym ? '±' : '+'}{fmtFrac(results.lengthTol.tol)}</span>
                  </span>
                )}
                {results.sq && (
                  <span className="text-white">Sq Δ: <span className="font-bold text-green-400">{fmtFrac(results.sq.tol)}</span></span>
                )}
                {results.isAero && <span className="text-blue-300 font-semibold">Aerospace Table 7.7b</span>}
              </div>
            </div>
          </>)}

          {/* Reference tables */}
          <div className="glass-card rounded-2xl shadow overflow-hidden">
            <button onClick={()=>setShowRef(v=>!v)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 transition-colors border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-500"/>
                <span className="text-sm font-bold text-neutral-700 uppercase tracking-wide">H35.2-2024 Reference Tables</span>
                <span className="text-xs text-neutral-400">(full verified data from published standard)</span>
              </div>
              {showRef ? <ChevronDown className="w-4 h-4 text-neutral-500"/> : <ChevronRight className="w-4 h-4 text-neutral-500"/>}
            </button>

            {showRef && (
              <div className="p-5 space-y-6">
                {/* Table 7.7a */}
                <div>
                  <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    H35.2 Table 7.7a — Thickness Tolerances, Non-Aerospace (symmetric ±)
                  </p>
                  <p className="text-xs text-neutral-400 mb-2">Width bands in inches (metric-derived: 1m, 1.5m, 2m, 2.5m, 3m, 3.5m, 4m, 4.5m)</p>
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <table className="text-xs w-full" style={{minWidth:'700px'}}>
                      <thead><tr className="bg-neutral-800 text-white">
                        <th className="px-3 py-2 text-left whitespace-nowrap">Thickness (in)</th>
                        {['≤39.37"','39.37–59.06"','59.06–78.74"','78.74–98.43"','98.43–118.11"','118.11–137.80"','137.80–157.48"','157.48–177.17"']
                          .map((h,i)=><th key={i} className="px-2 py-2 text-right whitespace-nowrap font-normal">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {TABLE_7_7A.map((row, ri) => {
                          const th = parseFloat(thick);
                          const w  = parseFloat(width);
                          const isActiveRow = th > 0 && !isAero && th > row.minT - 0.000005 && th <= row.maxT;
                          const wIdx = w > 0 ? BANDS_7A.findIndex(b => w <= b) : -1;
                          const col  = wIdx === -1 ? BANDS_7A.length - 1 : wIdx;
                          return (
                            <tr key={ri} className={`rrow border-b border-neutral-100 ${isActiveRow ? 'hrow' : ''}`}>
                              <td className="px-3 py-1.5 font-mono whitespace-nowrap">{row.minT.toFixed(4)}"–{row.maxT.toFixed(4)}"</td>
                              {row.t.map((tol, ci) => {
                                const isActive = isActiveRow && ci === col;
                                return (
                                  <td key={ci} className={`px-2 py-1.5 text-right font-mono ${isActive ? 'bg-red-200 font-extrabold text-red-800' : tol === null ? 'text-neutral-200' : ''}`}>
                                    {tol === null ? '—' : `±${tol.toFixed(4)}`}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Width / Length summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">H35.2 Table 7.8 — Width, Sheared Sheet & Plate</p>
                    <div className="overflow-x-auto rounded-lg border border-neutral-200">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-neutral-800 text-white">
                          <th className="px-3 py-2 text-left">Thickness</th>
                          <th className="px-3 py-2 text-right">≤6"</th>
                          <th className="px-3 py-2 text-right">6–24"</th>
                          <th className="px-3 py-2 text-right">24–60"</th>
                          <th className="px-3 py-2 text-right">60–96"</th>
                          <th className="px-3 py-2 text-right">96–132"</th>
                        </tr></thead>
                        <tbody>
                          <tr className="rrow border-b border-neutral-100">
                            <td className="px-3 py-1.5">0.006–0.124" <span className="text-green-700 font-bold">(±)</span></td>
                            <td className="px-3 py-1.5 text-right font-mono">±1/16</td>
                            <td className="px-3 py-1.5 text-right font-mono">±3/32</td>
                            <td className="px-3 py-1.5 text-right font-mono">±1/8</td>
                            <td className="px-3 py-1.5 text-right font-mono">±1/8</td>
                            <td className="px-3 py-1.5 text-right font-mono">±5/32</td>
                          </tr>
                          <tr className="rrow border-b border-neutral-100">
                            <td className="px-3 py-1.5">0.125–0.249" <span className="text-green-700 font-bold">(±)</span></td>
                            <td className="px-3 py-1.5 text-right font-mono">±3/32</td>
                            <td className="px-3 py-1.5 text-right font-mono">±3/32</td>
                            <td className="px-3 py-1.5 text-right font-mono">±1/8</td>
                            <td className="px-3 py-1.5 text-right font-mono">±5/32</td>
                            <td className="px-3 py-1.5 text-right font-mono">±3/16</td>
                          </tr>
                          <tr className="rrow">
                            <td className="px-3 py-1.5">0.250–0.499" <span className="text-blue-700 font-bold">(+only)</span></td>
                            <td className="px-3 py-1.5 text-right font-mono">+1/4</td>
                            <td className="px-3 py-1.5 text-right font-mono">+5/16</td>
                            <td className="px-3 py-1.5 text-right font-mono">+3/8</td>
                            <td className="px-3 py-1.5 text-right font-mono">+3/8</td>
                            <td className="px-3 py-1.5 text-right font-mono">+7/16</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">H35.2 Table 7.11 — Width, Slit Coil (±)</p>
                    <div className="overflow-x-auto rounded-lg border border-neutral-200">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-neutral-800 text-white">
                          <th className="px-3 py-2 text-left">Thickness</th>
                          <th className="px-3 py-2 text-right">≤6"</th>
                          <th className="px-3 py-2 text-right">6–12"</th>
                          <th className="px-3 py-2 text-right">12–24"</th>
                          <th className="px-3 py-2 text-right">24–48"</th>
                          <th className="px-3 py-2 text-right">48–60"</th>
                        </tr></thead>
                        <tbody>
                          {T7_11.map((row,i) => (
                            <tr key={i} className="rrow border-b border-neutral-100">
                              <td className="px-3 py-1.5">{row.minT.toFixed(3)}"–{row.maxT.toFixed(3)}"</td>
                              {row.vals.slice(0,5).map((v,j) => (
                                <td key={j} className="px-3 py-1.5 text-right font-mono">{v===null?'—':v < 0.02 ? v.toFixed(3) : fmtFrac(v).replace('"','')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">All values symmetric ± per H35.2 Table 7.11</p>
                  </div>
                </div>

                {/* Squareness */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs">
                  <p className="font-bold text-neutral-700 mb-1">H35.2 Table 7.14 — Squareness Formula</p>
                  <div className="grid grid-cols-2 gap-x-6 text-neutral-600">
                    <div><span className="font-semibold">Width ≤ 3 ft:</span>
                      <p>Length ≤ 12 ft: 3/32 × width (ft)</p>
                      <p>Length &gt; 12 ft: 9/64 × width (ft)</p>
                    </div>
                    <div><span className="font-semibold">Width &gt; 3 ft:</span>
                      <p>Length ≤ 12 ft: 5/64 × width (ft)</p>
                      <p>Length &gt; 12 ft: 7/64 × width (ft)</p>
                    </div>
                  </div>
                  <p className="text-neutral-400 mt-1 italic">Round result upward to nearest 1/16" per footnote 4</p>
                </div>

                {/* Disclaimer */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"/>
                  <p className="text-xs text-green-800">
                    <span className="font-bold">All tolerance values verified against ANSI H35.2-2024.</span>{' '}
                    Thickness tolerances (Tables 7.7a/b), width tolerances (Tables 7.8/7.11), length tolerances (Table 7.9),
                    squareness (Table 7.14), and flatness (Tables 7.17/7.18) are sourced directly from the 2024 edition.
                    Always verify against mill certifications and the applicable material specification (ASTM B209, AMS, etc.)
                    for acceptance and rejection decisions.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
