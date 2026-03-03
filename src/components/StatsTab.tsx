import { Download, Upload } from "lucide-react";

interface StatsTabProps {
    stats: {
        totalBuyPrice: number;
        totalSellPrice: number;
        profit: number;
        expectedProfit: number;
        totalBuyPriceAllSets: number;
        averageProfitPercent: number;
    };
    setsCount: number;
    soldSetsCount: number;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StatsTab = ({
    stats,
    setsCount,
    soldSetsCount,
    onExport,
    onImport,
}: StatsTabProps) => {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white border rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-4">Sales Statistics</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                        <span className="font-medium">Total Buy Price (All Sets):</span>
                        <span className="text-xl font-bold text-blue-600">
                            {Math.round(stats.totalBuyPriceAllSets)} CZK
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                        <span className="font-medium">Total Buy Price (Sold Sets):</span>
                        <span className="text-xl font-bold">
                            {Math.round(stats.totalBuyPrice)} CZK
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                        <span className="font-medium">Total Sell Price:</span>
                        <span className="text-xl font-bold">
                            {Math.round(stats.totalSellPrice)} CZK
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                        <span className="font-medium">Total Profit:</span>
                        <span
                            className={`text-xl font-bold ${stats.profit >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {Math.round(stats.profit)} CZK
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded">
                        <span className="font-medium">Expected Profit (Inventory):</span>
                        <span className="text-xl font-bold text-purple-600">
                            ~{Math.round(stats.expectedProfit)} CZK
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                        <span className="font-medium">Average Profit %:</span>
                        <span
                            className={`text-xl font-bold ${stats.averageProfitPercent >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {stats.averageProfitPercent.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                        <span className="font-medium">Sets Sold:</span>
                        <span className="text-xl font-bold">{soldSetsCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                        <span className="font-medium">Sets in Inventory:</span>
                        <span className="text-xl font-bold">{setsCount}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mt-6 justify-center">
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <Download size={20} />
                    Export
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
                    <Upload size={20} />
                    Import
                    <input type="file" accept=".json" onChange={onImport} className="hidden" />
                </label>
            </div>
        </div>
    );
};
