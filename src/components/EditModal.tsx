import { useState, useEffect } from "react";
import { X, Save, DollarSign, Copy, Trash2 } from "lucide-react";
import { LegoSet } from "../types";
import { compressImage } from "../utils/imageUtils";

interface EditModalProps {
    set: LegoSet;
    onClose: () => void;
    onUpdate: (set: LegoSet) => void;
    onMarkAsSold: (set: LegoSet) => void;
    onDuplicate: (set: LegoSet) => void;
    onDelete: (set: LegoSet) => void;
}

export const EditModal = ({
    set,
    onClose,
    onUpdate,
    onMarkAsSold,
    onDuplicate,
    onDelete,
}: EditModalProps) => {
    const [editingSet, setEditingSet] = useState<LegoSet>(set);

    // Sync state if set prop changes
    useEffect(() => {
        setEditingSet(set);
    }, [set]);

    const handleEditPhotoUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedImage = await compressImage(file);
            setEditingSet({ ...editingSet, photo: compressedImage });
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to process image size. Try a smaller image.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Edit Set</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Set Number</label>
                        <input
                            type="text"
                            value={editingSet.setNumber}
                            onChange={(e) =>
                                setEditingSet({ ...editingSet, setNumber: e.target.value })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Set Name</label>
                        <input
                            type="text"
                            value={editingSet.name}
                            onChange={(e) =>
                                setEditingSet({ ...editingSet, name: e.target.value })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Buy Price (CZK)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editingSet.buyPrice}
                            onChange={(e) =>
                                setEditingSet({
                                    ...editingSet,
                                    buyPrice: parseFloat(e.target.value) || 0,
                                })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Sell Price (CZK)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editingSet.sellPrice || ""}
                            onChange={(e) =>
                                setEditingSet({
                                    ...editingSet,
                                    sellPrice: parseFloat(e.target.value) || null,
                                })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Location</label>
                        <select
                            value={editingSet.location}
                            onChange={(e) =>
                                setEditingSet({
                                    ...editingSet,
                                    location: e.target.value as "Doma" | "Kolej",
                                })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        >
                            <option value="Doma">Doma</option>
                            <option value="Kolej">Kolej</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Photo</label>
                        <div className="relative">
                            <img
                                src={editingSet.photo}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded cursor-pointer"
                                onClick={() =>
                                    document.getElementById("edit-photo-input")?.click()
                                }
                            />
                            <input
                                id="edit-photo-input"
                                type="file"
                                accept="image/*"
                                onChange={handleEditPhotoUpload}
                                className="hidden"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onUpdate(editingSet)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                        >
                            <Save size={20} />
                            Save Changes
                        </button>
                        <button
                            onClick={() => onMarkAsSold(editingSet)}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                        >
                            <DollarSign size={20} />
                            Mark as Sold
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onDuplicate(editingSet)}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
                        >
                            <Copy size={20} />
                            Duplicate
                        </button>
                        <button
                            onClick={() => onDelete(editingSet)}
                            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={20} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
