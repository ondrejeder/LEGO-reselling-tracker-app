import { useState, useEffect } from "react";
import { LogOut, ArrowUp } from "lucide-react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";

import { LegoSet, FormData } from "./types";
import { useSets } from "./hooks/useSets";
import { useSoldSets } from "./hooks/useSoldSets";
import { exportData, handleImportData } from "./utils/exportImport";

import { AddModal } from "./components/AddModal";
import { EditModal } from "./components/EditModal";
import { SoldEditModal } from "./components/SoldEditModal";
import { InventoryTab } from "./components/InventoryTab";
import { SoldTab } from "./components/SoldTab";
import { StatsTab } from "./components/StatsTab";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authError, setAuthError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showSoldEditModal, setShowSoldEditModal] = useState<boolean>(false);
  const [editingSet, setEditingSet] = useState<LegoSet | null>(null);
  const [editingSoldSet, setEditingSoldSet] = useState<LegoSet | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
      if (currentUser) {
        setAuthError("");
      }
    });
    return () => unsubscribe();
  }, []);

  const userId = user?.uid;

  // React Query Hooks
  const {
    sets,
    isLoading: isLoadingSets,
    addSet,
    updateSet,
    deleteSetAsync,
  } = useSets(userId);

  const {
    soldSets,
    isLoading: isLoadingSoldSets,
    addSoldSet,
    updateSoldSet,
    deleteSoldSetAsync,
  } = useSoldSets(userId);

  const loading = loadingUser || (user && (isLoadingSets || isLoadingSoldSets));

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Auth Handlers
  const handleSignIn = async () => {
    try {
      setAuthError("");
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthError("Failed to sign in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      setAuthError("Failed to sign out. Please try again.");
    }
  };

  // Inventory Handlers
  const handleAddNewSets = (formData: FormData) => {
    const newSets: Omit<LegoSet, "id">[] = [];
    for (let i = 0; i < formData.quantity; i++) {
      newSets.push({
        setNumber: formData.setNumber,
        name: formData.name,
        buyPrice: parseFloat(formData.buyPrice),
        photo: formData.photo!,
        sellPrice: null,
        location: formData.location,
      });
    }
    addSet(newSets, {
      onSuccess: () => setShowAddModal(false),
      onError: () => alert("Failed to add sets."),
    });
  };

  const handleUpdateSet = (updatedSet: LegoSet) => {
    updateSet(updatedSet, {
      onSuccess: () => {
        setShowEditModal(false);
        setEditingSet(null);
      },
      onError: () => alert("Failed to update set."),
    });
  };

  const handleMarkAsSold = async (set: LegoSet) => {
    if (!set.sellPrice) {
      alert("Please enter a sell price");
      return;
    }
    try {
      const { id, ...soldSetData } = set;
      const soldSet = { ...soldSetData, soldDate: new Date().toISOString() };

      // We wait for adding to sold, then delete from sets
      addSoldSet(soldSet);
      await deleteSetAsync(set.id);

      setShowEditModal(false);
      setEditingSet(null);
    } catch (error) {
      alert("Error marking as sold. Please try again.");
    }
  };

  const handleDeleteSet = async (deleteTarget: LegoSet) => {
    if (window.confirm(`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`)) {
      try {
        await deleteSetAsync(deleteTarget.id);
        setShowEditModal(false);
        setEditingSet(null);
      } catch (error) {
        alert("Failed to delete set.");
      }
    }
  };

  const handleDuplicateSet = (duplicateTarget: LegoSet) => {
    const { id, ...duplicateData } = duplicateTarget;
    const duplicated = { ...duplicateData, sellPrice: null };
    // addSet takes an array of new sets
    addSet([duplicated], {
      onSuccess: () => {
        setShowEditModal(false);
        setEditingSet(null);
        alert("Set duplicated successfully!");
      },
    });
  };

  // Sold Inventory Handlers
  const handleUpdateSoldSet = (updatedSet: LegoSet) => {
    updateSoldSet(updatedSet, {
      onSuccess: () => {
        setShowSoldEditModal(false);
        setEditingSoldSet(null);
      },
    });
  };

  const handleDeleteSoldSet = async (deleteTarget: LegoSet) => {
    if (window.confirm(`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`)) {
      try {
        await deleteSoldSetAsync(deleteTarget.id);
        setShowSoldEditModal(false);
        setEditingSoldSet(null);
      } catch (error) {
        alert("Failed to delete sold set.");
      }
    }
  };

  const calculateStats = () => {
    const totalBuyPrice = soldSets.reduce((sum, set) => sum + set.buyPrice, 0);
    const totalSellPrice = soldSets.reduce((sum, set) => sum + (set.sellPrice || 0), 0);
    const profit = totalSellPrice - totalBuyPrice;
    const totalBuyPriceAllSets = [...sets, ...soldSets].reduce((sum, set) => sum + set.buyPrice, 0);
    const averageProfitPercent = totalBuyPrice > 0 ? (profit / totalBuyPrice) * 100 : 0;

    // Expected profit: (Total inventory buy price) * (average profit percentage)
    const inventoryBuyPrice = totalBuyPriceAllSets - totalBuyPrice;
    const expectedProfit = averageProfitPercent > 0 ? inventoryBuyPrice * (averageProfitPercent / 100) : 0;

    return {
      totalBuyPrice,
      totalSellPrice,
      profit,
      expectedProfit,
      totalBuyPriceAllSets,
      averageProfitPercent,
    };
  };

  // Render Loading
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Render Login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Brick Invest</h1>
          <p className="text-gray-600 mb-8">Track your LEGO investments</p>
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
          {authError && <p className="mt-4 text-red-600 text-sm">{authError}</p>}
        </div>
      </div>
    );
  }

  // Render Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Brick Invest</h1>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-6 py-3 font-medium ${activeTab === "inventory"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Inventory ({sets.length})
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`px-6 py-3 font-medium ${activeTab === "sold"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Sold ({soldSets.length})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-3 font-medium ${activeTab === "stats"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Stats
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoadingSets || isLoadingSoldSets ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Syncing data...</p>
              </div>
            ) : (
              <>
                {activeTab === "inventory" && (
                  <InventoryTab
                    sets={sets}
                    onAddClick={() => setShowAddModal(true)}
                    onEditClick={(set) => {
                      setEditingSet(set);
                      setShowEditModal(true);
                    }}
                  />
                )}
                {activeTab === "sold" && (
                  <SoldTab
                    soldSets={soldSets}
                    onEditClick={(set) => {
                      setEditingSoldSet(set);
                      setShowSoldEditModal(true);
                    }}
                  />
                )}
                {activeTab === "stats" && (
                  <StatsTab
                    stats={calculateStats()}
                    setsCount={sets.length}
                    soldSetsCount={soldSets.length}
                    onExport={() => exportData(sets, soldSets)}
                    onImport={(e) => {
                      const file = e.target.files?.[0];
                      if (file && user) {
                        handleImportData(
                          file,
                          user,
                          db,
                          () => {
                            alert("Data imported successfully!");
                            window.location.reload(); // Simple way to force React Query refetch
                          },
                          (err) => alert("Import failed: " + err)
                        );
                      }
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showScrollTop && (activeTab === "inventory" || activeTab === "sold") && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-50"
          title="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddNewSets}
        />
      )}

      {showEditModal && editingSet && (
        <EditModal
          set={editingSet}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateSet}
          onMarkAsSold={handleMarkAsSold}
          onDelete={handleDeleteSet}
          onDuplicate={handleDuplicateSet}
        />
      )}

      {showSoldEditModal && editingSoldSet && (
        <SoldEditModal
          set={editingSoldSet}
          onClose={() => setShowSoldEditModal(false)}
          onUpdate={handleUpdateSoldSet}
          onDelete={handleDeleteSoldSet}
        />
      )}
    </div>
  );
}
