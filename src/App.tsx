import { useState } from "react";
import { Plus, Download, Upload, X, Save } from "lucide-react";

interface LegoSet {
  id: number;
  name: string;
  buyPrice: number;
  photo: string;
  sellPrice: number | null;
}

interface FormData {
  name: string;
  buyPrice: string;
  quantity: number;
  photo: string | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [sets, setSets] = useState<LegoSet[]>([]);
  const [soldSets, setSoldSets] = useState<LegoSet[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingSet, setEditingSet] = useState<LegoSet | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    buyPrice: "",
    quantity: 1,
    photo: null,
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
      });
    }

    setSets([...sets, ...newSets]);
    setFormData({ name: "", buyPrice: "", quantity: 1, photo: null });
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
    setSoldSets([...soldSets, editingSet]);
    setSets(sets.filter((s) => s.id !== editingSet.id));
    setShowEditModal(false);
    setEditingSet(null);
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    return { totalBuyPrice, totalSellPrice, profit };
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
                <div className="mb-4">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Plus size={20} />
                    Add New Set
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sets.map((set) => (
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
                        Buy Price: {set.buyPrice.toFixed(2)} CZK
                      </p>
                    </div>
                  ))}
                </div>
                {sets.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No sets in inventory. Add your first set!
                  </p>
                )}
              </div>
            )}

            {activeTab === "sold" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldSets.map((set) => (
                  <div key={set.id} className="bg-white border rounded-lg p-4">
                    <img
                      src={set.photo}
                      alt={set.name}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                    <h3 className="font-semibold text-lg mb-2">{set.name}</h3>
                    <p className="text-gray-600">
                      Buy Price: {set.buyPrice.toFixed(2)} CZK
                    </p>
                    <p className="text-green-600">
                      Sell Price: {set.sellPrice?.toFixed(2)} CZK
                    </p>
                    <p className="text-blue-600 font-semibold">
                      Profit: {((set.sellPrice || 0) - set.buyPrice).toFixed(2)}{" "}
                      CZK
                    </p>
                  </div>
                ))}
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
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                      <span className="font-medium">
                        Total Buy Price (Sold Sets):
                      </span>
                      <span className="text-xl font-bold">
                        {stats.totalBuyPrice.toFixed(2)} CZK
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                      <span className="font-medium">Total Sell Price:</span>
                      <span className="text-xl font-bold">
                        {stats.totalSellPrice.toFixed(2)} CZK
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                      <span className="font-medium">Total Profit:</span>
                      <span
                        className={`text-xl font-bold ${
                          stats.profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stats.profit.toFixed(2)} CZK
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
                  Buy Price ($)
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
                  Sell Price ($)
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
