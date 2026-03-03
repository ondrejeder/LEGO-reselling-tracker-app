import { useState } from "react";
import { Plus, X, Edit2 } from "lucide-react";
import { LegoSet } from "../types";

interface InventoryTabProps {
    sets: LegoSet[];
    onAddClick: () => void;
    onEditClick: (set: LegoSet) => void;
}

type SortByType = "default" | "number-asc" | "number-desc" | "price-asc" | "price-desc";

export const InventoryTab = ({ sets, onAddClick, onEditClick }: InventoryTabProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortByType>("default");

    const handleSort = (type: "number" | "price") => {
        if (type === "number") {
            if (sortBy === "number-asc") setSortBy("number-desc");
            else if (sortBy === "number-desc") setSortBy("default");
            else setSortBy("number-asc");
        } else {
            if (sortBy === "price-asc") setSortBy("price-desc");
            else if (sortBy === "price-desc") setSortBy("default");
            else setSortBy("price-asc");
        }
    };

    const getSortedAndFilteredSets = () => {
        const filtered = sets.filter(
            (set) =>
                set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                set.setNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortBy === "default") return filtered;

        return [...filtered].sort((a, b) => {
            if (sortBy === "number-asc") return a.setNumber.localeCompare(b.setNumber);
            if (sortBy === "number-desc") return b.setNumber.localeCompare(a.setNumber);
            if (sortBy === "price-asc") return a.buyPrice - b.buyPrice;
            if (sortBy === "price-desc") return b.buyPrice - a.buyPrice;
            return 0;
        });
    };

    const displayedSets = getSortedAndFilteredSets();

    return (
        <div>
            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                    onClick={onAddClick}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <Plus size={20} />
                    Add New Set
                </button>

                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name or number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border rounded px-3 py-2 pr-10"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <button
                        onClick={() => handleSort("number")}
                        className={`px-3 py-1 text-sm rounded border ${sortBy.startsWith("number")
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Set Number{" "}
                        {sortBy === "number-asc" ? "↑" : sortBy === "number-desc" ? "↓" : ""}
                    </button>
                    <button
                        onClick={() => handleSort("price")}
                        className={`px-3 py-1 text-sm rounded border ${sortBy.startsWith("price")
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Price{" "}
                        {sortBy === "price-asc" ? "↑" : sortBy === "price-desc" ? "↓" : ""}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSets.map((set) => (
                    <div
                        key={set.id}
                        className="bg-white border rounded-lg p-4 hover:shadow-lg transition relative"
                    >
                        <img
                            src={set.photo}
                            alt={set.name}
                            className="w-full h-48 object-cover rounded mb-3"
                        />
                        <h3 className="font-semibold text-lg mb-2">
                            {set.name} {set.setNumber}
                        </h3>
                        <p className="text-gray-600">Buy Price: {Math.round(set.buyPrice)} CZK</p>
                        <p className="text-sm text-gray-500 mt-1">Location: {set.location}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(set);
                            }}
                            className="absolute bottom-4 right-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
                            type="button"
                        >
                            <Edit2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {displayedSets.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                    {searchQuery
                        ? "No sets found matching your search."
                        : "No sets in inventory. Add your first set!"}
                </p>
            )}
        </div>
    );
};
