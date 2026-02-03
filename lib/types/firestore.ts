import { Timestamp } from "firebase/firestore";

// User Profile Interface
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Factor Interface (input variables for simulation)
export interface Factor {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
}

// Outcome Interface (predicted results)
export interface Outcome {
  id: string;
  label: string;
  value: number;
  rangeMin: number;
  rangeMax: number;
  trend: "up" | "down" | "stable";
}

// Scenario Interface (parent container for simulations)
export interface Scenario {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  simulationCount: number;
  isDefault?: boolean;
}

// Simulation Interface (nested under scenario)
export interface Simulation {
  id: string;
  userId: string;
  scenarioId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "optimal" | "moderate" | "risk";
  factors: Factor[];
  outcomes: Outcome[];
  inputSummary: {
    label: string;
    value: string;
  }[];
  outcomeSummary: {
    label: string;
    value: string;
    trend: "positive" | "negative" | "neutral";
  };
}

// Create/Update DTOs
export type CreateUserProfile = Omit<UserProfile, "id" | "createdAt" | "updatedAt">;
export type CreateScenario = Omit<Scenario, "id" | "createdAt" | "updatedAt" | "simulationCount">;
export type UpdateScenario = Partial<Omit<Scenario, "id" | "userId" | "createdAt">>;
export type CreateSimulation = Omit<Simulation, "id" | "createdAt" | "updatedAt">;
export type UpdateSimulation = Partial<Omit<Simulation, "id" | "userId" | "scenarioId" | "createdAt">>;
