import { create } from 'zustand';
import type { Runbook, Step, Runner } from '../types/runbook';
import { v4 as uuidv4 } from 'uuid';

interface RunbookState {
  runbook: Runbook;

  // Runbook metadata actions
  setDesc: (desc: string) => void;
  addLabel: (label: string) => void;
  removeLabel: (label: string) => void;

  // Runner actions
  addRunner: (name: string, runner: Runner) => void;
  updateRunner: (name: string, runner: Runner) => void;
  removeRunner: (name: string) => void;

  // Variables actions
  setVar: (key: string, value: any) => void;
  removeVar: (key: string) => void;

  // Step actions
  addStep: (step: Omit<Step, 'id'>) => void;
  updateStep: (id: string, step: Partial<Step>) => void;
  removeStep: (id: string) => void;
  moveStep: (fromIndex: number, toIndex: number) => void;

  // Import/Export
  importRunbook: (runbook: Runbook) => void;
  resetRunbook: () => void;
}

const createEmptyRunbook = (): Runbook => ({
  desc: '',
  labels: [],
  runners: {},
  vars: {},
  steps: [],
});

export const useRunbookStore = create<RunbookState>((set) => ({
  runbook: createEmptyRunbook(),

  // Runbook metadata
  setDesc: (desc) => set((state) => ({
    runbook: { ...state.runbook, desc }
  })),

  addLabel: (label) => set((state) => ({
    runbook: {
      ...state.runbook,
      labels: [...(state.runbook.labels || []), label]
    }
  })),

  removeLabel: (label) => set((state) => ({
    runbook: {
      ...state.runbook,
      labels: (state.runbook.labels || []).filter(l => l !== label)
    }
  })),

  // Runners
  addRunner: (name, runner) => set((state) => ({
    runbook: {
      ...state.runbook,
      runners: { ...state.runbook.runners, [name]: runner }
    }
  })),

  updateRunner: (name, runner) => set((state) => ({
    runbook: {
      ...state.runbook,
      runners: { ...state.runbook.runners, [name]: runner }
    }
  })),

  removeRunner: (name) => set((state) => {
    const { [name]: _, ...rest } = state.runbook.runners;
    return {
      runbook: { ...state.runbook, runners: rest }
    };
  }),

  // Variables
  setVar: (key, value) => set((state) => ({
    runbook: {
      ...state.runbook,
      vars: { ...(state.runbook.vars || {}), [key]: value }
    }
  })),

  removeVar: (key) => set((state) => {
    if (!state.runbook.vars) return state;
    const { [key]: _, ...rest } = state.runbook.vars;
    return {
      runbook: { ...state.runbook, vars: rest }
    };
  }),

  // Steps
  addStep: (stepData) => set((state) => ({
    runbook: {
      ...state.runbook,
      steps: [
        ...state.runbook.steps,
        { ...stepData, id: uuidv4() }
      ]
    }
  })),

  updateStep: (id, stepData) => set((state) => ({
    runbook: {
      ...state.runbook,
      steps: state.runbook.steps.map(step =>
        step.id === id ? { ...step, ...stepData } : step
      )
    }
  })),

  removeStep: (id) => set((state) => ({
    runbook: {
      ...state.runbook,
      steps: state.runbook.steps.filter(step => step.id !== id)
    }
  })),

  moveStep: (fromIndex, toIndex) => set((state) => {
    const steps = [...state.runbook.steps];
    const [movedStep] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, movedStep);
    return {
      runbook: { ...state.runbook, steps }
    };
  }),

  // Import/Export
  importRunbook: (runbook) => set({
    runbook: {
      ...runbook,
      steps: runbook.steps.map(step => ({
        ...step,
        id: step.id || uuidv4()
      }))
    }
  }),

  resetRunbook: () => set({ runbook: createEmptyRunbook() }),
}));
