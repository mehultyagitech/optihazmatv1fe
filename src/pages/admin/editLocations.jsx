import PlaceIcon from "@mui/icons-material/Place";
import MasterDataManager from "../../components/MasterDataManager";

export default function EditLocations() {
  return (
    <MasterDataManager
      title="Locations"
      singular="Location"
      endpoint="/locations"
      icon={PlaceIcon}
      color="#1976d2"
      description="Location categories (decks, rooms) used for location diagrams."
    />
  );
}
