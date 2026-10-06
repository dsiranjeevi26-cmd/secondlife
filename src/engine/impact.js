/**
 * impact.js
 * Waste-reduction calculations and environmental impact metrics.
 * 
 * Environmental Assumptions:
 * - Electronics e-waste diversion avoidance factor:
 *   0.5 kg CO2e avoided per 0.1 kg of electronic components kept in service
 *   (= 5.0 kg CO2e per 1.0 kg e-waste diverted from landfill/smelting).
 * - Toxicity prevention index considers heavy metals (lead, cadmium, brominated flame retardants).
 */

export const CO2_PER_KG_EWASTE = 5.0; // 0.5 kg CO2e per 0.1 kg electronics

/**
 * Calculates the total environmental impact given built projects records and catalog.
 * 
 * @param {Array} builtProjects - Array of { id, projectId, projectTitle, date, usedParts:[{ componentId, qty, category, weightKg }] }
 * @param {Array|Object} catalog - Components catalog
 * @returns {Object} Aggregate impact statistics
 */
export function calculateImpact(builtProjects = [], catalog = []) {
  const catalogMap = Array.isArray(catalog)
    ? catalog.reduce((acc, c) => ({ ...acc, [c.id]: c }), {})
    : catalog;

  let totalKgDiverted = 0;
  let totalPartsReused = 0;
  const categoryStats = {};
  const projectStats = [];

  for (const record of builtProjects) {
    let projectKg = 0;
    let projectPartsCount = 0;

    if (Array.isArray(record.usedParts)) {
      for (const part of record.usedParts) {
        const catItem = catalogMap[part.componentId] || {};
        const weightKg = Number(part.weightKg) || Number(catItem.avgWeightKg) || 0.02;
        const qty = Number(part.qty) || 1;
        const category = part.category || catItem.category || 'Misc';

        const totalPartWeight = weightKg * qty;
        projectKg += totalPartWeight;
        projectPartsCount += qty;

        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            partsCount: 0,
            weightKg: 0,
          };
        }
        categoryStats[category].partsCount += qty;
        categoryStats[category].weightKg += totalPartWeight;
      }
    } else if (record.kgDiverted) {
      projectKg = Number(record.kgDiverted) || 0;
      projectPartsCount = Number(record.partsCount) || 1;
    }

    totalKgDiverted += projectKg;
    totalPartsReused += projectPartsCount;

    projectStats.push({
      id: record.id || record.projectId,
      title: record.projectTitle || 'Repurposed Project',
      date: record.date || new Date().toISOString().split('T')[0],
      kgDiverted: Number(projectKg.toFixed(3)),
      partsCount: projectPartsCount,
    });
  }

  // Convert category stats to array for Recharts pie chart
  const categoryChartData = Object.values(categoryStats).map((stat) => ({
    name: stat.category,
    value: Number(stat.partsCount),
    weightKg: Number(stat.weightKg.toFixed(3)),
  }));

  const co2AvoidedKg = totalKgDiverted * CO2_PER_KG_EWASTE;

  return {
    totalKgDiverted: Number(totalKgDiverted.toFixed(3)),
    totalPartsReused,
    projectsBuiltCount: builtProjects.length,
    co2AvoidedKg: Number(co2AvoidedKg.toFixed(2)),
    categoryChartData,
    projectChartData: projectStats,
    assumptions: {
      co2FactorText: "0.5 kg CO₂e avoided per 100g e-waste (mining and manufacturing offset)",
      dataSource: "Global E-Waste Monitor & EPA WARM LCA Models (conservative estimate)",
    },
  };
}

/**
 * Calculates potential waste diverted if a single project is completed.
 */
export function calculateProjectPotentialWeight(project, catalog = []) {
  if (!project || !Array.isArray(project.requirements)) {
    return 0;
  }
  const catalogMap = Array.isArray(catalog)
    ? catalog.reduce((acc, c) => ({ ...acc, [c.id]: c }), {})
    : catalog;

  let totalWeightKg = 0;
  for (const req of project.requirements) {
    const item = catalogMap[req.componentId];
    const unitWeight = item ? item.avgWeightKg : 0.02;
    totalWeightKg += unitWeight * (req.qty || 1);
  }
  return Number(totalWeightKg.toFixed(3));
}
