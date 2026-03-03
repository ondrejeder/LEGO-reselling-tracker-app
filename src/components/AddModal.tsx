import { useState } from "react";
import { X } from "lucide-react";
import { FormData } from "../types";
import { compressImage } from "../utils/imageUtils";

interface AddModalProps {
    onClose: () => void;
    onAdd: (formData: FormData) => void;
}

export const AddModal = ({ onClose, onAdd }: AddModalProps) => {
    const [formData, setFormData] = useState<FormData>({
        setNumber: "",
        name: "",
        buyPrice: "",
        quantity: 1,
        photo: null,
        location: "Doma",
    });

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedImage = await compressImage(file);
            setFormData({ ...formData, photo: compressedImage });
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to process image size. Try a smaller image.");
        }
    };

    const handleAddSet = () => {
        if (
            !formData.setNumber ||
            !formData.name ||
            !formData.buyPrice ||
            !formData.photo
        ) {
            alert("Please fill in all fields and upload a photo");
            return;
        }
        onAdd(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Add New Set</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Set Number</label>
                        <input
                            type="text"
                            value={formData.setNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, setNumber: e.target.value })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Set Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Buy Price (CZK)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.buyPrice}
                            onChange={(e) =>
                                setFormData({ ...formData, buyPrice: e.target.value })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    quantity: parseInt(e.target.value) || 1,
                                })
                            }
                            className="flex-1 border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium w-32">Location</label>
                        <select
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
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
                        {formData.photo ? (
                            <div className="relative">
                                <img
                                    src={formData.photo}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded cursor-pointer"
                                    onClick={() =>
                                        document.getElementById("add-photo-input")?.click()
                                    }
                                />
                                <input
                                    id="add-photo-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="w-full border rounded px-3 py-2"
                            />
                        )}
                    </div>
                    <button
                        onClick={handleAddSet}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Add Set
                    </button>
                </div>
            </div>
        </div>
    );
};
