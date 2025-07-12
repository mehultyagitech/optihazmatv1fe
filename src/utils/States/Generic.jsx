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

const DocumentTypeSelector = selector({
  key: "DocumentTypeSelector",
  get: ({ get }) => {
    const state = get(genericState);
    return state.DocumentTypes;
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

export {
  genericState,
  defaultDocumentTypeSelector,
  CompartmentSelector,
  DocumentTypeSelector,
  EquipmentSelector,
  LocationSelector,
  SubLocationSelector,
  ObjectSelector,
  InventorySelector,
  ClientSelector,
  ManagerSelector,
};

export default genericState;