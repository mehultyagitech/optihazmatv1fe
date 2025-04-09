import { atom, selector } from "recoil";

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
  },
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
};

export default genericState;