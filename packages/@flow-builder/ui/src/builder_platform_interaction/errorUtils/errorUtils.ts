export const errorType = {
    CANVAS_ERROR: 'canvasError',
    PROPERTY_EDITOR_ERROR: 'propertyEditorError',
    RESOURCE_ERROR: 'resourceError',
    PARENT_CHILD_ERROR: 'parentChildError',
    START_ELEMENT_ERROR: 'startElementError',
    NO_API_NAME_ERROR: 'noApiNameError'
};

export const errorTypeMap = {
    FOOTER_MISSING_WITHOUT_COMPONENT: errorType.PROPERTY_EDITOR_ERROR,
    SCREEN_MISSING_FOOTER_AND_LIGHTNING_COMPONENT: errorType.PROPERTY_EDITOR_ERROR,
    NOT_CONNECTED: errorType.CANVAS_ERROR,
    ELEMENT_MISSING_CONNECTOR: errorType.CANVAS_ERROR,
    DECISION_EMPTY: errorType.PROPERTY_EDITOR_ERROR,
    DECISION_MISSING_OUTCOME: errorType.PROPERTY_EDITOR_ERROR,
    RULE_INVALID_BOOLEAN_FILTER: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_LOGIC_INVALID: errorType.PROPERTY_EDITOR_ERROR,
    RULE_MISSING_BOOLEAN_FILTER: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_LOGIC_MISSING: errorType.PROPERTY_EDITOR_ERROR,
    RULE_BOOLEAN_FILTER_TOO_LONG: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_LOGIC_EXCEEDS_LIMIT: errorType.PROPERTY_EDITOR_ERROR,
    RULE_MISSING_OPERATOR: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_MISSING_OPERATOR: errorType.PROPERTY_EDITOR_ERROR,
    RULE_INVALID_LEFTOPERAND: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_INVALID_LEFTOPERAND: errorType.PROPERTY_EDITOR_ERROR,
    RULE_INVALID_LEFTOPERAND_FOR_ELEMENT: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_OPERATOR_INCOMPATIBLE: errorType.PROPERTY_EDITOR_ERROR,
    RULE_INVALID_ELEMENT: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_REFERENCED_ELEMENT_NOT_FOUND: errorType.PROPERTY_EDITOR_ERROR,
    RULE_INVALID_LEFT_ELEMENT: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_INVALID_LEFT_ELEMENT: errorType.PROPERTY_EDITOR_ERROR,
    RULE_NO_DATA_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_MISSING_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    RULE_INVALID_DATA_TYPE_MAPPING_RHS_ELEMENT: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_OPERAND_DATATYPES_INCOMPATIBLE: errorType.PROPERTY_EDITOR_ERROR,
    RULE_INVALID_DATA_TYPE_MAPPING_RHS_LITERAL: errorType.PROPERTY_EDITOR_ERROR,
    RULE_EMPTY: errorType.PROPERTY_EDITOR_ERROR,
    RULE_MISSING_CONDITION: errorType.PROPERTY_EDITOR_ERROR,
    RULE_RIGHT_OPERAND_NULL: errorType.PROPERTY_EDITOR_ERROR,
    CONDITION_RIGHTOPERAND_NULL: errorType.PROPERTY_EDITOR_ERROR,
    QUESTION_HAS_NO_CHOICE: errorType.PARENT_CHILD_ERROR,
    CHOICEFIELD_DEFAULT_CHOICE_NOT_FOUND: errorType.PARENT_CHILD_ERROR,
    INCORRECT_CHOICE_VALUE_FOR_QUESTION: errorType.NO_API_NAME_ERROR,
    INVALID_MERGED_FIELD: errorType.NO_API_NAME_ERROR,
    SCALE_LESS_THAN_ZERO: errorType.CANVAS_ERROR,
    FLOW_ELEMENT_SCALE_LESS_THAN_ZERO: errorType.CANVAS_ERROR,
    ELEMENT_HAS_INVALID_DEFAULT_VALUE: errorType.NO_API_NAME_ERROR,
    DATA_TYPE_NOT_SUPPORTED_FOR_PROCESSTYPE: errorType.RESOURCE_ERROR,
    NO_REFERENCES_IN_STAGE: errorType.RESOURCE_ERROR,
    FLOW_STAGE_INCLUDES_REFERENCES: errorType.RESOURCE_ERROR,
    SCALE_IS_NULL: errorType.CANVAS_ERROR,
    VARIABLE_SCALE_NULL: errorType.CANVAS_ERROR,
    FIELD_NOT_ALLOWED_FOR_DATATYPE: errorType.RESOURCE_ERROR,
    VARIABLE_FIELD_NOT_SUPPORTED_FOR_DATATYPE: errorType.RESOURCE_ERROR,
    FIELD_NOT_ALLOWED_FOR_COLLECTION: errorType.RESOURCE_ERROR,
    VARIABLE_FIELD_NOT_SUPPORTED_FOR_DATATYPE_AND_COLLECTION: errorType.RESOURCE_ERROR,
    FIELD_REQUIRED_FOR_DATATYPE: errorType.RESOURCE_ERROR,
    VARIABLE_FIELD_REQUIRED_FOR_DATATYPE: errorType.RESOURCE_ERROR,
    SCALE_IS_TOO_BIG: errorType.CANVAS_ERROR,
    VARIABLE_SCALE_EXCEEDS_LIMIT: errorType.CANVAS_ERROR,
    APEX_CALL_MISSING_INPUT_PARAMETERS: errorType.PROPERTY_EDITOR_ERROR,
    APEXCALLOUT_REQUIRED_INPUT_MISSING: errorType.PROPERTY_EDITOR_ERROR,
    APEX_CALL_DUP_INPUT_PARAMETERS: errorType.PROPERTY_EDITOR_ERROR,
    APEXCALLOUT_INPUT_DUPLICATE: errorType.PROPERTY_EDITOR_ERROR,
    APEX_CALL_BAD_OUTPUT_PARAMETER: errorType.PROPERTY_EDITOR_ERROR,
    APEX_CALL_WRONG_TYPE_INPUT_PARAMETER: errorType.PROPERTY_EDITOR_ERROR,
    APEXCALLOUT_INPUT_INCOMPATIBLE_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    APEX_CALL_WRONG_TYPE_OUTPUT_PARAMETER: errorType.PROPERTY_EDITOR_ERROR,
    APEXCALLOUT_OUTPUT_INCOMPATIBLE_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    APEX_CALL_NO_APEX_CLASS: errorType.PROPERTY_EDITOR_ERROR,
    APEXCALLOUT_MISSING_CLASSNAME: errorType.PROPERTY_EDITOR_ERROR,
    APEX_CALL_DOESNT_IMPLEMENT_INTERFACE: errorType.PROPERTY_EDITOR_ERROR,
    APEXCLASS_MISSING_INTERFACE: errorType.PROPERTY_EDITOR_ERROR,
    FORMULA_ERROR: errorType.PROPERTY_EDITOR_ERROR,
    FORMULA_EXPRESSION_INVALID: errorType.PROPERTY_EDITOR_ERROR,
    FORMULA_GENERAL_ERROR: errorType.PROPERTY_EDITOR_ERROR,
    FORMULA_CMT_LIMIT_EXCEEDED: errorType.PROPERTY_EDITOR_ERROR,
    SFDC_OBJECT_DOES_NOT_EXIST: errorType.PROPERTY_EDITOR_ERROR,
    OBJECT_NOT_FOUND: errorType.PROPERTY_EDITOR_ERROR,
    SFDC_OBJECT_CANNOT_BE_CREATED: errorType.PROPERTY_EDITOR_ERROR,
    OBJECT_CANNOT_BE_CREATED: errorType.PROPERTY_EDITOR_ERROR,
    SFDC_OBJECT_CANNOT_BE_UPDATED: errorType.PROPERTY_EDITOR_ERROR,
    OBJECT_CANNOT_BE_UPDATED: errorType.PROPERTY_EDITOR_ERROR,
    SFDC_OBJECT_CANNOT_BE_DELETED: errorType.PROPERTY_EDITOR_ERROR,
    OBJECT_CANNOT_BE_DELETED: errorType.PROPERTY_EDITOR_ERROR,
    SFDC_OBJECT_CANNOT_BE_QUERIED: errorType.PROPERTY_EDITOR_ERROR,
    OBJECT_CANNOT_BE_QUERIED: errorType.PROPERTY_EDITOR_ERROR,
    NO_FILTERS_IN_RECORD_UPDATE: errorType.PROPERTY_EDITOR_ERROR,
    RECORDUPDATE_MISSING_FILTERS: errorType.PROPERTY_EDITOR_ERROR,
    NO_FILTERS_IN_RECORD_DELETE: errorType.NO_API_NAME_ERROR,
    SFDC_FIELD_DOES_NOT_EXIST: errorType.NO_API_NAME_ERROR,
    FIELD_NOT_FOUND: errorType.NO_API_NAME_ERROR,
    RECORD_FILTER_INVALID_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    RECORDFILTER_INVALID_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    RECORD_FILTER_NO_DATA_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    RECORDFILTER_MISSING_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    RECORD_FILTER_INVALID_DATA_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    RECORDFILTER_INVALID_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    RECORD_FILTER_NON_PRIMITIVE: errorType.START_ELEMENT_ERROR,
    RECORDFILTER_NON_PRIMITIVE: errorType.START_ELEMENT_ERROR,
    TRIGGERED_FLOW_REDUNDANT_QUERY: errorType.PROPERTY_EDITOR_ERROR,
    FIELD_ASSIGNMENT_BAD_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    FIELDASSIGNMENT_INVALID_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    FIELD_ASSIGNMENT_INVALID_DATA_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    FIELDASSIGNMENT_INVALID_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    SORT_FIELD_NOT_SORTABLE: errorType.RESOURCE_ERROR,
    SORT_FIELD_NOT_SUPPORTED: errorType.RESOURCE_ERROR,
    LIMIT_IS_INVALID: errorType.RESOURCE_ERROR,
    SORT_LIMIT_INVALID: errorType.RESOURCE_ERROR,
    ASSIGNMENT_INVALID_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    ASSIGNMENTITEM_INVALID_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    ASSIGNMENT_INVALID_MERGEFIELD: errorType.PROPERTY_EDITOR_ERROR,
    ASSIGNMENTITEM_INVALID_MERGE_FIELD: errorType.PROPERTY_EDITOR_ERROR,
    ASSIGNMENT_NO_DATA_TYPE: errorType.NO_API_NAME_ERROR,
    FEROV_INVALID_VALUE_FIELD: errorType.PROPERTY_EDITOR_ERROR,
    ASSIGNMENTITEM_FIELD_INVALID_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    FEROV_INVALID_ELEMENT_DATA_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    ASSIGNMENTITEM_INVALID_DATATYPE_IN_ELEMENT: errorType.PROPERTY_EDITOR_ERROR,
    INVALID_NODE_LABEL: errorType.PROPERTY_EDITOR_ERROR,
    ELEMENT_MISSING_LABEL: errorType.PROPERTY_EDITOR_ERROR,
    INVALID_NODE_NAME: errorType.NO_API_NAME_ERROR,
    FLOW_INVALID_NAME: errorType.NO_API_NAME_ERROR,
    SUBFLOW_RECURSIVE: errorType.NO_API_NAME_ERROR,
    SUBFLOW_DIFFERENT_RUNMODE: errorType.NO_API_NAME_ERROR,
    SUBFLOW_INPUT_INVALID_FEROV: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_INPUT_INVALID_VALUE: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_INPUT_SOBJECT_TYPE_MISMATCH: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_INPUT_MISMATCHED_OBJECTS: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_OUTPUT_SOBJECT_TYPE_MISMATCH: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_OUTPUT_MISMATCHED_OBJECTS: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_INPUT_APEX_TYPE_MISMATCH: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_INPUT_MISMATCHED_APEX_CLASS: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_OUTPUT_APEX_TYPE_MISMATCH: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_OUTPUT_MISMATCHED_APEX_CLASS: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_INPUT_COLLECTION_TYPE_MISMATCH: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_INPUT_MISMATCHED_COLLECTIONTYPES: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_OUTPUT_COLLECTION_TYPE_MISMATCH: errorType.PROPERTY_EDITOR_ERROR,
    SUBFLOW_OUTPUT_MISMATCHED_COLLECTIONTYPES: errorType.PROPERTY_EDITOR_ERROR,
    SCREEN_PAUSED_TEXT_PROVIDED_WHEN_PAUSE_NOT_ALLOWED: errorType.PROPERTY_EDITOR_ERROR,
    SCREEN_PAUSEDTEXT_NOT_SHOWN_WHEN_ALLOWPAUSE_IS_FALSE: errorType.PROPERTY_EDITOR_ERROR,
    LOCATION_FIELD_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    RECORDFILTER_GEOLOCATION_FIELDS_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    LOCATION_FIELD_SORT_BY_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    SORT_GEOLOCATION_FIELDS_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    ENCRYPTED_FIELD_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    OBJECT_ENCRYPTED_FIELDS_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    ENCRYPTED_FIELD_FILTER_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    RECORDFILTER_ENCRYPTED_FIELDS_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    ENCRYPTED_FIELD_SORT_BY_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    SORT_ENCRYPTED_FIELDS_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    VALUE_TOO_LONG: errorType.PROPERTY_EDITOR_ERROR,
    VALUE_CHAR_LIMIT_EXCEEDED: errorType.PROPERTY_EDITOR_ERROR,
    STANDARD_DEV_NAME_ERROR: errorType.PROPERTY_EDITOR_ERROR,
    ELEMENT_NAME_INVALID: errorType.PROPERTY_EDITOR_ERROR,
    MISSING_ELEMENT_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    ELEMENT_MISSING_REFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    COLLECTION_PROCESSOR_MISSING_INPUT: errorType.PROPERTY_EDITOR_ERROR,
    VALUE_NOT_ALLOWED_FOR_FIELD: errorType.PROPERTY_EDITOR_ERROR,
    FIELD_INVALID_VALUE: errorType.PROPERTY_EDITOR_ERROR,
    HEADLESS_FLOW_HAS_SCREEN: errorType.CANVAS_ERROR,
    HEADLESS_FLOW_HAS_HEADFUL_SUBFLOW: errorType.CANVAS_ERROR,
    ELEMENT_NOT_ALLOWED_FOR_PROCESS_TYPE: errorType.NO_API_NAME_ERROR,
    AUTOLAUNCHED_WAIT_NOT_SUPPORTED: errorType.NO_API_NAME_ERROR,
    WORKFLOW_FLOW_HAS_INVALID_ELEMENT: errorType.NO_API_NAME_ERROR,
    PROCESSTYPE_ELEMENT_NOT_SUPPORTED: errorType.NO_API_NAME_ERROR,
    CUSTOM_EVENT_FLOW_OBJECT_NOT_EXIST: errorType.NO_API_NAME_ERROR,
    CUSTOMEVENT_OBJECTTYPE_NOT_FOUND: errorType.NO_API_NAME_ERROR,
    CUSTOM_EVENT_FLOW_OBJECT_NOT_QUERYABLE: errorType.NO_API_NAME_ERROR,
    CUSTOMEVENT_OBJECTTYPE_NOT_SUPPORTED: errorType.NO_API_NAME_ERROR,
    ELEMENT_REQUIRES_PERM: errorType.NO_API_NAME_ERROR,
    FIELD_REQUIRES_PERM: errorType.NO_API_NAME_ERROR,
    FIELD_VALUE_REQUIRES_PERM: errorType.NO_API_NAME_ERROR,
    FLOW_CONTAINS_VISIBILITY_RULES: errorType.PROPERTY_EDITOR_ERROR,
    SCREENCOMPONENT_CONTAINS_VISIBILITY_RULE: errorType.PROPERTY_EDITOR_ERROR,
    VISIBILITY_RULE_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    VISIBILITY_RULE_NO_CONDITIONS: errorType.PROPERTY_EDITOR_ERROR,
    VISIBILITY_RULE_EXCEEDS_CONDITION_LIMIT: errorType.PROPERTY_EDITOR_ERROR,
    COLLECTION_ELEMENT_NOT_PROVIDED: errorType.PROPERTY_EDITOR_ERROR,
    LOOP_MISSING_COLLECTION: errorType.PROPERTY_EDITOR_ERROR,
    ACTION_CALL_REQUIRED_PARAM_NOT_SET: errorType.PROPERTY_EDITOR_ERROR,
    ACTIONCALL_MISSING_REQUIRED_PARAM: errorType.PROPERTY_EDITOR_ERROR,
    ACTION_CALL_INVALID_INPUT_PARAM_NAME: errorType.PROPERTY_EDITOR_ERROR,
    ACTIONCALL_INVALID_INPUT_PARAM_NAME: errorType.PROPERTY_EDITOR_ERROR,
    ACTION_CALL_DUPLICATE_INPUT_PARAM: errorType.PROPERTY_EDITOR_ERROR,
    ACTIONCALL_DUPLICATE_INPUT_PARAM: errorType.PROPERTY_EDITOR_ERROR,
    ACTION_CALL_DUPLICATE_OUTPUT_PARAM: errorType.PROPERTY_EDITOR_ERROR,
    ACTIONCALL_DUPLICATE_OUTPUT_PARAM: errorType.PROPERTY_EDITOR_ERROR,
    ACTION_CALL_NAME_MISSING: errorType.PROPERTY_EDITOR_ERROR,
    ACTIONCALL_MISSING_NAME: errorType.PROPERTY_EDITOR_ERROR,
    ACTION_CALL_TYPE_MISSING: errorType.PROPERTY_EDITOR_ERROR,
    ACTIONCALL_MISSING_REQUIRED_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    PARAMETER_DATA_TYPE_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    PARAM_DATATYPE_NOT_SUPPORTED: errorType.PROPERTY_EDITOR_ERROR,
    INPUT_PARAMETER_INVALID_DATA_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    INPUTPARAM_INCOMPATIBLE_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    INPUT_PARAMETER_INVALID_SOBJECT_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    INPUTPARAM_MISMATCHED_OBJECTTYPE: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUT_PARAMETER_ASSIGN_TO_MISSING: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUTPARAM_MISSING_ASSIGNTOREFERENCE: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUT_PARAMETER_INVALID_ASSIGN_TO: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUTPARAM_ASSIGNTOREFERENCE_NOTFOUND: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUT_PARAMETER_INVALID_DATA_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUTPARAM_INCOMPATIBLE_DATATYPE: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUT_PARAMETER_INVALID_SOBJECT_TYPE: errorType.PROPERTY_EDITOR_ERROR,
    OUTPUTPARAM_MISMATCHED_OBJECTTYPE: errorType.PROPERTY_EDITOR_ERROR,
    NON_EXPOSED_COMPONENT_IN_FLOW: errorType.CANVAS_ERROR,
    SCREEN_FIELD_TYPE_NOT_ALLOWED_FOR_PROCESS_TYPE: errorType.PARENT_CHILD_ERROR,
    PROCESSTYPE_SCREEN_FIELDTYPE_NOT_SUPPORTED: errorType.PARENT_CHILD_ERROR,
    LIGHTNING_COMPONENT_TYPE_NOT_ALLOWED_FOR_PROCESS_TYPE: errorType.PARENT_CHILD_ERROR,
    PROCESSTYPE_COMPONENTTYPE_NOT_SUPPORTED: errorType.PARENT_CHILD_ERROR,
    PROCESS_TYPE_ELEMENT_CONFIG_NOT_SUPPORTED: errorType.NO_API_NAME_ERROR,
    PROCESSTYPE_ELEMENT_CONFIG_NOT_SUPPORTED: errorType.NO_API_NAME_ERROR,
    DYNAMIC_TYPE_MAPPING_MISSING: errorType.PARENT_CHILD_ERROR,
    DUPLICATED_DYNAMIC_TYPE_MAPPING: errorType.PARENT_CHILD_ERROR,
    TYPE_MAPPING_DUPLICATED: errorType.PARENT_CHILD_ERROR,
    DYNAMIC_TYPE_IN_MAPPING_NOT_FOUND: errorType.PARENT_CHILD_ERROR,
    TYPE_MAPPING_NOT_FOUND: errorType.PARENT_CHILD_ERROR,
    INCONSISTENT_VALUE_FOR_DYNAMIC_VALUE_FIELD: errorType.PARENT_CHILD_ERROR,
    INCONSISTENT_DYNAMIC_TYPE_MAPPING: errorType.PARENT_CHILD_ERROR,
    SUBFLOW_NOT_SUPPORTED_FOR_PROCESSTYPE: errorType.CANVAS_ERROR,
    SUBFLOW_PROCESSTYPE_NOT_SUPPORTED: errorType.CANVAS_ERROR,
    FLOW_GLOBAL_VARIABLE_NOT_SUPPORTED_FOR_PROCESSTYPE: errorType.NO_API_NAME_ERROR,
    GLOBAL_VARIABLE_NOT_SUPPORTED_FOR_PROCESSTYPE: errorType.NO_API_NAME_ERROR,
    FLOW_REFERENCES_APEX_CLASS_NOT_IN_SAME_PACKAGE: errorType.PROPERTY_EDITOR_ERROR,
    FLOW_SYSTEM_VARIABLE_NOT_SUPPORTED_FOR_TRIGGERTYPE: errorType.NO_API_NAME_ERROR,
    ORG_WIDE_EMAIL_NOT_USED: errorType.NO_API_NAME_ERROR,
    ORG_WIDE_EMAIL_INVALID: errorType.NO_API_NAME_ERROR,
    CONTEXT_RECORD_ASSIGNMENT_NOT_ALLOWED_IN_VARIABLE: errorType.PROPERTY_EDITOR_ERROR,
    FLOW_CONTEXT_RECORD_ASSIGNMENT_VARIABLE_INVALID: errorType.PROPERTY_EDITOR_ERROR,
    SCREEN_FIELD_TYPE_NOT_SUPPORTED_FOR_API_VERSION: errorType.CANVAS_ERROR,
    SCREENFIELD_TYPE_NOT_SUPPORTED_FOR_API_VERSION: errorType.CANVAS_ERROR,
    NUMBER_OF_SCREEN_FIELD_REGIONS_EXCEEDS_LIMIT: errorType.PARENT_CHILD_ERROR,
    NUMBER_OF_SCREENFIELD_REGIONS_EXCEEDS_LIMIT: errorType.PARENT_CHILD_ERROR,
    SCREEN_FIELD_REGION_WIDTH_MISSING: errorType.PARENT_CHILD_ERROR,
    SCREENFIELD_REGION_REQUIRED_INPUT_PARAMETER_MISSING: errorType.PARENT_CHILD_ERROR,
    SCREEN_FIELD_REGION_WIDTH_VALUE_INVALID: errorType.PARENT_CHILD_ERROR,
    SCREENFIELD_REGION_WIDTH_VALUE_INVALID: errorType.PARENT_CHILD_ERROR,
    SCREEN_FIELD_REGION_WIDTH_DUPLICATE: errorType.PARENT_CHILD_ERROR,
    SCREENFIELD_REGION_CONTAINS_DUPLICATE_INPUT_PARAMETER_VALUES: errorType.PARENT_CHILD_ERROR,
    SCREEN_FIELD_REGION_INPUT_PARAMETER_NOT_SUPPORTED: errorType.PARENT_CHILD_ERROR,
    SCREENFIELD_REGION_INPUT_PARAMETER_NOT_SUPPORTED: errorType.PARENT_CHILD_ERROR,
    SCREEN_FIELD_REGION_WIDTH_SUM_EXCEEDS_LIMIT: errorType.PARENT_CHILD_ERROR,
    SCREENFIELD_REGION_WIDTH_SUM_EXCEEDS_LIMIT: errorType.PARENT_CHILD_ERROR,
    SCREEN_FIELD_REGION_NOT_IN_CONTAINER: errorType.PARENT_CHILD_ERROR,
    SCREENFIELD_REGION_NOT_IN_CONTAINER: errorType.PARENT_CHILD_ERROR,
    SCREEN_FIELD_TYPE_INVALID_AS_CHILD: errorType.NO_API_NAME_ERROR,
    FIELD_TYPE_NOT_SUPPORTED_AS_CHILD_OF_SCREENFIELD_REGION_OR_REGIONCONTAINER: errorType.NO_API_NAME_ERROR,
    SCREEN_FIELD_TYPE_INVALID_AS_PARENT: errorType.NO_API_NAME_ERROR,
    FIELD_TYPE_NOT_SUPPORTED_AS_PARENT: errorType.NO_API_NAME_ERROR,
    SCREEN_FIELD_REGION_REQUIRES_PERM: errorType.NO_API_NAME_ERROR,
    SCREENFIELD_REGION_MISSING_REQUIRED_PERMISSIONS: errorType.NO_API_NAME_ERROR,
    FLOW_TRIGGERING_RECORD_UPDATE_ONLY_FOR_BEFORE_SAVE: errorType.PROPERTY_EDITOR_ERROR,
    FLOW_TRIGGERING_RECORD_UPDATE_FAULT_CONNECTOR_BEFORE_SAVE: errorType.CANVAS_ERROR
};
