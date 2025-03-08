import Joi from "joi";

const vesselSchema = Joi.object({
  vesselName: Joi.string().required().label("Vessel Name"),
  imoNumber: Joi.string().required().label("IMO Number"),
  vesselType: Joi.string().label("Vessel Type"),
  flag: Joi.string().optional().label("Flag"),
  classSociety: Joi.string().optional().label("Class Society"),
  portOfRegistry: Joi.string().optional().label("Port of Registry"),
  grossTonnageMT: Joi.number().optional().label("Gross Tonnage MT"),
  lbd: Joi.string().optional().label("L*B*D"),
  registeredOwner: Joi.string().optional().label("Registered Owner"),
  registeredOwnerAddress: Joi.string().optional().label("Registered Owner Address"),
  vesselManager: Joi.string().optional().label("Vessel Manager"),
  clientName: Joi.string().optional().label("Client Name"),
  deliveryDate: Joi.date().optional().label("Delivery Date"),
  keelLaidDate: Joi.date().optional().label("Keel Laid Date"),
  shipYardName: Joi.string().optional().label("Ship Yard Name"),
  shipYardAddress: Joi.string().optional().label("Ship Yard Address"),
  ihmClass: Joi.string().valid("Class A", "Class B", "Class C").optional().label("IHM Class"),
  ihmSurveyStartDate: Joi.date().optional().label("IHM Survey Start Date"),
  ihmSurveyEndDate: Joi.date().optional().label("IHM Survey End Date"),
  socIssueDate: Joi.date().optional().label("SOC Issue Date"),
  readyForMaintenance: Joi.boolean().optional().label("Ready For Maintenance"),
  maintenanceStartDate: Joi.date().optional().label("Maintenance Start Date"),
  vesselEmailId: Joi.string()
    .email({ tlds: { allow: false } }) // Disable TLD validation
    .optional()
    .label("Vessel Email ID")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).label("Vessel Email ID"),
  headerFreeTextCaption: Joi.string().max(20).optional().label("Header FreeText Caption"),
  headerFreeTextValue: Joi.string().max(40).optional().label("Header FreeText Value"),
  poDataGapDisclaimer: Joi.string().max(500).optional().label("PO Data Gap FreeText Disclaimer"),
  commonReferenceNo: Joi.string().optional().label("Common Reference No/ Drawing No"),
});

export default vesselSchema;