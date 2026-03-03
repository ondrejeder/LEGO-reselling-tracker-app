import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { LegoSet } from "../types";

interface SoldEditModalProps {
    set: LegoSet;
    onClose: () => void;
    onUpdate: (set: LegoSet) => void;
    onDelete: (set: LegoSet) => void;
}

export const SoldEditModal = ({ set, onClose, onUpdate, onDelete }: SoldEditModalProps) => {
    const [editingSoldSet, setEditingSoldSet] = useState<LegoSet>(set);

    // Sync state if set prop changes
    useEffect(() => {
        setEditingSoldSet(set);
    }, [set]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Edit Sold Price</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <img
                            src={editingSoldSet.photo}
                            alt={editingSoldSet.name}
                            className="w-full h-32 object-cover rounded"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">
                            {editingSoldSet.name} {editingSoldSet.setNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Buy Price: {Math.round(editingSoldSet.buyPrice)} CZK
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">
                            Sell Price (CZK)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={editingSoldSet.sellPrice || ""}
                            onChange={(e) =>
                                setEditingSoldSet({
                                    ...editingSoldSet,
                                    sellPrice: parseFloat(e.target.value) || null,
                                })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Sold Date</label>
                        <input
                            type="date"
                            value={
                                editingSoldSet.soldDate
                                    ? editingSoldSet.soldDate.split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                setEditingSoldSet({
                                    ...editingSoldSet,
                                    soldDate: e.target.value
                                        ? new Date(e.target.value).toISOString()
                                        : undefined,
                                })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <button
                        onClick={() => onUpdate(editingSoldSet)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        <Save size={20} />
                        Update
                    </button>
                    <button
                        onClick={() => onDelete(editingSoldSet)}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                    >
                        <Trash2 size={20} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
