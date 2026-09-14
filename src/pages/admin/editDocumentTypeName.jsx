import DescriptionIcon from "@mui/icons-material/Description";
import MasterDataManager from "../../components/MasterDataManager";

export default function EditDocumentTypeName() {
  return (
    <MasterDataManager
      title="Document Types"
      singular="Document Type"
      endpoint="/document-types"
      icon={DescriptionIcon}
      color="#8e24aa"
      description="Types for vessel and inventory point attachments (MD, SDoC, reports...)."
    />
  );
}
