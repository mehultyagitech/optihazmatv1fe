import { atom, selector } from 'recoil';

const locationPointAddDrawerState = atom({
    key: 'locationPointAddDrawerState',
    default: {
        open: false,
        x: 0,
        y: 0,
        pinId: '',
    },
})

const locationPointState = atom({
    key: 'locationPointState',
    default: {
        id: '',
        vesselId: '',
        attachmentImageId: '',
        locationId: '',
        subLocationId: '',
        userId: '',
        createdAt: '',
        updatedAt: '',
        user: {
            id: '',
            email: '',
            name: ''
        },
        LocationDiagramImage: [],
        location: {
            id: '',
            name: ''
        },
        subLocation: {
            id: '',
            name: ''
        },
        vessel: {
            id: '',
            clientName: '',
            clientManager: null,
            imoNumber: '',
            vesselType: ''
        },
        Pins: []
    },
});

const PinsSelector = selector({
    key: 'pinsSelector',
    get: ({ get }) => {
        const locationDiagram = get(locationPointState);
        return locationDiagram.Pins || [];
    },
});

const ImageSelector = selector({
    key: 'imageSelector',
    get: ({ get }) => {
        const locationDiagram = get(locationPointState);
        return locationDiagram.LocationDiagramImage[0] || {};
    },
});

const LocationSelector = selector({
    key: 'locationSelector',
    get: ({ get }) => {
        const locationDiagram = get(locationPointState);
        return locationDiagram.location || {
            id: '',
            name: ''
        };
    },
});

const SubLocationSelector = selector({
    key: 'subLocationSelector',
    get: ({ get }) => {
        const locationDiagram = get(locationPointState);
        return locationDiagram.subLocation || {
            id: '',
            name: ''
        };
    },
});

export default locationPointState;
export {
    PinsSelector,
    ImageSelector,
    LocationSelector,
    SubLocationSelector,
    locationPointAddDrawerState,
    locationPointState
}