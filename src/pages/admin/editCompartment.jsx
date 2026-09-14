import ViewInArIcon from "@mui/icons-material/ViewInAr";
import MasterDataManager from "../../components/MasterDataManager";

export default function EditCompartment() {
  return (
    <MasterDataManager
      title="Compartments"
      singular="Compartment"
      endpoint="/compartments"
      icon={ViewInArIcon}
      color="#00897b"
      description="Compartments that narrow down where an inventory point sits."
    />
  );
}
