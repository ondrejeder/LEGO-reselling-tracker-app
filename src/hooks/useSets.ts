import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { LegoSet } from "../types";

export const useSets = (userId: string | undefined) => {
    const queryClient = useQueryClient();

    const getSets = async (): Promise<LegoSet[]> => {
        if (!userId) return [];
        try {
            const querySnapshot = await getDocs(collection(db, "users", userId, "sets"));
            const setsData: LegoSet[] = [];
            querySnapshot.forEach((docSnap) => {
                setsData.push({ id: docSnap.id, ...docSnap.data() } as LegoSet);
            });
            return setsData;
        } catch (error) {
            console.error("Error fetching sets:", error);
            throw error;
        }
    };

    const { data: sets = [], isLoading, error } = useQuery({
        queryKey: ["sets", userId],
        queryFn: getSets,
        enabled: !!userId,
    });

    const addSetMutation = useMutation({
        mutationFn: async (newSets: Omit<LegoSet, "id">[]) => {
            if (!userId) throw new Error("User not authenticated");
            try {
                const promises = newSets.map((set) =>
                    addDoc(collection(db, "users", userId, "sets"), set)
                );
                await Promise.all(promises);
            } catch (error) {
                console.error("Error adding sets", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sets", userId] });
        },
    });

    const updateSetMutation = useMutation({
        mutationFn: async (updatedSet: LegoSet) => {
            if (!userId) throw new Error("User not authenticated");
            try {
                const setRef = doc(db, "users", userId, "sets", updatedSet.id);
                await updateDoc(setRef, {
                    setNumber: updatedSet.setNumber,
                    name: updatedSet.name,
                    buyPrice: updatedSet.buyPrice,
                    photo: updatedSet.photo,
                    sellPrice: updatedSet.sellPrice,
                    location: updatedSet.location,
                });
            } catch (error) {
                console.error("Error updating set", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sets", userId] });
        },
    });

    const deleteSetMutation = useMutation({
        mutationFn: async (setId: string) => {
            if (!userId) throw new Error("User not authenticated");
            try {
                await deleteDoc(doc(db, "users", userId, "sets", setId));
            } catch (error) {
                console.error("Error deleting set", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sets", userId] });
        },
    });

    return {
        sets,
        isLoading,
        error,
        addSet: addSetMutation.mutate,
        addSetAsync: addSetMutation.mutateAsync,
        updateSet: updateSetMutation.mutate,
        updateSetAsync: updateSetMutation.mutateAsync,
        deleteSet: deleteSetMutation.mutate,
        deleteSetAsync: deleteSetMutation.mutateAsync,
    };
};
