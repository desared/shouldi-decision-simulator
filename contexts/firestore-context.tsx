"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import type { UserProfile, Scenario, Simulation, Factor, Outcome } from "@/lib/types/firestore";
import * as firestoreService from "@/lib/firestore-service";

interface FirestoreContextType {
  // User
  userProfile: UserProfile | null;

  // Scenarios
  scenarios: Scenario[];
  selectedScenario: Scenario | null;
  selectScenario: (scenarioId: string) => void;
  createScenario: (title: string, description: string, icon: string) => Promise<string>;
  deleteScenario: (scenarioId: string) => Promise<void>;

  // Simulations
  simulations: Simulation[];
  selectedSimulation: Simulation | null;
  selectSimulation: (simulationId: string | null) => void;
  createSimulation: (data: {
    title: string;
    status: "optimal" | "moderate" | "risk";
    factors: Factor[];
    outcomes: Outcome[];
    inputSummary: { label: string; value: string }[];
    outcomeSummary: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
  }) => Promise<string>;
  updateSimulation: (simulationId: string, data: {
    title?: string;
    status?: "optimal" | "moderate" | "risk";
    factors?: Factor[];
    outcomes?: Outcome[];
    inputSummary?: { label: string; value: string }[];
    outcomeSummary?: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
  }) => Promise<void>;
  deleteSimulation: (simulationId: string) => Promise<void>;

  // Loading states
  loading: boolean;
  scenariosLoading: boolean;
  simulationsLoading: boolean;

  // Error handling
  error: string | null;
  clearError: () => void;

  // Refresh functions
  refreshScenarios: () => Promise<void>;
  refreshSimulations: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType | null>(null);

interface FirestoreProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export function FirestoreProvider({ children, user }: FirestoreProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);

  const [loading, setLoading] = useState(true);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [simulationsLoading, setSimulationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user profile and scenarios on auth
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setScenarios([]);
      setSimulations([]);
      setSelectedScenario(null);
      setSelectedSimulation(null);
      setLoading(false);
      return;
    }

    const initializeUserData = async () => {
      try {
        setLoading(true);

        // Create or get user profile
        const profile = await firestoreService.createUserProfileIfNotExists(user.uid, {
          email: user.email || "",
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setUserProfile(profile);

        // Seed default scenarios if needed and load them
        await firestoreService.seedDefaultScenarios(user.uid);
        const userScenarios = await firestoreService.getUserScenarios(user.uid);
        setScenarios(userScenarios);

        // Auto-select first scenario
        if (userScenarios.length > 0) {
          setSelectedScenario(userScenarios[0]);
        }
      } catch (err) {
        console.error("Error initializing user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    initializeUserData();
  }, [user]);

  // Load simulations when scenario changes
  useEffect(() => {
    if (!user || !selectedScenario) {
      setSimulations([]);
      return;
    }

    const loadSimulations = async () => {
      try {
        setSimulationsLoading(true);
        const scenarioSimulations = await firestoreService.getScenarioSimulations(
          user.uid,
          selectedScenario.id
        );
        setSimulations(scenarioSimulations);
      } catch (err) {
        console.error("Error loading simulations:", err);
        setError("Failed to load simulations");
      } finally {
        setSimulationsLoading(false);
      }
    };

    loadSimulations();
  }, [user, selectedScenario]);

  // Scenario operations
  const selectScenario = useCallback(
    (scenarioId: string) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      setSelectedScenario(scenario || null);
      setSelectedSimulation(null);
    },
    [scenarios]
  );

  const createScenarioHandler = useCallback(
    async (title: string, description: string, icon: string): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      const id = await firestoreService.createScenario(user.uid, {
        userId: user.uid,
        title,
        description,
        icon,
      });

      // Refresh scenarios list
      const updated = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updated);

      // Select the new scenario
      const newScenario = updated.find((s) => s.id === id);
      if (newScenario) {
        setSelectedScenario(newScenario);
      }

      return id;
    },
    [user]
  );

