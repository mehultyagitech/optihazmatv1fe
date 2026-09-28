import { atom, selector } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom: genericPersist } = recoilPersist({
  key: "genericPersist",
  storage: sessionStorage,
});

const genericState = atom({
  key: "genericState",
  default: {
    Compartments: [],
    DocumentTypes: [],
    Equipments: [],
    Locations: [],
    SubLocations: [],
    Objects: [],
    Inventory: [],
    Clients: [],
    Managers: [],
    Hazmats: [],
    Units: [],
    ResultTypes: [],
  },
  effects_UNSTABLE: [genericPersist],
});

const CompartmentSelector = selector({
  key: "CompartmentSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Compartments;
  },
});

// Document types for inventory point attachments. They are offered only in
// the inventory point drawer, and every other attachment list leaves them out.
export const INVENTORY_DOCUMENT_TYPE_NAMES = [
  "Inventory Creation Document",
  "Inventory Removal Document",
  "Inventory Replacement Document",
];
const isInventoryDocumentType = (doc) =>
  INVENTORY_DOCUMENT_TYPE_NAMES.some((name) => name.toLowerCase() === String(doc?.name).trim().toLowerCase());

const DocumentTypeSelector = selector({
  key: "DocumentTypeSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return (state.DocumentTypes ?? []).filter((doc) => !isInventoryDocumentType(doc));
  },
});

// In the order listed above.
const InventoryDocumentTypeSelector = selector({
  key: "InventoryDocumentTypeSelector",
  get: ({ get }) => {
    const types = (get(genericState).DocumentTypes ?? []).filter(isInventoryDocumentType);
    const rank = (doc) =>
      INVENTORY_DOCUMENT_TYPE_NAMES.findIndex((name) => name.toLowerCase() === String(doc.name).trim().toLowerCase());
    return [...types].sort((a, b) => rank(a) - rank(b));
  },
});

const defaultDocumentTypeSelector = selector({
  key: "defaultDocumentTypeSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.DocumentTypes.find((doc) => doc.name === 'Default Document Type')?.id || '';
  }
});

const EquipmentSelector = selector({
  key: "EquipmentSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Equipments;
  },
});

// The location category a diagram is cropped under. Inventory point numbers
// take their prefix from it, so only these six are offered, in this order.
export const LOCATION_CATEGORY_NAMES = [
  "Cargo Spaces",
  "Engine Room",
  "Hull",
  "Main Deck",
  "Superstructure",
  "Others",
];
const locationCategoryRank = (item) =>
  LOCATION_CATEGORY_NAMES.findIndex(
    (name) => name.toLowerCase() === String(item?.name).trim().toLowerCase()
  );

const LocationSelector = selector({
  key: "LocationSelector",
  get: ({ get }) => {
    const categories = (get(genericState).Locations ?? []).filter((item) => locationCategoryRank(item) !== -1);
    return [...categories].sort((a, b) => locationCategoryRank(a) - locationCategoryRank(b));
  },
});

const SubLocationSelector = selector({
  key: "SubLocationSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.SubLocations;
  },
});

const ObjectSelector = selector({
  key: "ObjectSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Objects;
  },
});

// The inventory class of a point is the IHM Part I table it belongs to, so
// only these three are ever offered, in this order.
export const INVENTORY_CLASS_NAMES = ["i1", "i2", "i3"];
const inventoryClassRank = (item) =>
  INVENTORY_CLASS_NAMES.indexOf(String(item?.name).trim().toLowerCase());

const InventorySelector = selector({
  key: "InventorySelector",
  get: ({ get }) => {
    const classes = (get(genericState).Inventory ?? []).filter((item) => inventoryClassRank(item) !== -1);
    return [...classes].sort((a, b) => inventoryClassRank(a) - inventoryClassRank(b));
  },
});

const ClientSelector = selector({
  key: "ClientSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Clients;
  },
});

const ManagerSelector = selector({
  key: "ManagerSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Managers;
  }
});

const HazmatSelector = selector({
  key: "HazmatSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Hazmats;
  }
});

const UnitSelector = selector({
  key: "UnitSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Units;
  }
});

// A hazmat row records how the material was established, and only these two
// are offered, in this order.
export const RESULT_TYPE_NAMES = ["Contained", "PCHM"];
const resultTypeRank = (item) =>
  RESULT_TYPE_NAMES.findIndex((name) => name.toLowerCase() === String(item?.name).trim().toLowerCase());

const ResultTypeSelector = selector({
  key: "ResultTypeSelector",
  get: ({ get }) => {
    const types = (get(genericState).ResultTypes ?? []).filter((item) => resultTypeRank(item) !== -1);
    return [...types].sort((a, b) => resultTypeRank(a) - resultTypeRank(b));
  }
});

export {
  genericState,
  defaultDocumentTypeSelector,
  CompartmentSelector,
  DocumentTypeSelector,
  InventoryDocumentTypeSelector,
  EquipmentSelector,
  LocationSelector,
  SubLocationSelector,
  ObjectSelector,
  InventorySelector,
  ClientSelector,
  ManagerSelector,
  HazmatSelector,
  UnitSelector,
  ResultTypeSelector,
};

export default genericState;