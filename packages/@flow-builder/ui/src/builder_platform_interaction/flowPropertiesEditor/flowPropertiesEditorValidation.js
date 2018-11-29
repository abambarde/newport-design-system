import * as ValidationRules from "builder_platform_interaction/validationRules";
import { Validation } from "builder_platform_interaction/validation";

/**
 * @constant additionalRules - map of propertyName to validation rules
 * @type {Object}
 */
const additionalRules = {
    'interviewLabel': [
        ValidationRules.maximumCharactersLimit(1000),
        ValidationRules.isValidResourcedTextArea,
    ],
    'processType' : [
        ValidationRules.shouldNotBeNullOrUndefined
    ],
};

export const flowPropertiesEditorValidation = new Validation(additionalRules);