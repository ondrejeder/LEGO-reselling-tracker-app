import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { LegoSet } from "../types";

export const useSoldSets = (userId: string | undefined) => {
    const queryClient = useQueryClient();

    const getSoldSets = async (): Promise<LegoSet[]> => {
        if (!userId) return [];
        try {
            const querySnapshot = await getDocs(collection(db, "users", userId, "soldSets"));
            const soldSetsData: LegoSet[] = [];
            querySnapshot.forEach((docSnap) => {
                soldSetsData.push({ id: docSnap.id, ...docSnap.data() } as LegoSet);
            });
            return soldSetsData;
        } catch (error) {
            console.error("Error fetching sold sets:", error);
            throw error;
        }
    };

    const { data: soldSets = [], isLoading, error } = useQuery({
        queryKey: ["soldSets", userId],
        queryFn: getSoldSets,
        enabled: !!userId,
    });

    const addSoldSetMutation = useMutation({
        mutationFn: async (soldSet: Omit<LegoSet, "id">) => {
            if (!userId) throw new Error("User not authenticated");
            try {
                await addDoc(collection(db, "users", userId, "soldSets"), soldSet);
            } catch (error) {
                console.error("Error adding sold set", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["soldSets", userId] });
        },
    });

    const updateSoldSetMutation = useMutation({
        mutationFn: async (updatedSet: LegoSet) => {
            if (!userId) throw new Error("User not authenticated");
            try {
                const setRef = doc(db, "users", userId, "soldSets", updatedSet.id);
                await updateDoc(setRef, {
                    setNumber: updatedSet.setNumber,
                    name: updatedSet.name,
                    buyPrice: updatedSet.buyPrice,
                    photo: updatedSet.photo,
                    sellPrice: updatedSet.sellPrice,
                    location: updatedSet.location,
                    soldDate: updatedSet.soldDate,
                });
            } catch (error) {
                console.error("Error updating sold set", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["soldSets", userId] });
        },
    });

    const deleteSoldSetMutation = useMutation({
        mutationFn: async (setId: string) => {
            if (!userId) throw new Error("User not authenticated");
            try {
                await deleteDoc(doc(db, "users", userId, "soldSets", setId));
            } catch (error) {
                console.error("Error deleting sold set", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["soldSets", userId] });
        },
    });

    return {
        soldSets,
        isLoading,
        error,
        addSoldSet: addSoldSetMutation.mutate,
        addSoldSetAsync: addSoldSetMutation.mutateAsync,
        updateSoldSet: updateSoldSetMutation.mutate,
        updateSoldSetAsync: updateSoldSetMutation.mutateAsync,
        deleteSoldSet: deleteSoldSetMutation.mutate,
        deleteSoldSetAsync: deleteSoldSetMutation.mutateAsync,
    };
};
