import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecoilValue, useSetRecoilState } from "recoil";
import axiosInstance from "../axiosInstance";
import { searchState } from "../../utils/States/Search";
import { useRef } from "react";
import { vesselSearchMetaState } from "../../utils/States/Vessel";

export default function useVessel() {
  const queryClient = useQueryClient();
  const controllerRef = useRef(null);
  const search = useRecoilValue(searchState);
  const vesselSearchMeta = useSetRecoilState(vesselSearchMetaState);
  const defaultURL = "https://avatar.iran.liara.run/public/5";

  const getVesselImageUrl = (vessel) => {
    if (!!vessel?.VesselImages[0]) {
      return (
        process.env.REACT_APP_API_URL + "/uploads/" + vessel.VesselImages[0].url
      );
    } else {
      return defaultURL;
    }
  };

  const getVessels = () => {
    return useQuery({
      queryKey: ["vessels", search],
      queryFn: async () => {
        if (controllerRef.current) {
          controllerRef.current.abort();
        }

        controllerRef.current = new AbortController();

        const response = await axiosInstance.get("/vessels", {
          params: {
            search,
          },
          signal: controllerRef.current.signal,
        });

        vesselSearchMeta(response.data.meta);

        return response.data;
      },
      staleTime: 1000 * 60 * 5,
      select: (data) =>
        data.data.map((vessel) => ({
          id: vessel.id,
          avatarSrc: getVesselImageUrl(vessel),
          vessel: vessel.vesselName,
          imoNumber: vessel.imoNumber,
          clientName: vessel.clientName,
          managerName: vessel.vesselManager,
          vesselType: vessel.vesselType,
        })),
    });
  };

  const getVesselById = (id) => {
    return useQuery({
      queryKey: ["vessel", id],
      queryFn: async () => {
        const response = await axiosInstance.get(`/vessels/${id}`);
        return response.data;
      },
      enabled: !!id,
      select: (data) => ({
        // id: data.data.id,
        vesselName: data.data.vesselName,
        imoNumber: data.data.imoNumber,
        vesselType: data.data.vesselType,
        flag: data.data.flag,
        classSociety: data.data.classSociety,
        portOfRegistry: data.data.portOfRegistry,
        grossTonnageMT: data.data.grossTonnageMT,
        lbd: data.data.lbd,
        registeredOwner: data.data.registeredOwner,
        registeredOwnerAddress: data.data.registeredOwnerAddress,
        vesselManager: data.data.vesselManager,
        clientName: data.data.clientName,
        deliveryDate: data.data.deliveryDate,
        keelLaidDate: data.data.keelLaidDate,
        shipYardName: data.data.shipYardName,
        shipYardAddress: data.data.shipYardAddress,
        ihmClass: data.data.ihmClass,
        ihmSurveyStartDate: data.data.ihmSurveyStartDate,
        ihmSurveyEndDate: data.data.ihmSurveyEndDate,
        socIssueDate: data.data.socIssueDate,
        readyForMaintenance: data.data.readyForMaintenance,
        maintenanceStartDate: data.data.maintenanceStartDate,
        vesselEmailId: data.data.vesselEmailId,
        headerFreeTextCaption: data.data.headerFreeTextCaption,
        headerFreeTextValue: data.data.headerFreeTextValue,
        poDataGapDisclaimer: data.data.poDataGapDisclaimer,
        commonReferenceNo: data.data.commonReferenceNo,
        VesselImages: data.data.VesselImages,
        VesselAttachments: data.data.VesselAttachments,
        // clientId: data.data.clientId,
        // createdBy: data.data.createdBy,
        // createdAt: data.data.createdAt,
        // updatedAt: data.data.updatedAt,
      }),
    });
  };

  const createVessel = () => {
    return useMutation({
      mutationFn: async (data) => {
        let type = "application/json";
        if (data instanceof FormData) {
          type = "multipart/form-data";
        }

        const response = await axiosInstance.post("/vessels", data, {
          headers: {
            "Content-Type": type,
          },
        });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vessels"] });
      },
    });
  };

  const updateVessel = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        let type = "application/json";
        if (data instanceof FormData) {
          type = "multipart/form-data";
        }

        const response = await axiosInstance.put(`/vessels/${id}`, data, {
          headers: {
            "Content-Type": type,
          },
        });
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["vessels"] });
        queryClient.invalidateQueries({ queryKey: ["vessel", variables.id] });
      },
    });
  };

  const deleteVessel = () => {
    return useMutation({
      mutationFn: async (id) => {
        const response = await axiosInstance.delete(`/vessels/${id}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vessels"] });
      },
    });
  };

  const uploadFiles = (id) => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await axiosInstance.post(
          `/vessels/${id}/upload`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      },
    });
  };

  return {
    getVessels,
    getVesselById,
    createVessel,
    updateVessel,
    deleteVessel,
    uploadFiles,
  };
}
