import { translateFlowToUIModel } from '../flow-to-ui-translator';
import { translateUIModelToFlow } from '../ui-to-flow-translator';
import { deepCopy, isPlainObject } from "builder_platform_interaction-store-lib";

// Fetchable from browser xhr
const sampleFlow = {
    "createdById": "005xx000001Sv6KAAS",
    "createdDate": "2018-01-26T16:59:43.000+0000",
    "definitionId": "300xx00000002beAAA",
    "fieldsToNull": [],
    "fullName": "screenFlow-1",
    "id": "301xx000000000BAAQ",
    "lastModifiedById": "005xx000001Sv6KAAS",
    "lastModifiedDate": "2018-01-26T16:59:51.000+0000",
    "manageableState": "unmanaged",
    "masterLabel": "screenFlow",
    "metadata": {
        "actionCalls": [],
        "apexPluginCalls": [],
        "assignments": [{
            "assignmentItems": [{
                "assignToReference": "var",
                "operator": "Assign",
                "processMetadataValues": [],
                "value": {
                    "elementReference": "var"
                }
            }],
            "connector": {
                "processMetadataValues": [],
                "targetReference": "Second_Assignment"
            },
            "label": "Assignment",
            "locationX": 482,
            "locationY": 130,
            "name": "Assignment",
            "processMetadataValues": []
        }, {
            "assignmentItems": [{
                "assignToReference": "num2",
                "operator": "Add",
                "processMetadataValues": [],
                "value": {
                    "elementReference": "num1"
                }
            }],
            "connector": {
                "processMetadataValues": [],
                "targetReference": "DecisionNode"
            },
            "label": "Second Assignment",
            "locationX": 530,
            "locationY": 254,
            "name": "Second_Assignment",
            "processMetadataValues": []
        }],
        "choices": [],
        "constants": [],
        "decisions": [{
            "defaultConnector": {
                "processMetadataValues": [],
                "targetReference": "Screen"
            },
            "defaultConnectorLabel": "DefaultOutcome",
            "label": "DecisionNode",
            "locationX": 272,
            "locationY": 265,
            "name": "DecisionNode",
            "processMetadataValues": [],
            "rules": [{
                "conditionLogic": "and",
                "conditions": [{
                    "leftValueReference": "num1",
                    "operator": "EqualTo",
                    "processMetadataValues": [],
                    "rightValue": {
                        "elementReference": "num2"
                    }
                }],
                "connector": {
                    "processMetadataValues": [],
                    "targetReference": "Assignment"
                },
                "label": "Outcome1",
                "name": "Outcome1",
                "processMetadataValues": []
            }]
        }],
        "dynamicChoiceSets": [],
        "formulas": [],
        "interviewLabel": "screenFlow {!$Flow.CurrentDateTime}",
        "label": "screenFlow",
        "loops": [],
        "processMetadataValues": [],
        "processType": "Flow",
        "recordCreates": [],
        "recordDeletes": [],
        "recordLookups": [],
        "recordUpdates": [],
        "screens": [{
            "allowBack": true,
            "allowFinish": true,
            "allowPause": true,
            "connector": {
                "processMetadataValues": [],
                "targetReference": "Assignment"
            },
            "fields": [],
            "label": "Screen",
            "locationX": 276,
            "locationY": 130,
            "name": "Screen",
            "processMetadataValues": [],
            "rules": [],
            "showFooter": true,
            "showHeader": true
        }],
        "stages": [],
        "startElementReference": "Screen",
        "steps": [],
        "subflows": [],
        "textTemplates": [],
        "variables": [{
            "dataType": "Number",
            "isCollection": false,
            "isInput": false,
            "isOutput": false,
            "name": "num1",
            "processMetadataValues": [],
            "scale": 2
        }, {
            "dataType": "Number",
            "isCollection": false,
            "isInput": false,
            "isOutput": false,
            "name": "num2",
            "processMetadataValues": [],
            "scale": 2,
            "value": {
                "numberValue": 5.0
            }
        }, {
            "dataType": "String",
            "isCollection": false,
            "isInput": false,
            "isOutput": false,
            "name": "var",
            "processMetadataValues": [],
            "scale": 0
        }],
        "waits": []
    },
    "processType": "Flow",
    "status": "Draft",
    "versionNumber": 1
};

// Server side sends down more fields than we expect/need
// this list should be trimmed down
const EXTRA_FIELDS = ["createdById",
    "createdDate",
    "definitionId",
    "fieldsToNull",
    "id",
    "lastModifiedById",
    "lastModifiedDate",
    "manageableState",
    "masterLabel",
    "processType",
    "status",
    "versionNumber",
];

// Only a small subset of elements are enabled right now
// this list should be trimmed down and eventually removed
const FUTURE_ELEMENTS = ["apexPluginCalls",
    "screens",
    "choices",
    "constants",
    "dynamicChoiceSets",
    "formulas",
    "loops",
    "processMetadataValues",
    "recordCreates",
    "recordDeletes",
    "recordLookups",
    "recordUpdates",
    "stages",
    "startElementReference",
    "steps",
    "subflows",
    "textTemplates",
    "waits"];


// The database/server provide many fields that aren't yet used/supported by the client
// in order to get a clean comparison of before and after it's best to strip out this extra
// data
//
// The field processMetadataValues appears throughout the metadats but is only used by
// process builder ( any possibly other builders )
const cleanData = (object) => {
    if (Array.isArray(object)) {
        object.forEach(element => {
            cleanData(element);
        });
    } else if (isPlainObject(object)) {
        Object.keys(object).forEach(objectKey => {
            const value = object[objectKey];
            if (objectKey === 'processMetadataValues') {
                delete object[objectKey];
            }
            cleanData(value);
        });
    }
};


// The database/server provide many fields that aren't yet used/supported by the client
// in order to get a clean comparison of before and after it's best to strip out this extra
// data
//
// Since the translator also modifies the data without creating a copy we need to create a
// deep copy of the data in order to reuse it and compare it reliably
const cleanFlowSample = function () {
    const flow = deepCopy(sampleFlow);
    cleanData(flow);

    EXTRA_FIELDS.forEach(field => {
        delete flow[field];
    });
    FUTURE_ELEMENTS.forEach(key => {
        delete flow.metadata[key];
    });

    return flow;
};

describe('Flow Translator', () => {
    it('Converts Losslessly', () => {
        const uiFlow = translateFlowToUIModel(cleanFlowSample());
        const flow = translateUIModelToFlow(uiFlow);
        expect(flow).toEqual(cleanFlowSample());
    });
});
