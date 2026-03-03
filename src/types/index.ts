export interface LegoSet {
  id: string;
  setNumber: string;
  name: string;
  buyPrice: number;
  photo: string;
  sellPrice: number | null;
  location: "Doma" | "Kolej";
  soldDate?: string;
}

export interface FormData {
  setNumber: string;
  name: string;
  buyPrice: string;
  quantity: number;
  photo: string | null;
  location: "Doma" | "Kolej";
}

export interface ImportData {
  sets?: Array<Omit<LegoSet, "id"> & { id?: string }>;
  soldSets?: Array<Omit<LegoSet, "id"> & { id?: string }>;
}
