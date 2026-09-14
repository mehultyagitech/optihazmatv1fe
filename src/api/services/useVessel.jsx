import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance";
import { searchState } from "../../utils/States/Search";
import { useRef } from "react";
import { vesselSearchMetaState } from "../../utils/States/Vessel";

export default function useVessel() {
  const queryClient = useQueryClient();
  const controllerRef = useRef(null);
  const search = useRecoilValue(searchState);
  const setVesselSearchMeta = useSetRecoilState(vesselSearchMetaState);
  const defaultURL = "https://avatar.iran.liara.run/public/5";

  const getVesselImageUrl = (vessel) => {
    if (!!vessel?.VesselImages[0]) {
      return (
        import.meta.env.VITE_API_URL + "/uploads/" + vessel.VesselImages[0].url
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

        setVesselSearchMeta(response.data.meta);

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
          clientName2: vessel.Client?.companyName ?? "-",  // <-- fixed
          managerName2: vessel.Manager?.companyName ?? "-", // optional if you want Manager name
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
        // "" not null: existing vessels have no call sign yet, and a null
        // value would make the text field uncontrolled.
        callSign: data.data.callSign ?? "",
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
        // socIssueDate is no longer on the form; leaving it out of the form
        // values means saves no longer send (or overwrite) the stored date.
        readyForMaintenance: data.data.readyForMaintenance,
        readyForMaintenanceDate: data.data.readyForMaintenanceDate,
        maintenanceStartDate: data.data.maintenanceStartDate,
        showVesselToOwnerManager: data.data.showVesselToOwnerManager ?? false,
        vesselEmailId: data.data.vesselEmailId,
        headerFreeTextCaption: data.data.headerFreeTextCaption,
        headerFreeTextValue: data.data.headerFreeTextValue,
        poDataGapDisclaimer: data.data.poDataGapDisclaimer,
        commonReferenceNo: data.data.commonReferenceNo,
        VesselImages: data.data.VesselImages,
        VesselAttachments: data.data.VesselAttachments,
        discontinued: data.data.discontinued,
        VesselHistory: data.data.VesselHistory,
        VesselInventoryImages: data.data.VesselInventoryImage,
        // Shown in the drawer footer; the drawer keeps these out of the form.
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt,
        createdByUser: data.data.user,
        updatedByUser: data.data.updatedByUser,
        // clientId: data.data.clientId,
        // createdBy: data.data.createdBy,
        // createdAt: data.data.createdAt,
        // updatedAt: data.data.updatedAt,
      }),
    });
  };

  // The API answers validation failures as
  // { success: false, message: "Validation error", data: { field: "message" } }
  // and other failures with just a message (or { error } for a 404).
  const getVesselErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    const fieldMessages =
      payload?.data && typeof payload.data === "object"
        ? Object.values(payload.data).filter((m) => typeof m === "string")
        : [];
    if (fieldMessages.length > 0) return fieldMessages.join("; ");
    return payload?.message || payload?.error || error?.message || fallback;
  };

  const createVessel = () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await axiosInstance.post("/vessels", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vessels"] });
        toast.success("Vessel created successfully!");
      },
      onError: (error) => {
        toast.error(getVesselErrorMessage(error, "Could not create the vessel."));
      },
    });
  };

  const updateVessel = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await axiosInstance.put(`/vessels/${id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["vessels"] });
        queryClient.invalidateQueries({ queryKey: ["vessel", variables.id] });
        toast.success("Vessel saved successfully!");
      },
      onError: (error) => {
        toast.error(getVesselErrorMessage(error, "Could not save the vessel."));
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

  /**
   * @deprecated use multipart/form-data instead
   * @description Upload files to the server for a specific vessel.
   */
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
