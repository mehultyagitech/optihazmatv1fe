import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import MasterDataManager from "../../components/MasterDataManager";

export default function EditEquipmentName() {
  return (
    <MasterDataManager
      title="Equipment"
      singular="Equipment"
      endpoint="/equipments"
      icon={PrecisionManufacturingIcon}
      color="#ef6c00"
      description="Machinery and equipment that inventory points are recorded against."
    />
  );
}
