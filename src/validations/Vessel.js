import Joi from "joi";

// One wording for every way a mandatory field can be blank: missing, an empty
// or whitespace string, an empty date input, a non-number, or no option picked.
const REQUIRED = {
  "any.required": "{{#label}} is required",
  "string.empty": "{{#label}} is required",
  "date.base": "{{#label}} is required",
  "number.base": "{{#label}} is required",
  "any.only": "{{#label}} is required",
};

const vesselSchema = Joi.object({
  vesselName: Joi.string().required().label("Vessel Name"),
  imoNumber: Joi.string().required().label("IMO Number"),
  callSign: Joi.string()
    .pattern(/^[A-Za-z0-9]+$/)
    .required()
    .label("Call Sign/Distinctive Number")
    .messages({
      "string.pattern.base": "Call Sign/Distinctive Number must contain only letters and numbers",
    }),
  vesselType: Joi.string().trim().required().label("Vessel Type").messages(REQUIRED),
  flag: Joi.string().trim().required().label("Flag").messages(REQUIRED),
  classSociety: Joi.string().trim().required().label("Class Society").messages(REQUIRED),
  portOfRegistry: Joi.string().trim().required().label("Port of Registry").messages(REQUIRED),
  grossTonnageMT: Joi.number().integer().required().label("Gross Tonnage MT").messages({ ...REQUIRED, "number.integer": "{{#label}} must be a whole number" }),
  lbd: Joi.string().trim().required().label("L*B*D").messages(REQUIRED),
  registeredOwner: Joi.string().trim().required().label("Registered Owner").messages(REQUIRED),
  registeredOwnerAddress: Joi.string().trim().required().label("Registered Owner Address").messages(REQUIRED),
  vesselManager: Joi.number().optional().label("Vessel Manager"),
  clientName: Joi.number().required().label("Client Name").messages({
    "number.base": "Client Name is required",
    "any.required": "Client Name is required",
  }),
  deliveryDate: Joi.date().required().label("Delivery Date").messages(REQUIRED),
  keelLaidDate: Joi.date().required().label("Keel Laid Date").messages(REQUIRED),
  shipYardName: Joi.string().trim().required().label("Ship Yard Name").messages(REQUIRED),
  shipYardAddress: Joi.string().trim().required().label("Ship Yard Address").messages(REQUIRED),
  ihmClass: Joi.string().valid("Class A", "Class B", "Class C").required().label("IHM Class").messages(REQUIRED),
  ihmSurveyStartDate: Joi.date().required().label("IHM Survey Start Date").messages(REQUIRED),
  ihmSurveyEndDate: Joi.date().required().label("IHM Survey End Date").messages(REQUIRED),
  socIssueDate: Joi.date().optional().label("SOC Expiry Date"),
  readyForMaintenance: Joi.boolean().optional().label("Ready For Maintenance"),
  readyForMaintenanceDate: Joi.date()
    .required()
    .label("Ready For Maintenance Date")
    .messages({
      "date.base": "Ready For Maintenance Date is required",
      "any.required": "Ready For Maintenance Date is required",
    }),
  maintenanceStartDate: Joi.date().required().label("Maintenance Start Date").messages(REQUIRED),
  showVesselToOwnerManager: Joi.boolean().optional().label("Show Vessel to Owner/Manager"),
  vesselEmailId: Joi.string()
    .email({ tlds: { allow: false } }) // Disable TLD validation
    .label("Vessel Email ID")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).label("Vessel Email ID"),
  headerFreeTextCaption: Joi.string().max(20).optional().label("Header FreeText Caption"),
  headerFreeTextValue: Joi.string().max(40).optional().label("Header FreeText Value"),
  poDataGapDisclaimer: Joi.string().max(500).optional().label("PO Data Gap FreeText Disclaimer"),
  // Optional: blank (typed then cleared) and null (vessels saved without one)
  // are both fine.
  commonReferenceNo: Joi.string().allow("", null).optional().label("Common Reference No/ Drawing No"),
  discontinued: Joi.boolean().optional(),
  // Mandatory only when the vessel is being discontinued now: ticked, and not
  // already discontinued when the form loaded ($wasDiscontinued, passed by the
  // drawer as react-hook-form context). Unticking needs no remarks; any given
  // are saved as the Active history remarks.
  discontinueRemarks: Joi.when("discontinued", {
    is: true,
    then: Joi.when("$wasDiscontinued", {
      is: true,
      then: Joi.string().max(500).allow("", null).optional(),
      otherwise: Joi.string().trim().max(500).required().messages({
        "string.empty": "Discontinue Remarks is required when the vessel is discontinued",
        "any.required": "Discontinue Remarks is required when the vessel is discontinued",
        "string.base": "Discontinue Remarks is required when the vessel is discontinued",
      }),
    }),
    otherwise: Joi.string().max(500).allow("", null).optional(),
  }).label("Discontinue Remarks"),
});

export default vesselSchema;