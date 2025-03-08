import { atom, selector } from "recoil";

export const vesselState = atom({
  key: "vesselState",
  default: {
    id: "",
    open: false,
    imoNumber: "",
    vesselName: "",
    vesselType: "",
    avatarSrc: "",
    clientName: "",
  },
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
