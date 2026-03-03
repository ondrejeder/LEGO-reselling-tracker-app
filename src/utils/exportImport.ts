import { collection, getDocs, deleteDoc, addDoc, Firestore } from "firebase/firestore";
import { User } from "firebase/auth";
import { LegoSet, ImportData } from "../types";

export const exportData = (sets: LegoSet[], soldSets: LegoSet[]) => {
    try {
        const data = {
            sets,
            soldSets,
            exportDate: new Date().toISOString(),
        };
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        a.download = `lego-tracker-${day}-${month}-${year}.json`;

        a.style.display = "none";
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        const data = {
            sets,
            soldSets,
            exportDate: new Date().toISOString(),
        };
        const jsonString = JSON.stringify(data, null, 2);
        navigator.clipboard
            .writeText(jsonString)
            .then(() => {
                alert(
                    "Export download blocked! Data has been copied to your clipboard instead. Paste it into a text file and save as .json"
                );
            })
            .catch(() => {
                alert(
                    "Export failed. Please try again or use the deployed version on Vercel."
                );
            });
    }
};

export const handleImportData = async (
    file: File,
    user: User,
    db: Firestore,
    onSuccess: () => void,
    onError: (error: any) => void
) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const content = event.target?.result as string;
            const data: ImportData = JSON.parse(content);
            console.log("Importing data:", data);

            const setsCollection = collection(db, "users", user.uid, "sets");
            const soldSetsCollection = collection(db, "users", user.uid, "soldSets");

            // Delete all existing sets
            const setsSnapshot = await getDocs(setsCollection);
            const deleteSetPromises = setsSnapshot.docs.map((docSnap) =>
                deleteDoc(docSnap.ref)
            );
            await Promise.all(deleteSetPromises);

            // Delete all existing sold sets
            const soldSetsSnapshot = await getDocs(soldSetsCollection);
            const deleteSoldSetPromises = soldSetsSnapshot.docs.map((docSnap) =>
                deleteDoc(docSnap.ref)
            );
            await Promise.all(deleteSoldSetPromises);

            console.log("Cleared existing data from Firebase");

            // Import sets
            if (data.sets && data.sets.length > 0) {
                const addSetPromises = data.sets.map((set) => {
                    const resolvedSet = {
                        setNumber: set.setNumber,
                        name: set.name,
                        buyPrice: set.buyPrice,
                        sellPrice: set.sellPrice || null,
                        location: set.location || "Doma",
                        photo: set.photo,
                    };
                    return addDoc(setsCollection, resolvedSet);
                });

                await Promise.all(addSetPromises);
                console.log(`Imported ${data.sets.length} sets`);
            }

            // Import sold sets
            if (data.soldSets && data.soldSets.length > 0) {
                const addSoldSetPromises = data.soldSets.map((soldSet) => {
                    const resolvedSoldSet = {
                        setNumber: soldSet.setNumber,
                        name: soldSet.name,
                        buyPrice: soldSet.buyPrice,
                        sellPrice: soldSet.sellPrice,
                        location: soldSet.location || "Doma",
                        photo: soldSet.photo,
                        soldDate: soldSet.soldDate,
                    };
                    return addDoc(soldSetsCollection, resolvedSoldSet);
                });

                await Promise.all(addSoldSetPromises);
                console.log(`Imported ${data.soldSets.length} sold sets`);
            }

            onSuccess();
        } catch (error) {
            console.error("Error importing data:", error);
            onError(error);
        }
    };
    reader.readAsText(file);
};
