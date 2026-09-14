import CategoryIcon from "@mui/icons-material/Category";
import MasterDataManager from "../../components/MasterDataManager";

export default function EditObjects() {
  return (
    <MasterDataManager
      title="Objects"
      singular="Object"
      endpoint="/objects"
      icon={CategoryIcon}
      color="#d84315"
      description="Objects that contain hazmats, chosen per point or per hazmat row."
    />
  );
}
