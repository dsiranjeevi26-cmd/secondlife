import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import componentsData from '../data/components.json';
import projectsData from '../data/projects.json';
import substitutesData from '../data/substitutes.json';
import swapSeedData from '../data/swapSeed.json';
import { rankProjects, calculateScore } from '../engine/matchEngine.js';
import { calculateImpact, calculateProjectPotentialWeight } from '../engine/impact.js';

const InventoryContext = createContext(null);

const STORAGE_KEY_INVENTORY = 'secondlife_inventory_v1';
const STORAGE_KEY_BUILT = 'secondlife_built_projects_v1';
const STORAGE_KEY_SWAP = 'secondlife_swap_posts_v1';
const STORAGE_KEY_THEME = 'secondlife_theme_v1';

export const DEMO_INVENTORY = [
  { id: 'demo-1', componentId: 'arduino-uno', qty: 1, condition: 'Working' },
  { id: 'demo-2', componentId: 'hc-sr04', qty: 1, condition: 'Working' },
  { id: 'demo-3', componentId: 'piezo-buzzer', qty: 1, condition: 'Working' },
  { id: 'demo-4', componentId: 'led-pack', qty: 2, condition: 'Working' },
  { id: 'demo-5', componentId: 'breadboard', qty: 1, condition: 'Working' },
  { id: 'demo-6', componentId: 'jumper-wires', qty: 2, condition: 'Working' },
  { id: 'demo-7', componentId: 'usb-cable', qty: 2, condition: 'Working' },
  { id: 'demo-8', componentId: 'ldr-sensor', qty: 1, condition: 'Working' },
  { id: 'demo-9', componentId: 'resistors-pack', qty: 2, condition: 'Working' },
  { id: 'demo-10', componentId: 'laptop-fan', qty: 1, condition: 'Working' },
  { id: 'demo-11', componentId: 'potentiometer-10k', qty: 1, condition: 'Working' },
  { id: 'demo-12', componentId: 'battery-18650', qty: 2, condition: 'Untested' },
];

