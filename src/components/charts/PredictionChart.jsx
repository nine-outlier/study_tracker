import React, { useState, useMemo } from 'react';

const PredictionChart = ({ trendData, rankingEngine, appSettings }) => {
  const [newQuestions, setNewQuestions] = useState(50);
  const [predictedScoreInput, setPredictedScoreInput] = useState(75);

  // =========================
  // Robust Trend Analysis v3
  // Fixes: mislabeling "1,5,10,7,8" as Linear: Negative by:
  // - Separating (A) plateau window (last 30%) from (B) direction window (min 4 points)
  // - Adding non-monotonic shape detection: U-shape, n-shape (hump), N-shape, inverted-N
  // - Adding broad buckets: Roughly Increasing / Roughly Decreasing / Mixed
  // - Keeping robust core: Theil–Sen + MAD(Hampel) residual filtering + ceiling-aware exponential candidates
  // Score domain: 0..100 (fractional allowed), index-based x.
  // =========================

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const median = (arr) => {
    if (!arr?.length) return NaN;
    const a = [...arr].sort((x, y) => x - y);
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  };

  const mad = (arr) => {
    if (!arr?.length) return NaN;
    const m = median(arr);
    const dev = arr.map(v => Math.abs(v - m));
    return median(dev);
  };

  const madSigma = (arr) => {
    const m = mad(arr);
    return Number.isFinite(m) ? 1.4826 * m : NaN;
  };

  const trimmedMean = (arr, trimFrac = 0.2) => {
    if (!arr?.length) return NaN;
    const a = [...arr].sort((x, y) => x - y);
    const k = Math.floor(a.length * trimFrac);
    const start = k;
    const end = Math.max(k + 1, a.length - k);
    const slice = a.slice(start, end);
    const sum = slice.reduce((s, v) => s + v, 0);
    return sum / slice.length;
  };

  const theilSen = (xs, ys) => {
    const n = Math.min(xs.length, ys.length);
    if (n < 2) return { slope: 0, intercept: ys[0] ?? 0 };

    const slopes = [];
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = xs[j] - xs[i];
        if (dx === 0) continue;
        slopes.push((ys[j] - ys[i]) / dx);
      }
    }
    const slope = slopes.length ? median(slopes) : 0;

    const intercepts = [];
    for (let i = 0; i < n; i++) intercepts.push(ys[i] - slope * xs[i]);
    const intercept = median(intercepts);

    return { slope, intercept };
  };

  const predictLine = (model, x) => model.slope * x + model.intercept;

  // Robust pseudo-R² on original scale via L1 loss (stable under outliers)
  const robustFitScore = (xs, ys, predictFn) => {
    const n = Math.min(xs.length, ys.length);
    if (n < 2) return { r2: 0, mae: Infinity, absRes: [] };

    const yMed = median(ys);
    let absResSum = 0;
    let absDevSum = 0;
    const absRes = [];

    for (let i = 0; i < n; i++) {
      const yhat = predictFn(xs[i]);
      const r = Math.abs(ys[i] - yhat);
      absRes.push(r);
      absResSum += r;
      absDevSum += Math.abs(ys[i] - yMed);
    }

    const mae = absResSum / n;
    const r2 = absDevSum > 0 ? 1 - (absResSum / absDevSum) : 0;
    return { r2, mae, absRes };
  };

  // Hampel-style outlier filter using MAD of residuals to a model
  const filterOutliersByResidualMAD = (xs, ys, predictFn, k = 3.0) => {
    const n = Math.min(xs.length, ys.length);
    if (n < 3) return { xs, ys, outlierCount: 0, residSigma: NaN };

    const residuals = [];
    for (let i = 0; i < n; i++) residuals.push(ys[i] - predictFn(xs[i]));

    const resMed = median(residuals);
    const sigma = madSigma(residuals);
    const thresh = (Number.isFinite(sigma) && sigma > 0) ? k * sigma : Infinity;

    const fx = [];
    const fy = [];
    let outlierCount = 0;

    for (let i = 0; i < n; i++) {
      const ok = Math.abs(residuals[i] - resMed) <= thresh;
      if (ok) {
        fx.push(xs[i]);
        fy.push(ys[i]);
      } else {
        outlierCount += 1;
      }
    }

    return { xs: fx, ys: fy, outlierCount, residSigma: sigma };
  };

  const splitHalves = (xs, ys) => {
    const n = Math.min(xs.length, ys.length);
    if (n < 4) return null;
    const mid = Math.floor(n / 2);
    return {
      xs1: xs.slice(0, mid),
      ys1: ys.slice(0, mid),
      xs2: xs.slice(mid),
      ys2: ys.slice(mid),
    };
  };

  // Spearman correlation (rank correlation) on a window; more robust than Pearson under outliers
  const spearman = (xs, ys) => {
    const n = Math.min(xs.length, ys.length);
    if (n < 2) return 0;

    const rank = (arr) => {
      const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
      const ranks = new Array(arr.length).fill(0);

      let i = 0;
      while (i < indexed.length) {
        let j = i;
        while (j + 1 < indexed.length && indexed[j + 1].v === indexed[i].v) j++;
        const avgRank = (i + j) / 2 + 1; // ranks start at 1
        for (let k = i; k <= j; k++) ranks[indexed[k].i] = avgRank;
        i = j + 1;
      }
      return ranks;
    };

    const rx = rank(xs);
    const ry = rank(ys);

    const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
    const mx = mean(rx);
    const my = mean(ry);

    let num = 0;
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < n; i++) {
      const vx = rx[i] - mx;
      const vy = ry[i] - my;
      num += vx * vy;
      dx += vx * vx;
      dy += vy * vy;
    }

    const denom = Math.sqrt(dx * dy);
    return denom === 0 ? 0 : num / denom;
  };

  // Convert first differences to signs with a noise threshold, then count sign changes.
  // This is the key to identifying U / n / N shapes.
  const diffSignProfile = (ys, eps) => {
    if (!ys || ys.length < 3) return { signs: [], changes: 0, peaks: 0, troughs: 0 };

    const rawSigns = [];
    for (let i = 1; i < ys.length; i++) {
      const d = ys[i] - ys[i - 1];
      if (d > eps) rawSigns.push(1);
      else if (d < -eps) rawSigns.push(-1);
      else rawSigns.push(0);
    }

    // Compress zeros by skipping them for shape-change counting
    const signs = rawSigns.filter(s => s !== 0);

    let changes = 0;
    let peaks = 0;
    let troughs = 0;

    for (let i = 1; i < signs.length; i++) {
      if (signs[i] !== signs[i - 1]) {
        changes += 1;
        // + -> - indicates a local peak; - -> + indicates a trough
        if (signs[i - 1] === 1 && signs[i] === -1) peaks += 1;
        if (signs[i - 1] === -1 && signs[i] === 1) troughs += 1;
      }
    }

    return { signs, changes, peaks, troughs };
  };

  const requiredAverageToReachOverallAverage = (scores, targetAvg, k) => {
    const n = scores.length;
    const sum = scores.reduce((s, v) => s + v, 0);
    return (targetAvg * (n + k) - sum) / k;
  };

  // --- 1. ROBUST MATH ALGORITHM ---
  const analysis = useMemo(() => {
    const SCORE_MIN = 0;
    const SCORE_MAX = 100;

    const cfg = {
      // Windows
      recentFrac: 0.30,
      minTotal: 3,

      // Plateau window is strictly the last 30% (min 3), per requirement.
      minPlateauWindow: 3,

      // Direction window is used to prevent tiny recent windows from flipping sign (fixes 1,5,10,7,8).
      minDirectionWindow: 4,

      // Outliers + stability
      outlierK: 3.0,
      stabilityHigh: 6,
      stabilityModerate: 12,
      outlierRateHigh: 0.25,

      // Plateau detection (recent-only)
      plateauMinChange: 1.0,
      plateauSigmaFactor: 0.75,
      plateauMinSlope: 0.12,

      // Linear stable band
      linearStableSlope: 0.20,

      // Exponential detection (ceiling-aware)
      expEps: 1.0,
      expR2Lift: 0.08,
      expAccelFactor: 1.25,
      expMinSlope: 0.25,

      // Non-monotonic shape sensitivity
      shapeNoiseFloor: 1.0,       // minimum eps for diff sign classification
      shapeSigmaFactor: 0.5,      // eps = max(shapeNoiseFloor, shapeSigmaFactor * residSigma)

      // Projection blending when shape is non-monotonic to avoid overreacting to a short local dip/peak
      nonMonoProjectionBlend: 0.35, // blend weight for sustainableScore

      // Sustainable average
      sustainWindowMax: 10,
      sustainTrimFrac: 0.2,

      projectHorizon: 1,

      ...((appSettings && appSettings.trendAnalysis) || {})
    };

    if (!Array.isArray(trendData) || trendData.length < cfg.minTotal) {
      return {
        status: "Insufficient Data",
        stability: "Unknown",
        projectedScore: 0,
        averageScore: 0,
        totalQuestions: 0,
        trendModel: 'none',
        stdError: 0,
        slope: 0,
        rSquared: 0,
        correlation: 0,
        sustainableScore: 0,
        outlierRate: 0,
        outliersRecent: 0,
        r2Exponential: 0,
      };
    }

    // Clean scores; clamp to [0,100]
    const cleaned = [];
    for (const d of trendData) {
      const s = Number(d?.score);
      if (Number.isFinite(s)) cleaned.push({ score: clamp(s, SCORE_MIN, SCORE_MAX), total: d?.total });
    }
    if (cleaned.length < cfg.minTotal) {
      return {
        status: "Insufficient Data",
        stability: "Unknown",
        projectedScore: 0,
        averageScore: 0,
        totalQuestions: 0,
        trendModel: 'none',
        stdError: 0,
        slope: 0,
        rSquared: 0,
        correlation: 0,
        sustainableScore: 0,
        outlierRate: 0,
        outliersRecent: 0,
        r2Exponential: 0,
      };
    }

    const y = cleaned.map(d => d.score);
    const n = y.length;
    const x = Array.from({ length: n }, (_, i) => i);

    // Overall model (used only as a stabilizing signal, not as the primary status driver)
    const modelAll = theilSen(x, y);
    const overallSlope = modelAll.slope;

    // Plateau window (strictly last 30%, min 3)
    const plateauN = Math.max(cfg.minPlateauWindow, Math.ceil(n * cfg.recentFrac));
    const plateauStart = Math.max(0, n - plateauN);
    const xP = x.slice(plateauStart);
    const yP = y.slice(plateauStart);

    // Direction window (prevents tiny-window sign flips)
    const directionN = Math.max(cfg.minDirectionWindow, plateauN);
    const directionStart = Math.max(0, n - directionN);
    const xD = x.slice(directionStart);
    const yD = y.slice(directionStart);

    // Robust linear on plateau window + MAD outlier filtering
    const modelP0 = theilSen(xP, yP);
    const predP0 = (t) => predictLine(modelP0, t);
    const filtP = filterOutliersByResidualMAD(xP, yP, predP0, cfg.outlierK);

    const xUse = (filtP.xs.length >= cfg.minPlateauWindow) ? filtP.xs : xP;
    const yUse = (filtP.ys.length >= cfg.minPlateauWindow) ? filtP.ys : yP;

    const modelP = theilSen(xUse, yUse);
    const predLin = (t) => predictLine(modelP, t);

    const fitLin = robustFitScore(xUse, yUse, predLin);
    const residSigma = Number.isFinite(filtP.residSigma) ? filtP.residSigma : madSigma(fitLin.absRes);

    const outlierCount = filtP.outlierCount ?? 0;
    const outlierRate = yP.length ? (outlierCount / yP.length) : 0;

    // Stability label from robust sigma
    let stabilityLabel = "Unknown";
    if (Number.isFinite(residSigma)) {
      if (residSigma < cfg.stabilityHigh) stabilityLabel = "High";
      else if (residSigma < cfg.stabilityModerate) stabilityLabel = "Moderate";
      else stabilityLabel = "Low";
    }

    const volatileBySigma = Number.isFinite(residSigma) && residSigma >= cfg.stabilityModerate;
    const volatileByOutliers = outlierRate >= cfg.outlierRateHigh;
    const isVolatile = volatileBySigma || volatileByOutliers;

    // Plateau detection (plateau window only; dominant)
    const plateauSlope = modelP.slope; // points per test
    const windowSpan = Math.max(1, (xP[xP.length - 1] ?? (n - 1)) - (xP[0] ?? plateauStart));
    const expectedChange = Math.abs(plateauSlope) * windowSpan;

    const adaptivePlateauThresh = Math.max(
      cfg.plateauMinChange,
      Number.isFinite(residSigma) ? cfg.plateauSigmaFactor * residSigma : cfg.plateauMinChange
    );

    const isPlateau =
      (expectedChange <= adaptivePlateauThresh) ||
      (Math.abs(plateauSlope) < cfg.plateauMinSlope);

    // Direction model (used for “roughly increasing/decreasing” and non-monotonic shapes)
    const modelDir = theilSen(xD, yD);
    const dirSlope = modelDir.slope;

    // Exponential candidates (ceiling-aware), evaluated on original y scale, on plateau window
    const eps = cfg.expEps;
    const fitExpCandidate = (transform, inverse) => {
      const z = yUse.map(v => transform(v));
      if (z.some(v => !Number.isFinite(v))) return null;

      const m = theilSen(xUse, z);
      const predZ = (t) => predictLine(m, t);
      const predY = (t) => inverse(predZ(t));
      const score = robustFitScore(xUse, yUse, predY);
      return { predictY: predY, score };
    };

    const candA = fitExpCandidate(
      (v) => Math.log(v + eps),
      (z) => clamp(Math.exp(z) - eps, SCORE_MIN, SCORE_MAX)
    );

    const candB = fitExpCandidate(
      (v) => Math.log((SCORE_MAX - v) + eps),
      (z) => clamp(SCORE_MAX - (Math.exp(z) - eps), SCORE_MIN, SCORE_MAX)
    );

    let bestExp = null;
    if (candA && candB) bestExp = (candA.score.r2 >= candB.score.r2) ? candA : candB;
    else bestExp = candA || candB;

    // Acceleration gate inside plateau window
    const halves = splitHalves(xP, yP);
    let accelOK = false;
    if (halves) {
      const m1 = theilSen(halves.xs1, halves.ys1);
      const m2 = theilSen(halves.xs2, halves.ys2);
      const s1 = m1.slope;
      const s2 = m2.slope;
      const sameSign = (s1 === 0) ? (s2 !== 0) : (Math.sign(s1) === Math.sign(s2));
      const stronger = Math.abs(s2) >= cfg.expAccelFactor * Math.max(0.0001, Math.abs(s1));
      accelOK = sameSign && stronger;
    }

    const expBeatsLinear = bestExp && (bestExp.score.r2 >= fitLin.r2 + cfg.expR2Lift);
    const expSlopeEnough = Math.abs(plateauSlope) >= cfg.expMinSlope;
    const isExponential =
      !isVolatile &&
      !isPlateau &&
      !!bestExp &&
      expBeatsLinear &&
      expSlopeEnough &&
      (accelOK || yP.length <= 4);

    // Non-monotonic shape detection (U / n / N / inverted-N) on the direction window
    const epsDiff = Math.max(cfg.shapeNoiseFloor, Number.isFinite(residSigma) ? cfg.shapeSigmaFactor * residSigma : cfg.shapeNoiseFloor);
    const profile = diffSignProfile(yD, epsDiff);

    const hasU = profile.changes === 1 && profile.troughs === 1;         // down then up
    const hasHump = profile.changes === 1 && profile.peaks === 1;        // up then down ("n-shape" / hump)
    const hasN = profile.changes >= 2 && overallSlope > 0;               // up-down-up-ish with net up
    const hasInvN = profile.changes >= 2 && overallSlope < 0;            // down-up-down-ish with net down

    // Broad direction buckets (prevents “Linear: Negative” due to a small pullback)
    const roughlyIncreasing = (overallSlope > 0 && (dirSlope > 0 || (y[n - 1] - y[n - 2] > 0)));
    const roughlyDecreasing = (overallSlope < 0 && (dirSlope < 0 || (y[n - 1] - y[n - 2] < 0)));

    // Final status decision priority:
    // 1) Volatile, 2) Plateau, 3) Exponential, 4) Non-monotonic shapes, 5) Linear with stable band,
    // plus broad labels in the non-monotonic / ambiguous cases.
    let status = "Linear: Stable";
    let trendModel = "linear";

    if (isVolatile) {
      status = "Volatile / Unstable";
      trendModel = "volatile";
    } else if (isPlateau) {
      status = "Plateau";
      trendModel = "plateau";
    } else if (isExponential) {
      const direction = plateauSlope > 0 ? "Positive" : "Negative";
      status = `Exponential: ${direction}`;
      trendModel = "exponential";
    } else if (hasN) {
      status = "N-Shape: Roughly Increasing";
      trendModel = "nonmonotonic";
    } else if (hasInvN) {
      status = "Inverted-N: Roughly Decreasing";
      trendModel = "nonmonotonic";
    } else if (hasU) {
      status = "U-Shape: Recovery";
      trendModel = "nonmonotonic";
    } else if (hasHump) {
      status = "n-Shape: Pullback";
      trendModel = "nonmonotonic";
    } else {
      // Linear labels use the direction window slope (more stable than a tiny plateau window slope)
      if (Math.abs(dirSlope) < cfg.linearStableSlope) status = "Linear: Stable";
      else status = `Linear: ${dirSlope > 0 ? "Positive" : "Negative"}`;
      trendModel = "linear";

      // If the linear label would contradict the broad direction bucket, prefer the broad bucket.
      // This is the specific fix for sequences like 1,5,10,7,8.
      if (status === "Linear: Negative" && roughlyIncreasing) {
        status = "Roughly Increasing";
        trendModel = "nonmonotonic";
      } else if (status === "Linear: Positive" && roughlyDecreasing) {
        status = "Roughly Decreasing";
        trendModel = "nonmonotonic";
      }
    }

    // Projection: use robust plateau-window linear, but blend with sustainable score for non-monotonic shapes
    const nextX = (n - 1) + cfg.projectHorizon;
    const projectedLinear = clamp(predLin(nextX), SCORE_MIN, SCORE_MAX);

    const sustainN = Math.min(cfg.sustainWindowMax, n);
    const ySustain = y.slice(n - sustainN);
    const sustainableScoreRaw = clamp(trimmedMean(ySustain, cfg.sustainTrimFrac), SCORE_MIN, SCORE_MAX);

    const blendedProjected =
      (trendModel === "nonmonotonic")
        ? ((1 - cfg.nonMonoProjectionBlend) * projectedLinear + cfg.nonMonoProjectionBlend * sustainableScoreRaw)
        : projectedLinear;

    const projectedScore = Math.round(clamp(blendedProjected, SCORE_MIN, SCORE_MAX));

    // Average + total questions (existing semantics preserved)
    const totalQuestions = cleaned.reduce((acc, d) => acc + Number(d.total || 50), 0);
    const averageScore = y.length ? (y.reduce((a, b) => a + b, 0) / y.length) : 0;

    // Spearman correlation on direction window (useful UI signal)
    const corr = spearman(xD, yD);

    // Expose key stats; keep existing UI field names
    return {
      status,
      stability: stabilityLabel,
      projectedScore,
      averageScore: Math.round(averageScore),
      totalQuestions,
      trendModel,

      // UI: "Expected Deviation" now robust residual sigma (MADσ)
      stdError: Number.isFinite(residSigma) ? residSigma : 0,

      // UI: show direction slope (more reliable than tiny recent window)
      slope: dirSlope,

      // UI: robust fit on plateau window
      rSquared: fitLin.r2,

      // UI: Spearman rho on direction window
      correlation: corr,

      sustainableScore: Math.round(sustainableScoreRaw),
      outlierRate,
      outliersRecent: outlierCount,
      r2Exponential: bestExp ? bestExp.score.r2 : 0,
      n,
      plateauN,
      directionN,
      shapeChanges: profile.changes
    };
  }, [trendData, appSettings]);

  // --- 2. Advanced Benchmark Engine (dynamic “avg over next k tests”) ---
  const benchmarks = useMemo(() => {
    const currentAvg = analysis.averageScore;
    const currentStatus = rankingEngine ? rankingEngine.determineRank(currentAvg) : 'Unknown';

    // Tier targets (kept from existing logic)
    let nextTier = { label: "Mastered", target: 90 };
    if (currentAvg < 40) nextTier = { label: "Weak", target: 40 };
    else if (currentAvg < 60) nextTier = { label: "Developing", target: 60 };
    else if (currentAvg < 80) nextTier = { label: "Strong", target: 80 };
    else if (currentAvg < 90) nextTier = { label: "Mastered", target: 90 };
    else nextTier = { label: "Maxed", target: 100 };

    const k = (appSettings && appSettings.benchmarkK) ? Math.max(1, Math.floor(appSettings.benchmarkK)) : 3;

    const scores = (Array.isArray(trendData) ? trendData : [])
      .map(d => Number(d?.score))
      .filter(v => Number.isFinite(v))
      .map(v => Math.max(0, Math.min(100, v)));

    let rankUpMessage = "N/A";
    if (scores.length >= 1) {
      const needed = requiredAverageToReachOverallAverage(scores, nextTier.target, k);
      if (!Number.isFinite(needed)) {
        rankUpMessage = "N/A";
      } else if (needed <= 0) {
        rankUpMessage = "Secured";
      } else if (needed > 100) {
        let msg = `>100% (Requires >20 tests)`;
        for (let i = 1; i <= 20; i++) {
          const needI = requiredAverageToReachOverallAverage(scores, nextTier.target, i);
          if (needI <= 100) {
            msg = `${Math.ceil(needI)}% avg for ${i} tests`;
            break;
          }
        }
        rankUpMessage = msg;
      } else {
        rankUpMessage = `${Math.ceil(needed)}% avg for ${k} tests`;
      }
    }

    // Aim For: sustainable score + small, controlled increment
    const sustainable = Number.isFinite(analysis.sustainableScore) ? analysis.sustainableScore : currentAvg;
    const aimFor = Math.min(100, Math.ceil(sustainable + 2));

    return {
      aimFor,
      rankUpLabel: nextTier.label,
      rankUpScore: rankUpMessage,
      currentStatus
    };
  }, [analysis, trendData, rankingEngine, appSettings]);

  // --- 3. High-Precision Impact Simulator (unchanged) ---
  const simulateImpact = () => {
    const currentAvg = analysis.averageScore;
    const totalQ = analysis.totalQuestions;

    const numerator = (currentAvg * totalQ) + (predictedScoreInput * newQuestions);
    const denominator = totalQ + newQuestions;
    const newSimAvg = Math.round(numerator / denominator);

    const diff = newSimAvg - currentAvg;
    return { newAvg: newSimAvg, diff };
  };

  const simResult = simulateImpact();
  const getRankColorText = (score) =>
    rankingEngine ? rankingEngine.getRankClass(rankingEngine.determineRank(score)) : 'app-text-primary';

  const formatStat = (val, label, symbol) => (
    <div className="flex justify-between items-center text-xs">
      <span className="app-text-muted">
        {label} {symbol && <span className="opacity-50 font-sans">({symbol})</span>}
      </span>
      <span className="font-mono font-medium app-text-main">{val}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* 1. MATH-DRIVEN TREND */}
      <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase app-text-muted tracking-wider mb-2">Statistical Trend</h3>

          <div className="mb-4">
            <div className="text-xl font-bold app-text-main mb-1">
              {analysis.status}
            </div>
            <div className="text-sm app-text-muted flex items-center gap-2">
              Stability:
              <span className={`font-semibold ${
                analysis.stability === 'High' ? 'text-green-600 dark:text-green-400' :
                analysis.stability === 'Moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {analysis.stability}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mt-4 p-3 bg-opacity-50 app-bg-subtle rounded-lg border app-border-muted">
            {formatStat(`±${Math.round(analysis.stdError)}%`, "Expected Deviation", "MADσ")}
            {formatStat(Number.isFinite(analysis.slope) ? analysis.slope.toFixed(2) : "0.00", "Trend Slope (Direction)", "m")}
            {formatStat(`${analysis.correlation.toFixed(2)}`, "Rank Correlation", "ρ")}
            {formatStat(`${(analysis.rSquared * 100).toFixed(1)}%`, "Robust Fit (Plateau Window)", "R²")}
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
            {formatStat(benchmarks.currentStatus, "Current Status", null)}
          </div>
        </div>
      </div>

      {/* 2. PRECISE BENCHMARKS */}
      <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-5 flex flex-col justify-center gap-4">
        <h3 className="text-xs font-bold uppercase app-text-muted tracking-wider mb-1">Next Predicted Score</h3>

        <div className="flex items-center justify-between p-2.5 rounded border app-border-muted bg-opacity-50 hover:bg-opacity-100 transition-colors">
          <span className="text-sm font-medium app-text-main">Predicted Score</span>
          <span className={`text-2xl font-black ${getRankColorText(analysis.projectedScore)}`}>
            {analysis.projectedScore}%
          </span>
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1"></div>

        <h3 className="text-xs font-bold uppercase app-text-muted tracking-wider mb-1">Targets</h3>

        <div className="flex items-center justify-between p-2.5 rounded border app-border-muted bg-opacity-50 hover:bg-opacity-100 transition-colors">
          <span className="text-sm font-medium app-text-main">Aim For (Sustainable)</span>
          <span className="text-lg font-bold app-text-chart-3">{benchmarks.aimFor}%</span>
        </div>

        <div className="flex flex-col p-2.5 rounded border app-border-muted bg-opacity-50 hover:bg-opacity-100 transition-colors gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium app-text-main">To Reach '{benchmarks.rankUpLabel}'</span>
            <span className="text-lg font-bold app-text-chart-4 text-right">
              {benchmarks.rankUpScore}
            </span>
          </div>
        </div>
      </div>

      {/* 3. WEIGHTED IMPACT SIMULATOR */}
      <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-5 flex flex-col">
        <h3 className="text-xs font-bold uppercase app-text-muted tracking-wider mb-4">Impact Simulator</h3>

        <div className="flex-1 space-y-5">

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium app-text-main">Questions in Next Test</label>
              <span className="text-xs font-bold app-text-primary">{newQuestions}</span>
            </div>
            <input
              type="range" min="5" max="200" step="5"
              value={newQuestions}
              onChange={(e) => setNewQuestions(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-sky-600"
            />
            <div className="flex justify-between text-[10px] app-text-muted px-1 mt-1">
              <span>Quiz (10)</span>
              <span>Exam (100+)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium app-text-main">Hypothetical Score</label>
              <span className={`text-xs font-bold ${getRankColorText(predictedScoreInput)}`}>{predictedScoreInput}%</span>
            </div>
            <input
              type="range" min="0" max="100" step="1"
              value={predictedScoreInput}
              onChange={(e) => setPredictedScoreInput(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-sky-600"
            />
          </div>

          <div className="mt-auto pt-4 border-t app-border-muted">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold app-text-main">New Weighted Average</span>
              <span className="text-xl font-black app-text-main">{simResult.newAvg}%</span>
            </div>
            <div className="flex justify-end">
              <span className={`text-xs font-bold ${simResult.diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {simResult.diff > 0 ? '+' : ''}{simResult.diff}% impact
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default PredictionChart;
