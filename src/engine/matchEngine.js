/**
 * matchEngine.js
 * Pure functions for project-inventory matching and feasibility scoring.
 * No React imports or side effects.
 */

/**
 * Calculate the feasibility score and requirement status for a project given an inventory.
 * 
 * @param {Object} project - The project definition from projects.json
 * @param {Array} inventory - User's inventory items [{ id, componentId, qty, condition }]
 * @param {Array|Object} catalog - Components catalog (array or dictionary by id)
 * @param {Array} substitutes - Substitution rules array from substitutes.json
 * @returns {Object} Feasibility details including score, requirement statuses, missing parts, etc.
 */
export function calculateScore(project, inventory = [], catalog = [], substitutes = []) {
  if (!project || !project.requirements) {
    return {
      score: 0,
      requirements: [],
      missingParts: [],
      missingCostINR: 0,
      hasUntested: false,
      canBuildNow: false,
      criticalMissingCount: 0,
      totalMissingCount: 0,
    };
  }

  // Normalize catalog as map for quick lookup
  const catalogMap = Array.isArray(catalog)
    ? catalog.reduce((acc, c) => ({ ...acc, [c.id]: c }), {})
    : catalog;

  // Group inventory by componentId, separating working and untested, ignoring faulty
  const inventorySummary = {};
  for (const item of inventory) {
    if (!item || item.condition === 'Faulty' || item.qty <= 0) {
      continue;
    }
    if (!inventorySummary[item.componentId]) {
      inventorySummary[item.componentId] = {
        totalQty: 0,
        workingQty: 0,
        untestedQty: 0,
      };
    }
    const qty = Number(item.qty) || 0;
    inventorySummary[item.componentId].totalQty += qty;
    if (item.condition === 'Untested') {
      inventorySummary[item.componentId].untestedQty += qty;
    } else {
      inventorySummary[item.componentId].workingQty += qty;
    }
  }

  let totalWeight = 0;
  let weightedCoverageSum = 0;
  let hasUntestedUsed = false;
  let anyCriticalZero = false;
  let criticalMissingCount = 0;
  let totalMissingCount = 0;
  const missingParts = [];
  let missingCostINR = 0;

  const requirementResults = project.requirements.map((req) => {
    const needId = req.componentId;
    const needQty = Math.max(1, Number(req.qty) || 1);
    const isCritical = Boolean(req.critical);
    const weight = isCritical ? 3 : 1;
    totalWeight += weight;

    const catalogItem = catalogMap[needId] || {
      id: needId,
      name: needId,
      avgPriceINR: 100,
      avgWeightKg: 0.05,
    };

    const exactStock = inventorySummary[needId] || { totalQty: 0, workingQty: 0, untestedQty: 0 };
    const haveExact = exactStock.totalQty;

    let coverage = Math.min(1, haveExact / needQty);
    let status = 'missing';
    let substituteUsed = null;
    let usedUntestedForThis = false;

    if (haveExact >= needQty) {
      status = 'have';
      if (exactStock.untestedQty > 0) {
        usedUntestedForThis = true;
      }
    } else if (haveExact > 0) {
      status = 'partial';
      if (exactStock.untestedQty > 0) {
        usedUntestedForThis = true;
      }
    }

    // Check substitutes if exact coverage is less than 100%
    if (coverage < 1 && Array.isArray(substitutes)) {
      const validSubs = substitutes.filter((s) => s.needId === needId);
      for (const sub of validSubs) {
        const subStock = inventorySummary[sub.canUseId];
        if (subStock && subStock.totalQty > 0) {
          const combinedAvailable = haveExact + subStock.totalQty;
          const subCoverage = (sub.factor || 0.7) * Math.min(1, combinedAvailable / needQty);
          if (subCoverage > coverage) {
            coverage = subCoverage;
            status = 'substitute';
            const subCatalogItem = catalogMap[sub.canUseId];
            substituteUsed = {
              substituteId: sub.canUseId,
              substituteName: subCatalogItem ? subCatalogItem.name : sub.canUseId,
              factor: sub.factor,
              note: sub.note || `${subCatalogItem?.name || sub.canUseId} can substitute for this part`,
              availableQty: subStock.totalQty,
            };
            if (subStock.untestedQty > 0) {
              usedUntestedForThis = true;
            }
          }
        }
      }
    }

    if (usedUntestedForThis && coverage > 0) {
      hasUntestedUsed = true;
    }

    if (coverage === 0 && isCritical) {
      anyCriticalZero = true;
      criticalMissingCount += 1;
    }

    // Calculate missing qty
    const qtyMissing = Math.max(0, needQty - haveExact);
    if (qtyMissing > 0) {
      totalMissingCount += 1;
      const partCost = (catalogItem.avgPriceINR || 50) * qtyMissing;
      missingCostINR += partCost;
      missingParts.push({
        componentId: needId,
        componentName: catalogItem.name,
        qtyMissing,
        avgPriceINR: catalogItem.avgPriceINR || 50,
        totalCostINR: partCost,
        isCritical,
        status,
        substituteUsed,
      });
    }

    weightedCoverageSum += weight * coverage;

    return {
      componentId: needId,
      componentName: catalogItem.name,
      category: catalogItem.category || 'Misc',
      needQty,
      haveExact,
      coverage,
      status,
      critical: isCritical,
      qtyMissing,
      substituteUsed,
      usedUntested: usedUntestedForThis,
    };
  });

  let rawScore = totalWeight > 0 ? (weightedCoverageSum / totalWeight) * 100 : 0;
  let score = Math.round(rawScore + 1e-6);

  // Critical requirement cap: If ANY critical requirement has coverage 0 -> score = min(score, 40)
  if (anyCriticalZero) {
    score = Math.min(score, 40);
  }

  score = Math.max(0, Math.min(100, score));

  // canBuildNow is true if score is 100 and no critical requirements are missing or partial
  const canBuildNow = score === 100 && criticalMissingCount === 0 && totalMissingCount === 0;

  return {
    score,
    requirements: requirementResults,
    missingParts,
    missingCostINR,
    hasUntested: hasUntestedUsed,
    canBuildNow,
    criticalMissingCount,
    totalMissingCount,
  };
}

/**
 * Returns missing parts details for a project.
 */
export function getMissingParts(project, inventory = [], catalog = [], substitutes = []) {
  const result = calculateScore(project, inventory, catalog, substitutes);
  return {
    missingParts: result.missingParts,
    missingCostINR: result.missingCostINR,
    totalMissingCount: result.totalMissingCount,
    criticalMissingCount: result.criticalMissingCount,
  };
}

/**
 * Ranks all predefined projects based on current inventory.
 * 
 * @param {Array} inventory - User inventory
 * @param {Array} projects - Projects list
 * @param {Array|Object} catalog - Components catalog
 * @param {Array} substitutes - Substitute rules
 * @returns {Array} Sorted array of project matches
 */
export function rankProjects(inventory = [], projects = [], catalog = [], substitutes = []) {
  if (!Array.isArray(projects)) {
    return [];
  }

  const scoredProjects = projects.map((project) => {
    const analysis = calculateScore(project, inventory, catalog, substitutes);
    return {
      project,
      ...analysis,
    };
  });

  // Sort: highest score first, then least missing count, then lower difficulty
  const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };

  return scoredProjects.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.totalMissingCount !== b.totalMissingCount) {
      return a.totalMissingCount - b.totalMissingCount;
    }
    const diffA = difficultyOrder[a.project.difficulty] || 2;
    const diffB = difficultyOrder[b.project.difficulty] || 2;
    return diffA - diffB;
  });
}