export function InventoryProvider({ children }) {
  // Inventory state
  const [inventory, setInventory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INVENTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading inventory from localStorage:', e);
      return [];
    }
  });

  // Built projects state
  const [builtProjects, setBuiltProjects] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BUILT);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading built projects from localStorage:', e);
      return [];
    }
  });

  // Swap posts state
  const [swapPosts, setSwapPosts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SWAP);
      return stored ? JSON.parse(stored) : swapSeedData;
    } catch (e) {
      console.error('Error loading swap posts from localStorage:', e);
      return swapSeedData;
    }
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THEME);
      if (stored !== null) return JSON.parse(stored);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Notification toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync inventory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('Failed to save inventory to localStorage:', e);
    }
  }, [inventory]);

  // Sync built projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUILT, JSON.stringify(builtProjects));
    } catch (e) {
      console.error('Failed to save built projects to localStorage:', e);
    }
  }, [builtProjects]);

  // Sync swap posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SWAP, JSON.stringify(swapPosts));
    } catch (e) {
      console.error('Failed to save swap posts to localStorage:', e);
    }
  }, [swapPosts]);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(darkMode));
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Components catalog lookup map
  const catalogMap = useMemo(() => {
    return componentsData.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, []);

  // Compute ranked project suggestions in real-time
  const rankedProjects = useMemo(() => {
    return rankProjects(inventory, projectsData, catalogMap, substitutesData);
  }, [inventory, catalogMap]);

  // Calculate live environmental impact
  const impactSummary = useMemo(() => {
    return calculateImpact(builtProjects, catalogMap);
  }, [builtProjects, catalogMap]);

  // Inventory actions
  const addInventoryItem = ({ componentId, qty = 1, condition = 'Working' }) => {
    if (!componentId) return;
    const cleanQty = Math.max(1, parseInt(qty, 10) || 1);

    setInventory((prev) => {
      // If exact same componentId and condition exists, merge quantity
      const existingIndex = prev.findIndex(
        (item) => item.componentId === componentId && item.condition === condition
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + cleanQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          componentId,
          qty: cleanQty,
          condition,
        },
      ];
    });

    const partName = catalogMap[componentId]?.name || 'Component';
    addToast(`Added ${cleanQty}x ${partName} to your inventory.`);
  };

  const updateInventoryItem = (id, updates) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteInventoryItem = (id) => {
    const itemToDelete = inventory.find((i) => i.id === id);
    const partName = itemToDelete ? catalogMap[itemToDelete.componentId]?.name : 'Item';
    setInventory((prev) => prev.filter((item) => item.id !== id));
    addToast(`Removed ${partName} from inventory.`, 'info');
  };

  const clearInventory = () => {
    setInventory([]);
    addToast('Inventory cleared.', 'info');
  };

  const loadDemoInventory = () => {
    setInventory(DEMO_INVENTORY);
    addToast('Demo inventory loaded! Check out your project matches.', 'success');
  };

  // Add multiple salvage items from teardown
  const addTeardownParts = (salvageList, deviceName = 'Device') => {
    if (!Array.isArray(salvageList) || salvageList.length === 0) return;

    setInventory((prev) => {
      const updated = [...prev];
      for (const item of salvageList) {
        const cleanQty = Math.max(1, parseInt(item.qty, 10) || 1);
        const condition = item.condition || 'Working';
        const existingIdx = updated.findIndex(
          (inv) => inv.componentId === item.componentId && inv.condition === condition
        );
        if (existingIdx > -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            qty: updated[existingIdx].qty + cleanQty,
          };
        } else {
          updated.push({
            id: 'salvage-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            componentId: item.componentId,
            qty: cleanQty,
            condition,
          });
        }
      }
      return updated;
    });

    addToast(`Salvaged ${salvageList.length} component types from ${deviceName}!`, 'success');
  };

  // Mark project as built
  const markProjectAsBuilt = (projectId) => {
    const project = projectsData.find((p) => p.id === projectId);
    if (!project) return false;

    // Check feasibility score and requirements
    const match = calculateScore(project, inventory, catalogMap, substitutesData);

    // Collect parts used and deduct from inventory
    const usedParts = [];
    let updatedInventory = [...inventory];

    for (const req of project.requirements) {
      let needed = req.qty || 1;
      const targetId = req.componentId;

      // 1. Try to deduct exact component (working first, then untested)
      const matchingItems = updatedInventory.filter(
        (inv) => inv.componentId === targetId && inv.condition !== 'Faulty'
      );

      for (const invItem of matchingItems) {
        if (needed <= 0) break;
        const take = Math.min(needed, invItem.qty);
        needed -= take;
        const catItem = catalogMap[targetId];

        usedParts.push({
          componentId: targetId,
          qty: take,
          condition: invItem.condition,
          category: catItem?.category || 'Misc',
          weightKg: catItem?.avgWeightKg || 0.02,
        });

        // Deduct
        updatedInventory = updatedInventory
          .map((i) => (i.id === invItem.id ? { ...i, qty: i.qty - take } : i))
          .filter((i) => i.qty > 0);
      }

      // 2. If needed > 0, deduct from substitute if available
      if (needed > 0) {
        const validSubs = substitutesData.filter((s) => s.needId === targetId);
        for (const sub of validSubs) {
          if (needed <= 0) break;
          const subItems = updatedInventory.filter(
            (inv) => inv.componentId === sub.canUseId && inv.condition !== 'Faulty'
          );
          for (const subItem of subItems) {
            if (needed <= 0) break;
            const take = Math.min(needed, subItem.qty);
            needed -= take;
            const catItem = catalogMap[sub.canUseId];

            usedParts.push({
              componentId: sub.canUseId,
              substituteFor: targetId,
              qty: take,
              condition: subItem.condition,
              category: catItem?.category || 'Misc',
              weightKg: catItem?.avgWeightKg || 0.02,
            });

            updatedInventory = updatedInventory
              .map((i) => (i.id === subItem.id ? { ...i, qty: i.qty - take } : i))
              .filter((i) => i.qty > 0);
          }
        }
      }
    }

    // Calculate diverted weight
    let projectDivertedKg = 0;
    for (const p of usedParts) {
      projectDivertedKg += (p.weightKg || 0.02) * p.qty;
    }
    projectDivertedKg = Number(projectDivertedKg.toFixed(3));

    const newBuiltRecord = {
      id: 'build-' + Date.now(),
      projectId: project.id,
      projectTitle: project.title,
      difficulty: project.difficulty,
      date: new Date().toISOString().split('T')[0],
      usedParts,
      kgDiverted: projectDivertedKg,
      partsCount: usedParts.reduce((sum, p) => sum + p.qty, 0),
    };

    setInventory(updatedInventory);
    setBuiltProjects((prev) => [newBuiltRecord, ...prev]);
    addToast(`Awesome! "${project.title}" marked as built. ${projectDivertedKg}kg e-waste diverted!`, 'success');
    return true;
  };

  // Swap board actions
  const addSwapPost = (newPost) => {
    const postRecord = {
      id: 'swap-' + Date.now(),
      type: newPost.type || 'offering',
      componentId: newPost.componentId,
      qty: Math.max(1, parseInt(newPost.qty, 10) || 1),
      note: newPost.note || '',
      contactName: newPost.contactName || 'Anonymous Maker',
      contactLocation: newPost.contactLocation || 'General Makerspace',
      createdAt: new Date().toISOString(),
    };

    setSwapPosts((prev) => [postRecord, ...prev]);
    addToast(`Posted to Swap Board!`, 'success');
  };

  const deleteSwapPost = (id) => {
    setSwapPosts((prev) => prev.filter((p) => p.id !== id));
    addToast(`Swap post removed.`, 'info');
  };

  const value = {
    inventory,
    catalog: componentsData,
    catalogMap,
    projects: projectsData,
    substitutes: substitutesData,
    rankedProjects,
    builtProjects,
    swapPosts,
    impactSummary,
    darkMode,
    toggleDarkMode,
    toasts,
    addToast,
    removeToast,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    clearInventory,
    loadDemoInventory,
    addTeardownParts,
    markProjectAsBuilt,
    addSwapPost,
    deleteSwapPost,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
