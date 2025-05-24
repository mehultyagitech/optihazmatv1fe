import { atom, selector } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom: vesselCommonViewPersist } = recoilPersist({
  key: "vesselCommonViewPersist",
  storage: sessionStorage,
});

export const vesselState = atom({
  key: "vesselState",
  default: {
    id: "",
    open: false,
  }
});

export const vesselSearchMetaState = atom({
  key: "vesselSearchMetaState",
  default: {
    total: 0,
    page: 0,
    limit: 0,
    pageCount: 1
  }
})

export const commonVesselViewState = atom({
  key: 'commonVesselViewState',
  default: {
      id: '',
      name: ''
  },
  effects_UNSTABLE: [vesselCommonViewPersist],
});

export const vesselOpenSelector = selector({
  key: "vesselOpenSelector",
  get: ({ get }) => get(vesselState).open,
});

export const vesselIdSelector = selector({
  key: "vesselIdSelector",
  get: ({ get }) => get(vesselState).id,
});

export const imoNumberSelector = selector({
  key: "imoNumberSelector",
  get: ({ get }) => get(vesselState).imoNumber,
});

export const vesselNameSelector = selector({
  key: "vesselNameSelector",
  get: ({ get }) => get(vesselState).name,
});