import { describe, it, expect } from 'vitest';
import { calculateScore, rankProjects } from './matchEngine.js';

describe('matchEngine Core Logic', () => {
  const mockCatalog = [
    { id: 'arduino-uno', name: 'Arduino Uno R3', avgPriceINR: 450, avgWeightKg: 0.025 },
    { id: 'arduino-nano', name: 'Arduino Nano', avgPriceINR: 240, avgWeightKg: 0.007 },
    { id: 'led-pack', name: 'LED Pack', avgPriceINR: 25, avgWeightKg: 0.004 },
    { id: 'resistors-pack', name: 'Resistor Pack', avgPriceINR: 20, avgWeightKg: 0.005 },
    { id: 'sensor-temp', name: 'Temp Sensor', avgPriceINR: 75, avgWeightKg: 0.005 },
  ];

  const mockSubstitutes = [
    {
      needId: 'arduino-nano',
      canUseId: 'arduino-uno',
      factor: 0.7,
      note: 'Uno can substitute for Nano',
    },
  ];

  const sampleProject = {
    id: 'test-project',
    title: 'Test Project',
    difficulty: 'Beginner',
    requirements: [
      { componentId: 'arduino-nano', qty: 1, critical: true },
      { componentId: 'led-pack', qty: 2, critical: false },
    ],
  };

  it('calculates 100% score on exact match and allows build', () => {
    const inventory = [
      { id: '1', componentId: 'arduino-nano', qty: 1, condition: 'Working' },
      { id: '2', componentId: 'led-pack', qty: 2, condition: 'Working' },
    ];

    const result = calculateScore(sampleProject, inventory, mockCatalog, mockSubstitutes);
    expect(result.score).toBe(100);
    expect(result.canBuildNow).toBe(true);
    expect(result.missingParts.length).toBe(0);
    expect(result.hasUntested).toBe(false);
  });

  it('handles partial quantities correctly', () => {
    const inventory = [
      { id: '1', componentId: 'arduino-nano', qty: 1, condition: 'Working' },
      { id: '2', componentId: 'led-pack', qty: 1, condition: 'Working' }, // needs 2, has 1
    ];

    const result = calculateScore(sampleProject, inventory, mockCatalog, mockSubstitutes);
    // Weight: critical (3)*1 + non-critical(1)*0.5 = 3.5 / 4 = 87.5 -> 88%
    expect(result.score).toBe(88);
    expect(result.canBuildNow).toBe(false);
    expect(result.missingParts.length).toBe(1);
    expect(result.missingParts[0].qtyMissing).toBe(1);
  });

  it('applies substitution rule with credit and substitute status', () => {
    // Has Arduino Uno instead of Nano
    const inventory = [
      { id: '1', componentId: 'arduino-uno', qty: 1, condition: 'Working' },
      { id: '2', componentId: 'led-pack', qty: 2, condition: 'Working' },
    ];

    const result = calculateScore(sampleProject, inventory, mockCatalog, mockSubstitutes);
    // Uno factor is 0.7. Nano is critical (weight 3). LED pack weight 1 (coverage 1).
    // (3 * 0.7 + 1 * 1) / 4 = 3.1 / 4 = 0.775 -> 78%
    expect(result.score).toBe(78);
    expect(result.requirements[0].status).toBe('substitute');
    expect(result.requirements[0].substituteUsed).not.toBeNull();
    expect(result.requirements[0].substituteUsed.substituteId).toBe('arduino-uno');
    expect(result.canBuildNow).toBe(false);
  });

  it('caps score at 40 when ANY critical requirement has coverage 0', () => {
    // Project with critical part missing completely, but with all non-critical parts owned
    const projectWithCritical = {
      id: 'crit-test',
      requirements: [
        { componentId: 'arduino-nano', qty: 1, critical: true },
        { componentId: 'sensor-temp', qty: 1, critical: true },
        { componentId: 'led-pack', qty: 10, critical: false },
        { componentId: 'resistors-pack', qty: 10, critical: false },
      ],
    };

    // User only has the non-critical parts in abundance
    const inventory = [
      { id: '1', componentId: 'led-pack', qty: 10, condition: 'Working' },
      { id: '2', componentId: 'resistors-pack', qty: 10, condition: 'Working' },
    ];

    const result = calculateScore(projectWithCritical, inventory, mockCatalog, mockSubstitutes);
    // Even if non-critical parts are 100%, missing critical parts must never exceed 40
    expect(result.score).toBeLessThanOrEqual(40);
  });

  it('never counts Faulty parts toward any project requirement', () => {
    const inventory = [
      { id: '1', componentId: 'arduino-nano', qty: 1, condition: 'Faulty' },
      { id: '2', componentId: 'led-pack', qty: 2, condition: 'Working' },
    ];

    const result = calculateScore(sampleProject, inventory, mockCatalog, mockSubstitutes);
    // Faulty nano counts as 0
    expect(result.requirements[0].haveExact).toBe(0);
    expect(result.requirements[0].status).toBe('missing');
    expect(result.score).toBeLessThanOrEqual(40);
  });

  it('triggers hasUntested flag when untested parts are used', () => {
    const inventory = [
      { id: '1', componentId: 'arduino-nano', qty: 1, condition: 'Untested' },
      { id: '2', componentId: 'led-pack', qty: 2, condition: 'Working' },
    ];

    const result = calculateScore(sampleProject, inventory, mockCatalog, mockSubstitutes);
    expect(result.score).toBe(100);
    expect(result.hasUntested).toBe(true);
  });

  it('ranks projects properly by score and missing count', () => {
    const projects = [
      {
        id: 'p1',
        title: 'Project 1',
        difficulty: 'Intermediate',
        requirements: [{ componentId: 'arduino-nano', qty: 1, critical: true }],
      },
      {
        id: 'p2',
        title: 'Project 2',
        difficulty: 'Beginner',
        requirements: [{ componentId: 'led-pack', qty: 1, critical: true }],
      },
    ];

    const inventory = [
      { id: '1', componentId: 'led-pack', qty: 1, condition: 'Working' },
    ];

    const ranked = rankProjects(inventory, projects, mockCatalog, mockSubstitutes);
    expect(ranked[0].project.id).toBe('p2');
    expect(ranked[0].score).toBe(100);
    expect(ranked[1].project.id).toBe('p1');
    expect(ranked[1].score).toBeLessThanOrEqual(40);
  });
});