  const deleteScenarioHandler = useCallback(
    async (scenarioId: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      await firestoreService.deleteScenario(user.uid, scenarioId);

      // Refresh scenarios list
      const updated = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updated);

      // Clear selection if deleted
      if (selectedScenario?.id === scenarioId) {
        setSelectedScenario(updated[0] || null);
      }
    },
    [user, selectedScenario]
  );

  // Simulation operations
  const selectSimulationHandler = useCallback(
    (simulationId: string | null) => {
      if (!simulationId) {
        setSelectedSimulation(null);
        return;
      }
      const simulation = simulations.find((s) => s.id === simulationId);
      setSelectedSimulation(simulation || null);
    },
    [simulations]
  );

  const createSimulationHandler = useCallback(
    async (data: {
      title: string;
      status: "optimal" | "moderate" | "risk";
      factors: Factor[];
      outcomes: Outcome[];
      inputSummary: { label: string; value: string }[];
      outcomeSummary: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
    }): Promise<string> => {
      if (!user || !selectedScenario) throw new Error("Not authenticated or no scenario selected");

      const id = await firestoreService.createSimulation(user.uid, selectedScenario.id, {
        ...data,
        userId: user.uid,
        scenarioId: selectedScenario.id,
      });

      // Refresh simulations
      const updated = await firestoreService.getScenarioSimulations(user.uid, selectedScenario.id);
      setSimulations(updated);

      // Update scenario simulation count
      const updatedScenarios = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updatedScenarios);

      // Update selected scenario with new count
      const refreshedScenario = updatedScenarios.find((s) => s.id === selectedScenario.id);
      if (refreshedScenario) {
        setSelectedScenario(refreshedScenario);
      }

      return id;
    },
    [user, selectedScenario]
  );

  const updateSimulationHandler = useCallback(
    async (simulationId: string, data: {
      title?: string;
      status?: "optimal" | "moderate" | "risk";
      factors?: Factor[];
      outcomes?: Outcome[];
      inputSummary?: { label: string; value: string }[];
      outcomeSummary?: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
    }): Promise<void> => {
      if (!user || !selectedScenario) throw new Error("Not authenticated or no scenario selected");

      await firestoreService.updateSimulation(user.uid, selectedScenario.id, simulationId, data);

      // Refresh simulations
      const updated = await firestoreService.getScenarioSimulations(user.uid, selectedScenario.id);
      setSimulations(updated);
    },
    [user, selectedScenario]
  );

  const deleteSimulationHandler = useCallback(
    async (simulationId: string): Promise<void> => {
      if (!user || !selectedScenario) throw new Error("Not authenticated or no scenario selected");

      await firestoreService.deleteSimulation(user.uid, selectedScenario.id, simulationId);

      // Refresh simulations
      const updated = await firestoreService.getScenarioSimulations(user.uid, selectedScenario.id);
      setSimulations(updated);

      // Update scenario simulation count
      const updatedScenarios = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updatedScenarios);

      // Update selected scenario with new count
      const refreshedScenario = updatedScenarios.find((s) => s.id === selectedScenario.id);
      if (refreshedScenario) {
        setSelectedScenario(refreshedScenario);
      }

      // Clear selection if deleted
      if (selectedSimulation?.id === simulationId) {
        setSelectedSimulation(null);
      }
    },
    [user, selectedScenario, selectedSimulation]
  );

  // Refresh functions
  const refreshScenarios = useCallback(async () => {
    if (!user) return;
    setScenariosLoading(true);
    try {
      const updated = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updated);
    } finally {
      setScenariosLoading(false);
    }
  }, [user]);

  const refreshSimulations = useCallback(async () => {
    if (!user || !selectedScenario) return;
    setSimulationsLoading(true);
    try {
      const updated = await firestoreService.getScenarioSimulations(user.uid, selectedScenario.id);
      setSimulations(updated);
    } finally {
      setSimulationsLoading(false);
    }
  }, [user, selectedScenario]);

  const clearError = useCallback(() => setError(null), []);

  const value: FirestoreContextType = {
    userProfile,
    scenarios,
    selectedScenario,
    selectScenario,
    createScenario: createScenarioHandler,
    deleteScenario: deleteScenarioHandler,
    simulations,
    selectedSimulation,
    selectSimulation: selectSimulationHandler,
    createSimulation: createSimulationHandler,
    updateSimulation: updateSimulationHandler,
    deleteSimulation: deleteSimulationHandler,
    loading,
    scenariosLoading,
    simulationsLoading,
    error,
    clearError,
    refreshScenarios,
    refreshSimulations,
  };

  return <FirestoreContext.Provider value={value}>{children}</FirestoreContext.Provider>;
}

export function useFirestore() {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error("useFirestore must be used within a FirestoreProvider");
  }
  return context;
}
