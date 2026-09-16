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

const LocationSelector = selector({
  key: "LocationSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Locations;
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

const InventorySelector = selector({
  key: "InventorySelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.Inventory;
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

const ResultTypeSelector = selector({
  key: "ResultTypeSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.ResultTypes;
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