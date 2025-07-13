import Joi from "joi";

export const inventoryPointSchema = Joi.object({
  subLocationId: Joi.string().required().label("Sub Location"),
  equipmentId: Joi.string().required().label("Equipment"),
  compartmentId: Joi.string().required().label("Compartment"),
  objectId: Joi.string().required().label("Object"),
  description: Joi.string().allow("").label("Description"),
  inventoryId: Joi.string().required().label("Inventory Class"),
  isPCHM: Joi.boolean(),
  manufacturerBrand: Joi.string().allow("").label("Manufacturer Brand"),
  referenceNo: Joi.string().allow("").label("Reference No/ Drawing No"),
  remarks: Joi.string().allow("").label("Remarks"),
  saveWithoutImage: Joi.boolean(),
  useCommonImage: Joi.boolean(),
  isRemovedFromIHM: Joi.boolean(),
  isReplaced: Joi.boolean(),
  removedDate: Joi.when("isRemovedFromIHM", {
    is: true,
    then: Joi.string().required().label("Removed Date"),
    otherwise: Joi.string().allow("")
  }),
  removedRemarks: Joi.when("isRemovedFromIHM", {
    is: true,
    then: Joi.string().required().label("Removed Remarks"),
    otherwise: Joi.string().allow("")
  }),
  hazmats: Joi.any().optional()
});
