import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecoilValue, useSetRecoilState } from "recoil";
import axiosInstance from "../axiosInstance";
import { searchState } from "../../utils/States/Search";

export default function useLocation() {
  const queryClient = useQueryClient();
  const controllerRef = useRef(null);
  const search = useRecoilValue(searchState);
  const defaultURL = "https://avatar.iran.liara.run/public/5";

  const getLocationImageUrl = (location) => {
    if (!!location?.LocationImages[0]) {
      return (
        process.env.REACT_APP_API_URL +
        "/uploads/" +
        location.LocationImages[0].url
      );
    } else {
      return defaultURL;
    }
  };
}
