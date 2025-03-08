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
          avatarSrc: "https://avatar.iran.liara.run/public/5",
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
      select: (data) => data.data,
    });
  };

  const createVessel = () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await axiosInstance.post("/vessels", data, {
          headers: {
            Accept: "Application/json",
            "Content-Type": "Application/json",
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
        const response = await axiosInstance.put(`/vessels/${id}`, data, {
          headers: {
            Accept: "Application/json",
            "Content-Type": "Application/json",
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
