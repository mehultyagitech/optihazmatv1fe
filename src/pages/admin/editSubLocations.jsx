import MyLocationIcon from "@mui/icons-material/MyLocation";
import MasterDataManager from "../../components/MasterDataManager";

export default function EditSubLocations() {
  return (
    <MasterDataManager
      title="Sub-Locations"
      singular="Sub-Location"
      endpoint="/sub-locations"
      icon={MyLocationIcon}
      color="#2e7d32"
      description="Locations within a category, used on diagrams and inventory points."
    />
  );
}
