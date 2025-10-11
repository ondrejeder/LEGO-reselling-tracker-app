import { useState } from "react";
import { Plus, Download, Upload, X, Save } from "lucide-react";

interface LegoSet {
  id: number;
  name: string;
  buyPrice: number;
  photo: string;
  sellPrice: number | null;
  location: "Doma" | "Kolej";
  soldDate?: string;
}

interface FormData {
  name: string;
  buyPrice: string;
  quantity: number;
  photo: string | null;
  location: "Doma" | "Kolej";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [sets, setSets] = useState<LegoSet[]>([]);
  const [soldSets, setSoldSets] = useState<LegoSet[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showSoldEditModal, setShowSoldEditModal] = useState<boolean>(false);
  const [editingSet, setEditingSet] = useState<LegoSet | null>(null);
  const [editingSoldSet, setEditingSoldSet] = useState<LegoSet | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "default" | "name-asc" | "name-desc" | "price-asc" | "price-desc"
  >("default");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    buyPrice: "",
    quantity: 1,
    photo: null,
    location: "Doma",
  });

  // Compress and convert image to base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setFormData({ ...formData, photo: compressed });
    }
  };

  const handleAddSet = () => {
    if (!formData.name || !formData.buyPrice || !formData.photo) {
      alert("Please fill in all fields and upload a photo");
      return;
    }

    const newSets: LegoSet[] = [];
    for (let i = 0; i < parseInt(String(formData.quantity)); i++) {
      newSets.push({
        id: Date.now() + i,
        name: formData.name,
        buyPrice: parseFloat(formData.buyPrice),
        photo: formData.photo,
        sellPrice: null,
        location: formData.location,
      });
    }

    setSets([...sets, ...newSets]);
    setFormData({
      name: "",
      buyPrice: "",
      quantity: 1,
      photo: null,
      location: "Doma",
    });
    setShowAddModal(false);
  };

  const handleEditSet = (set: LegoSet) => {
    setEditingSet(set);
    setShowEditModal(true);
  };

  const handleUpdateSet = () => {
    if (editingSet) {
      setSets(sets.map((s) => (s.id === editingSet.id ? editingSet : s)));
      setShowEditModal(false);
      setEditingSet(null);
    }
  };

  const handleMarkAsSold = () => {
    if (!editingSet?.sellPrice) {
      alert("Please enter a sell price");
      return;
    }
    const soldSet = { ...editingSet, soldDate: new Date().toISOString() };
    setSoldSets([...soldSets, soldSet]);
    setSets(sets.filter((s) => s.id !== editingSet.id));
    setShowEditModal(false);
    setEditingSet(null);
  };

  const handleDeleteSet = () => {
    if (!editingSet) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${editingSet.name}"? This action cannot be undone.`
      )
    ) {
      setSets(sets.filter((s) => s.id !== editingSet.id));
      setShowEditModal(false);
      setEditingSet(null);
    }
  };

  const handleEditSoldSet = (set: LegoSet) => {
    setEditingSoldSet(set);
    setShowSoldEditModal(true);
  };

  const handleUpdateSoldSet = () => {
    if (editingSoldSet) {
      setSoldSets(
        soldSets.map((s) => (s.id === editingSoldSet.id ? editingSoldSet : s))
      );
      setShowSoldEditModal(false);
      setEditingSoldSet(null);
    }
  };

  const handleSort = (type: "name" | "price") => {
    if (type === "name") {
      if (sortBy === "name-asc") setSortBy("name-desc");
      else if (sortBy === "name-desc") setSortBy("default");
      else setSortBy("name-asc");
    } else {
      if (sortBy === "price-asc") setSortBy("price-desc");
      else if (sortBy === "price-desc") setSortBy("default");
      else setSortBy("price-asc");
    }
  };

  const getSortedAndFilteredSets = () => {
    let filtered = sets.filter((set) =>
      set.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "default") return filtered;

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-asc") return a.buyPrice - b.buyPrice;
      if (sortBy === "price-desc") return b.buyPrice - a.buyPrice;
      return 0;
    });
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleEditPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && editingSet) {
      const compressed = await compressImage(file);
      setEditingSet({ ...editingSet, photo: compressed });
    }
  };

  const exportData = () => {
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
      a.download = `lego-tracker-${Date.now()}.json`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      // Fallback: copy to clipboard if download fails
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

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          // Force state update to trigger recalculation
          setSets([]);
          setSoldSets([]);
          setTimeout(() => {
            setSets(data.sets || []);
            setSoldSets(data.soldSets || []);
            alert("Data imported successfully!");
          }, 0);
        } catch (error) {
          alert("Error importing data. Please check the file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const calculateStats = () => {
    const totalBuyPrice = soldSets.reduce((sum, set) => sum + set.buyPrice, 0);
    const totalSellPrice = soldSets.reduce(
      (sum, set) => sum + (set.sellPrice || 0),
      0
    );
    const profit = totalSellPrice - totalBuyPrice;
    const totalBuyPriceAllSets = [...sets, ...soldSets].reduce(
      (sum, set) => sum + set.buyPrice,
      0
    );
    const averageProfitPercent =
      soldSets.length > 0
        ? soldSets.reduce((sum, set) => {
            const profitPercent = set.sellPrice
              ? ((set.sellPrice - set.buyPrice) / set.buyPrice) * 100
              : 0;
            return sum + profitPercent;
          }, 0) / soldSets.length
        : 0;
    return {
      totalBuyPrice,
      totalSellPrice,
      profit,
      totalBuyPriceAllSets,
      averageProfitPercent,
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">
                LEGO Reselling Tracker
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Download size={20} />
                  Export
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
                  <Upload size={20} />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-6 py-3 font-medium ${
                activeTab === "inventory"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Inventory ({sets.length})
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`px-6 py-3 font-medium ${
                activeTab === "sold"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sold ({soldSets.length})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-3 font-medium ${
                activeTab === "stats"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "inventory" && (
              <div>
                <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Plus size={20} />
                    Add New Set
                  </button>

                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search by name..."
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
                      onClick={() => handleSort("name")}
                      className={`px-3 py-1 text-sm rounded border ${
                        sortBy.startsWith("name")
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Set Name{" "}
                      {sortBy === "name-asc"
                        ? "↑"
                        : sortBy === "name-desc"
                        ? "↓"
                        : ""}
                    </button>
                    <button
                      onClick={() => handleSort("price")}
                      className={`px-3 py-1 text-sm rounded border ${
                        sortBy.startsWith("price")
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Price{" "}
                      {sortBy === "price-asc"
                        ? "↑"
                        : sortBy === "price-desc"
                        ? "↓"
                        : ""}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSortedAndFilteredSets().map((set) => (
                    <div
                      key={set.id}
                      onClick={() => handleEditSet(set)}
                      className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                    >
                      <img
                        src={set.photo}
                        alt={set.name}
                        className="w-full h-48 object-cover rounded mb-3"
                      />
                      <h3 className="font-semibold text-lg mb-2">{set.name}</h3>
                      <p className="text-gray-600">
                        Buy Price: {Math.round(set.buyPrice)} CZK
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Location: {set.location}
                      </p>
                    </div>
                  ))}
                </div>
                {getSortedAndFilteredSets().length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {searchQuery
                      ? "No sets found matching your search."
                      : "No sets in inventory. Add your first set!"}
                  </p>
                )}
              </div>
            )}

            {activeTab === "sold" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldSets.map((set) => {
                  const profitPercent = set.sellPrice
                    ? ((set.sellPrice - set.buyPrice) / set.buyPrice) * 100
                    : 0;
                  const profitAmount = (set.sellPrice || 0) - set.buyPrice;
                  return (
                    <div
                      key={set.id}
                      onClick={() => handleEditSoldSet(set)}
                      className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                    >
                      <img
                        src={set.photo}
                        alt={set.name}
                        className="w-full h-48 object-cover rounded mb-3"
                      />
                      <h3 className="font-semibold text-lg mb-2">{set.name}</h3>
                      <p className="text-gray-600">
                        Buy Price: {Math.round(set.buyPrice)} CZK
                      </p>
                      <p className="text-green-600">
                        Sell Price: {Math.round(set.sellPrice || 0)} CZK
                      </p>
                      <p
                        className={`font-semibold ${
                          profitAmount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Profit: {Math.round(profitAmount)} CZK (
                        {profitPercent >= 0 ? "+" : ""}
                        {profitPercent.toFixed(1)}%)
                      </p>
                      {set.soldDate && (
                        <p className="text-xs text-gray-400 mt-2">
                          Sold on: {formatDate(set.soldDate)}
                        </p>
                      )}
                    </div>
                  );
                })}
                {soldSets.length === 0 && (
                  <p className="col-span-full text-center text-gray-500 py-8">
                    No sold sets yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white border rounded-lg p-6 space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Sales Statistics</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                      <span className="font-medium">
                        Total Buy Price (All Sets):
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {Math.round(stats.totalBuyPriceAllSets)} CZK
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                      <span className="font-medium">
                        Total Buy Price (Sold Sets):
                      </span>
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
                        className={`text-xl font-bold ${
                          stats.profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.round(stats.profit)} CZK
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                      <span className="font-medium">Average Profit %:</span>
                      <span
                        className={`text-xl font-bold ${
                          stats.averageProfitPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stats.averageProfitPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                      <span className="font-medium">Sets Sold:</span>
                      <span className="text-xl font-bold">
                        {soldSets.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                      <span className="font-medium">Sets in Inventory:</span>
                      <span className="text-xl font-bold">{sets.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sold Set Edit Modal */}
      {showSoldEditModal && editingSoldSet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Sold Price</h2>
              <button onClick={() => setShowSoldEditModal(false)}>
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
                <h3 className="font-semibold text-lg">{editingSoldSet.name}</h3>
                <p className="text-sm text-gray-600">
                  Buy Price: {Math.round(editingSoldSet.buyPrice)} CZK
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <button
                onClick={handleUpdateSoldSet}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                <Save size={20} />
                Update Sell Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New Set</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Set Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Buy Price (CZK)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.buyPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, buyPrice: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value as "Doma" | "Kolej",
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Doma">Doma</option>
                  <option value="Kolej">Kolej</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full border rounded px-3 py-2"
                />
                {formData.photo && (
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded"
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
      )}

      {/* Edit Modal */}
      {showEditModal && editingSet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Set</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Set Name
                </label>
                <input
                  type="text"
                  value={editingSet.name}
                  onChange={(e) =>
                    setEditingSet({ ...editingSet, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Buy Price (CZK)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingSet.buyPrice}
                  onChange={(e) =>
                    setEditingSet({
                      ...editingSet,
                      buyPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sell Price (CZK)
                </label>
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
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <select
                  value={editingSet.location}
                  onChange={(e) =>
                    setEditingSet({
                      ...editingSet,
                      location: e.target.value as "Doma" | "Kolej",
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Doma">Doma</option>
                  <option value="Kolej">Kolej</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoUpload}
                  className="w-full border rounded px-3 py-2"
                />
                {editingSet.photo && (
                  <img
                    src={editingSet.photo}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateSet}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  <Save size={20} />
                  Save Changes
                </button>
                <button
                  onClick={handleMarkAsSold}
                  className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Mark as Sold
                </button>
              </div>
              <button
                onClick={handleDeleteSet}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <X size={20} />
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
