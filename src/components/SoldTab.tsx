import { useState } from "react";
import { X, Edit2 } from "lucide-react";
import { LegoSet } from "../types";

interface SoldTabProps {
    soldSets: LegoSet[];
    onEditClick: (set: LegoSet) => void;
}

type SoldSortByType = "date" | "profit-asc" | "profit-desc" | "profit-pct-asc" | "profit-pct-desc";

export const SoldTab = ({ soldSets, onEditClick }: SoldTabProps) => {
    const [soldSearchQuery, setSoldSearchQuery] = useState("");
    const [soldSortBy, setSoldSortBy] = useState<SoldSortByType>("date");

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSoldSort = (type: "profit" | "profit-pct") => {
        if (type === "profit") {
            if (soldSortBy === "profit-asc") setSoldSortBy("profit-desc");
            else if (soldSortBy === "profit-desc") setSoldSortBy("date");
            else setSoldSortBy("profit-asc");
        } else {
            if (soldSortBy === "profit-pct-asc") setSoldSortBy("profit-pct-desc");
            else if (soldSortBy === "profit-pct-desc") setSoldSortBy("date");
            else setSoldSortBy("profit-pct-asc");
        }
    };

    const getSortedAndFilteredSoldSets = () => {
        const filtered = soldSets.filter(
            (set) =>
                set.name.toLowerCase().includes(soldSearchQuery.toLowerCase()) ||
                set.setNumber.toLowerCase().includes(soldSearchQuery.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            if (soldSortBy === "date") {
                const dateA = new Date(a.soldDate || 0).getTime();
                const dateB = new Date(b.soldDate || 0).getTime();
                return dateB - dateA;
            }

            const profitA = (a.sellPrice || 0) - a.buyPrice;
            const profitB = (b.sellPrice || 0) - b.buyPrice;

            if (soldSortBy === "profit-asc") return profitA - profitB;
            if (soldSortBy === "profit-desc") return profitB - profitA;

            const profitPctA = a.sellPrice ? ((a.sellPrice - a.buyPrice) / a.buyPrice) * 100 : 0;
            const profitPctB = b.sellPrice ? ((b.sellPrice - b.buyPrice) / b.buyPrice) * 100 : 0;

            if (soldSortBy === "profit-pct-asc") return profitPctA - profitPctB;
            if (soldSortBy === "profit-pct-desc") return profitPctB - profitPctA;

            return 0;
        });
    };

    const displayedSoldSets = getSortedAndFilteredSoldSets();

    return (
        <div>
            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name or number..."
                        value={soldSearchQuery}
                        onChange={(e) => setSoldSearchQuery(e.target.value)}
                        className="w-full border rounded px-3 py-2 pr-10"
                    />
                    {soldSearchQuery && (
                        <button
                            onClick={() => setSoldSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <button
                        onClick={() => handleSoldSort("profit")}
                        className={`px-3 py-1 text-sm rounded border ${soldSortBy.startsWith("profit") && !soldSortBy.includes("pct")
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Profit{" "}
                        {soldSortBy === "profit-asc" ? "↑" : soldSortBy === "profit-desc" ? "↓" : ""}
                    </button>
                    <button
                        onClick={() => handleSoldSort("profit-pct")}
                        className={`px-3 py-1 text-sm rounded border ${soldSortBy.includes("pct")
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Profit %{" "}
                        {soldSortBy === "profit-pct-asc" ? "↑" : soldSortBy === "profit-pct-desc" ? "↓" : ""}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSoldSets.map((set) => {
                    const profitPercent = set.sellPrice
                        ? ((set.sellPrice - set.buyPrice) / set.buyPrice) * 100
                        : 0;
                    const profitAmount = (set.sellPrice || 0) - set.buyPrice;

                    return (
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
                            <p className="text-green-600">
                                Sell Price: {Math.round(set.sellPrice || 0)} CZK
                            </p>
                            <p
                                className={`font-semibold ${profitAmount >= 0 ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                Profit: {Math.round(profitAmount)} CZK ({profitPercent >= 0 ? "+" : ""}
                                {profitPercent.toFixed(1)}%)
                            </p>
                            {set.soldDate && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                    <span>Sold on: {formatDate(set.soldDate)}</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {set.location}
                                    </span>
                                </p>
                            )}
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
                    );
                })}
                {displayedSoldSets.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-8">
                        {soldSearchQuery
                            ? "No sold sets found matching your search."
                            : "No sold sets yet."}
                    </p>
                )}
            </div>
        </div>
    );
};
