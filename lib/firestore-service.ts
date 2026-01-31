import {
    collection,
    addDoc,
    query,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface SimulationData {
    id?: string;
    userId: string;
    title: string;
    scenarioId: string;
    createdAt?: any; // Firestore Timestamp
    status: "optimal" | "moderate" | "risk";
    inputs: {
        label: string;
        value: string | number;
    }[];
    outcome: {
        label: string;
        value: string | number;
        trend: "positive" | "negative" | "neutral";
    };
    // Store full raw data for re-running if needed
    rawFactors: any[];
    rawOutcomes: any[];
}

// Collection reference helper
const getSimulationsRef = (userId: string) => collection(db, "users", userId, "simulations");

export const saveSimulation = async (userId: string, simulation: Omit<SimulationData, "id" | "userId" | "createdAt">) => {
    try {
        const docRef = await addDoc(getSimulationsRef(userId), {
            ...simulation,
            userId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving simulation:", error);
        throw error;
    }
};

export const getUserSimulations = async (userId: string): Promise<SimulationData[]> => {
    try {
        const q = query(
            getSimulationsRef(userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SimulationData));
    } catch (error) {
        console.error("Error fetching simulations:", error);
        throw error;
    }
};

export const deleteSimulation = async (userId: string, simulationId: string) => {
    try {
        await deleteDoc(doc(db, "users", userId, "simulations", simulationId));
    } catch (error) {
        console.error("Error deleting simulation:", error);
        throw error;
    }
};
