// @ts-nocheck
import {
    CONDITION_LOGIC,
    CONNECTOR_TYPE,
    ELEMENT_TYPE,
    WAIT_TIME_EVENT_PARAMETER_NAMES
} from 'builder_platform_interaction/flowMetadata';
import { Store } from 'builder_platform_interaction/storeLib';
import { getElementByGuid } from 'builder_platform_interaction/storeUtils';
import { baseCanvasElementWithFault, baseChildElement, createCondition } from '../base/baseElement';
import {
    baseCanvasElementMetadataObject,
    baseChildElementMetadataObject,
    createConditionMetadataObject
} from '../base/baseMetadata';
import {
    addRegularConnectorToAvailableConnections,
    getConnectionProperties
} from '../commonFactoryUtils/connectionPropertiesUtils';
import { LABELS } from '../elementFactoryLabels';
import { createInputParameter, createInputParameterMetadataObject } from '../inputParameter';
import { createOutputParameter, createOutputParameterMetadataObject } from '../outputParameter';
import {
    createDuplicateWait,
    createWaitEvent,
    createWaitMetadataObject,
    createWaitWithWaitEventReferences,
    createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor,
    createWaitWithWaitEvents,
    getParametersPropertyName,
    isWaitTimeEventType
} from '../wait';

const newWaitGuid = 'newWait';
const existingWaitGuid = 'existingWait';
const existingWait = {
    guid: existingWaitGuid,
    childReferences: [{ childReference: 'existingWaitEvent1' }, { childReference: 'existingWaitEvent2' }]
};
const waitWithChildrenGuid = 'newWaitWithChildren';
const existingWaitWithChildrenGuid = 'existingWaitWithChildren';
const existingWaitWithChildren = {
    guid: existingWaitWithChildrenGuid,
    childReferences: [{ childReference: 'existingWaitEvent1' }, { childReference: 'existingWaitEvent2' }],
    children: ['screen1', 'screen2', null]
};

const existingWaitEventGuid = 'existingWaitEvent';
const existingWaitEvent = {
    guid: existingWaitEventGuid,
    inputParameters: [{ a: 1 }, { b: 2 }],
    outputParameters: {
        p1: { a: 1, name: 'p1' },
        p2: { b: 2, name: 'p2' }
    }
};
const emptyParameterValueWaitEventGuid = 'emptyParameterValueWaitEvent';
const emptyParameterValueWaitEvent = {
    guid: emptyParameterValueWaitEventGuid,
    inputParameters: [
        { name: 'p1', value: 1 },
        { name: 'p2', value: null },
        { name: 'p3', value: '' }
    ],
    outputParameters: {
        p1: { name: 'p1', value: 1 },
        p2: { name: 'p2', value: '' },
        p3: { name: 'p3' },
        p4: { name: 'p4', value: 0 }
    }
};
const existingWaitWithAllTerminatedChildrenGuid = 'existingWaitWithAllTerminatedChildrenGuid';
const existingWaitWithAllTerminatedChildren = {
    guid: existingWaitWithAllTerminatedChildrenGuid,
    childReferences: [{ childReference: 'waitEvent1' }],
    children: ['end1', 'end2']
};
const existingWaitWithNoneTerminatedChildrenGuid = 'existingDecisionWithNoneTerminatedChildrenGuid';
const existingWaitWithNoneTerminatedChildren = {
    guid: existingWaitWithNoneTerminatedChildrenGuid,
    childReferences: [{ childReference: 'waitEvent1' }],
    children: ['end3', 'end4']
};
const waitWithMergingBranchesGuid = 'waitWithMergingBranchesGuid';
const waitWithMergingBranches = {
    guid: waitWithMergingBranchesGuid,
    childReferences: [
        { childReference: 'waitEvent1' },
        { childReference: 'waitEvent2' },
        { childReference: 'waitEvent3' }
    ],
    children: ['end1', null, null, 'end2']
};
const nestedWaitWithMergingBranchesGuid = 'nestedWaitWithMergingBranchesGuid';
const waitWithElementsOnMergingBranchesGuid = 'decisionWithElementsOnMergingBranchesGuid';
const waitWithElementsOnMergingBranches = {
    guid: waitWithElementsOnMergingBranchesGuid,
    childReferences: [
        { childReference: 'waitEvent1' },
        { childReference: 'waitEvent2' },
        { childReference: 'waitEvent3' }
    ],
    children: ['end1', 'assignment1', null, 'end2']
};

const end1 = {
    guid: 'end1',
    isTerminal: true
};
const end2 = {
    guid: 'end2',
    isTerminal: true
};
const end3 = {
    guid: 'end3',
    isTerminal: false
};
const end4 = {
    guid: 'end4',
    isTerminal: false
};
// const mergingEnd1 = {
//     guid: 'mergingEnd1',
//     prev: waitWithMergingBranchesGuid
// };
// const mergingEnd2 = {
//     guid: 'mergingEnd2',
//     prev: nestedWaitWithMergingBranchesGuid
// };

jest.mock('builder_platform_interaction/storeLib', () => require('builder_platform_interaction_mocks/storeLib'));

jest.mock('builder_platform_interaction/storeUtils', () => {
    return {
        getElementByGuid: jest.fn(),
        getProcessType: jest.fn()
    };
});

getElementByGuid.mockImplementation((guid) => {
    if (guid === newWaitGuid || guid === waitWithChildrenGuid) {
        return null;
    } else if (guid === existingWaitGuid) {
        return existingWait;
    } else if (guid === existingWaitEventGuid) {
        return existingWaitEvent;
    } else if (guid === emptyParameterValueWaitEventGuid) {
        return emptyParameterValueWaitEvent;
    } else if (guid === existingWaitWithChildrenGuid) {
        return existingWaitWithChildren;
    } else if (guid === existingWaitWithAllTerminatedChildrenGuid) {
        return existingWaitWithAllTerminatedChildren;
    } else if (guid === existingWaitWithNoneTerminatedChildrenGuid) {
        return existingWaitWithNoneTerminatedChildren;
    } else if (guid === waitWithMergingBranchesGuid || guid === nestedWaitWithMergingBranchesGuid) {
        return waitWithMergingBranches;
    } else if (guid === waitWithElementsOnMergingBranchesGuid) {
        return waitWithElementsOnMergingBranches;
    } else if (guid === 'end1') {
        return end1;
    } else if (guid === 'end2') {
        return end2;
    } else if (guid === 'end3') {
        return end3;
    } else if (guid === 'end4') {
        return end4;
    } else if (guid === null) {
        return undefined;
    }

    return {
        guid
    };
});

jest.mock('../base/baseElement', () => {
    return {
        baseCanvasElementWithFault: jest
            .fn((element) => {
                return Object.assign({}, element);
            })
            .mockName('baseCanvasElementMock'),
        duplicateCanvasElementWithChildElements: jest
            .fn(() => {
                const duplicatedElement = {};
                const duplicatedChildElements = {
                    duplicatedWaitEventGuid: {
                        guid: 'duplicatedWaitEventGuid',
                        name: 'duplicatedWaitEventName'
                    }
                };
                const updatedChildReferences = [
                    {
                        childReference: 'duplicatedWaitEventGuid'
                    }
                ];
                const availableConnections = [
                    {
                        type: 'REGULAR',
                        childReference: 'duplicatedWaitEventGuid'
                    },
                    {
                        type: 'DEFAULT'
                    },
                    {
                        type: 'FAULT'
                    }
                ];

                return {
                    duplicatedElement,
                    duplicatedChildElements,
                    updatedChildReferences,
                    availableConnections
                };
            })
            .mockName('duplicateCanvasElementWithChildElementsMock'),
        baseChildElement: jest
            .fn((waitEvent) => {
                return Object.assign({}, waitEvent);
            })
            .mockName('baseChildElementMock'),
        baseCanvasElementsArrayToMap: jest.requireActual('../base/baseElement').baseCanvasElementsArrayToMap,

        createCondition: jest
            .fn()
            .mockImplementation((element) => Object.assign({}, element))
            .mockName('createCondition'),
        getDeletedCanvasElementChildren: jest.requireActual('../base/baseElement').getDeletedCanvasElementChildren,
        updateChildReferences: jest.fn().mockImplementation((childReferences, waitEvent) => {
            return [
                ...childReferences,
                {
                    childReference: waitEvent.guid
                }
            ];
        })
    };
});

jest.mock('../base/baseMetadata');
baseCanvasElementMetadataObject.mockImplementation((element) => {
    return Object.assign({}, element);
});
baseChildElementMetadataObject.mockImplementation((element) => {
    return Object.assign({}, element);
});
createConditionMetadataObject.mockImplementation((element) => Object.assign({}, element));

jest.mock('../inputParameter', () => {
    return {
        createInputParameter: jest
            .fn()
            .mockImplementation((element) => Object.assign({}, element))
            .mockName('createInputParameter'),
        createInputParameterMetadataObject: jest
            .fn()
            .mockImplementation((element) => Object.assign({}, element))
            .mockName('createInputParameterMetadataObject')
    };
});

jest.mock('../outputParameter', () => {
    return {
        createOutputParameter: jest
            .fn()
            .mockImplementation((element) => Object.assign({}, element))
            .mockName('createOutputParameter'),
        createOutputParameterMetadataObject: jest
            .fn()
            .mockImplementation((element) => Object.assign({}, element))
            .mockName('createOutputParameterMetadataObject')
    };
});

jest.mock('../commonFactoryUtils/connectionPropertiesUtils');
getConnectionProperties.mockImplementation((originalWait) => {
    if (originalWait.hasOwnProperty('availableConnections')) {
        return {
            connectorCount: 1,
            availableConnections: [
                {
                    type: CONNECTOR_TYPE.DEFAULT
                }
            ],
            addFaultConnectionForWaitElement: false
        };
    }

    return {
        connectorCount: 1,
        availableConnections: [
            {
                type: CONNECTOR_TYPE.DEFAULT
            }
        ],
        addFaultConnectionForWaitElement: true
    };
});
addRegularConnectorToAvailableConnections.mockImplementation((availableConnections, waitEvent) => {
    return [
        ...availableConnections,
        {
            type: 'REGULAR',
            childReference: waitEvent.name
        }
    ];
});

describe('wait', () => {
    describe('createWaitWithWaitEvents', () => {
        it('with no parameter calls baseCanvasElement with an empty object', () => {
            createWaitWithWaitEvents();
            expect(baseCanvasElementWithFault.mock.calls[0][0]).toEqual({});
        });

        it('element type is WAIT', () => {
            const wait = createWaitWithWaitEvents();

            expect(wait.elementType).toEqual(ELEMENT_TYPE.WAIT);
        });

        describe('wait events', () => {
            it('includes a single default wait event if no wait event references present', () => {
                const waitEvent = {
                    foo: 'bar'
                };
                baseChildElement.mockReturnValueOnce(waitEvent);
                const wait = createWaitWithWaitEvents();

                expect(wait.waitEvents).toHaveLength(1);
                expect(wait.waitEvents[0]).toEqual(waitEvent);
            });

            it('includes wait event for all wait event references present', () => {
                const childReferences = [{ childReference: 'a' }, { childReference: 'b' }, { childReference: 'c' }];

                const wait = createWaitWithWaitEvents({
                    childReferences
                });

                expect(wait.waitEvents).toHaveLength(3);
                expect(wait.waitEvents[0].guid).toEqual(childReferences[0].childReference);
                expect(wait.waitEvents[1].guid).toEqual(childReferences[1].childReference);
                expect(wait.waitEvents[2].guid).toEqual(childReferences[2].childReference);
            });
        });

        describe('wait connections', () => {
            const newWait = createWaitWithWaitEvents();
            it('have a maximum of 2 default connections when no wait events are present', () => {
                expect(newWait.maxConnections).toEqual(2);
            });
        });
    });

    describe('createDuplicateWait function', () => {
        const { duplicatedElement, duplicatedChildElements } = createDuplicateWait(
            {},
            'duplicatedGuid',
            'duplicatedName',
            {},
            {}
        );

        it('duplicatedElement has updated childReferences', () => {
            expect(duplicatedElement.childReferences).toEqual([
                {
                    childReference: 'duplicatedWaitEventGuid'
                }
            ]);
        });
        it('duplicatedElement has updated availableConnections', () => {
            expect(duplicatedElement.availableConnections).toEqual([
                {
                    type: CONNECTOR_TYPE.REGULAR,
                    childReference: 'duplicatedWaitEventGuid'
                },
                {
                    type: CONNECTOR_TYPE.DEFAULT
                },
                {
                    type: CONNECTOR_TYPE.FAULT
                }
            ]);
        });
        it('duplicatedElement has updated defaultConnectorLabel', () => {
            expect(duplicatedElement.defaultConnectorLabel).toEqual(LABELS.emptyDefaultWaitPathLabel);
        });
        it('returns correct duplicatedChildElements', () => {
            expect(duplicatedChildElements).toEqual({
                duplicatedWaitEventGuid: {
                    guid: 'duplicatedWaitEventGuid',
                    name: 'duplicatedWaitEventName'
                }
            });
        });
    });

    describe('createWaitEvent', () => {
        const defaultWaitEvent = {
            conditionLogic: CONDITION_LOGIC.NO_CONDITIONS
        };

        it('calls baseChildElement with elementType = WAIT_EVENT', () => {
            createWaitEvent();
            expect(baseChildElement.mock.calls[0][1]).toEqual(ELEMENT_TYPE.WAIT_EVENT);
        });

        it('has NO_CONDITIONS as the default condition logic', () => {
            const waitEvent = createWaitEvent();
            expect(waitEvent.conditionLogic).toEqual(defaultWaitEvent.conditionLogic);
        });

        it('uses existing values when passed in a waitEvent object', () => {
            const mockCondition1 = { operator: 'foo' };
            const mockCondition2 = { operator: 'bar' };
            const mockWaitEvent = {
                conditionLogic: CONDITION_LOGIC.OR,
                conditions: [mockCondition1, mockCondition2],
                dataType: 'sfdc'
            };
            createWaitEvent(mockWaitEvent);
            expect(baseChildElement.mock.calls[0][0]).toEqual(mockWaitEvent);
        });

        it('calls createCondition for every condition given if condition logic is not NO_CONDITIONS', () => {
            const mockCondition = { operator: 'foo' };
            const mockWaitEvent = {
                conditionLogic: CONDITION_LOGIC.AND,
                conditions: [mockCondition]
            };
            const waitEvent = createWaitEvent(mockWaitEvent);
            expect(waitEvent.conditions).toHaveLength(1);
            expect(waitEvent.conditions[0]).toEqual(mockCondition);
            expect(waitEvent.conditions[0]).toBe(createCondition.mock.results[0].value);
            expect(createCondition).toHaveBeenCalledTimes(1);
            expect(createCondition).toHaveBeenCalledWith(mockCondition);
        });

        it('does not call createCondition with existing conditions when condition logic is NO_CONDITIONS', () => {
            const mockCondition = { operator: 'foo' };
            const mockWaitEvent = {
                conditionLogic: CONDITION_LOGIC.NO_CONDITIONS,
                conditions: [mockCondition]
            };
            createWaitEvent(mockWaitEvent);
            expect(createCondition).not.toHaveBeenCalled();
        });

        it('sets the condition logic to NO_CONDITIONS when given no conditions and creates one empty condition', () => {
            const waitEvent = createWaitEvent({
                conditionLogic: CONDITION_LOGIC.AND
            });
            expect(waitEvent.conditions).toHaveLength(0);
            expect(waitEvent.conditionLogic).toEqual(CONDITION_LOGIC.NO_CONDITIONS);
        });

        it('sets the output parameters with additional parameters needed for absolute time event', () => {
            const mockWaitEvent = {
                eventType: 'AlarmEvent',
                outputParameters: [
                    {
                        name: WAIT_TIME_EVENT_PARAMETER_NAMES.RESUME_TIME,
                        value: 'test'
                    }
                ]
            };
            const expectedAdditionalOutputParams = [{ name: WAIT_TIME_EVENT_PARAMETER_NAMES.EVENT_DELIVERY_STATUS }];
            const waitEvent = createWaitEvent(mockWaitEvent);

            expect(createOutputParameter.mock.calls[0][0]).toEqual(mockWaitEvent.outputParameters[0]);
            expect(createOutputParameter.mock.calls[1][0]).toEqual(expectedAdditionalOutputParams[0]);

            expect(Object.keys(waitEvent.outputParameters)).toHaveLength(2);
            expect(waitEvent.outputParameters[WAIT_TIME_EVENT_PARAMETER_NAMES.RESUME_TIME]).toEqual(
                createOutputParameter.mock.results[0].value
            );
            expect(waitEvent.outputParameters[WAIT_TIME_EVENT_PARAMETER_NAMES.EVENT_DELIVERY_STATUS]).toEqual(
                createOutputParameter.mock.results[1].value
            );
        });

        it('sets the input parameters with additional parameters needed for direct record type event', () => {
            const mockWaitEvent = {
                eventType: 'DateRefAlarmEvent',
                inputParameters: [
                    {
                        name: WAIT_TIME_EVENT_PARAMETER_NAMES.SALESFORCE_OBJECT,
                        value: 'Account'
                    },
                    {
                        name: WAIT_TIME_EVENT_PARAMETER_NAMES.DIRECT_RECORD_BASE_TIME,
                        value: 'CreatedDate'
                    }
                ]
            };
            const expectedAdditionalInputParameters = [
                { name: WAIT_TIME_EVENT_PARAMETER_NAMES.RECORD_ID },
                { name: WAIT_TIME_EVENT_PARAMETER_NAMES.OFFSET_NUMBER },
                { name: WAIT_TIME_EVENT_PARAMETER_NAMES.OFFSET_UNIT }
            ];

            const waitEvent = createWaitEvent(mockWaitEvent);

            let index = 0;
            [...mockWaitEvent.inputParameters, ...expectedAdditionalInputParameters].forEach((inputParameter) => {
                expect(createInputParameter.mock.calls[index++][0]).toEqual(inputParameter);
            });

            expect(waitEvent.inputParameters).toHaveLength(5);
            index = 0;
            waitEvent.inputParameters.forEach((inputParameter) => {
                expect(inputParameter).toEqual(createInputParameter.mock.results[index++].value);
            });
        });

        it('sets the input and output parameters for a platform event type', () => {
            const platformEventName = 'PlatformEvent1__e';
            const mockWaitEvent = {
                eventType: platformEventName,
                inputParameters: [{ a: 1 }, { b: 2 }]
            };
            const waitEvent = createWaitEvent(mockWaitEvent);

            expect(createInputParameter.mock.calls[0][0]).toEqual(mockWaitEvent.inputParameters[0]);
            expect(createInputParameter.mock.calls[1][0]).toEqual(mockWaitEvent.inputParameters[1]);

            expect(waitEvent.inputParameters).toHaveLength(2);
            expect(waitEvent.inputParameters[0]).toEqual(createInputParameter.mock.results[0].value);
            expect(waitEvent.inputParameters[1]).toEqual(createInputParameter.mock.results[1].value);

            expect(createOutputParameter.mock.calls[0][0]).toEqual({
                name: platformEventName
            });
            expect(Object.keys(waitEvent.outputParameters)).toHaveLength(1);
            expect(waitEvent.outputParameters[platformEventName]).toEqual(createOutputParameter.mock.results[0].value);
        });
    });

    describe('createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor', () => {
        //     const waitEvent1 = {
        //         guid: 'waitEvent1',
        //         name: 'waitEvent1'
        //     };

        //     const waitEvent2 = {
        //         guid: 'waitEvent2',
        //         name: 'waitEvent2'
        //     };

        //     const waitEvent3 = {
        //         guid: 'waitEvent3',
        //         name: 'waitEvent3'
        //     };

        //     const wait1 = {
        //         guid: 'existingWaitWithAllTerminatedChildrenGuid',
        //         name: 'wait1',
        //         elementType: ELEMENT_TYPE.WAIT,
        //         childReferences: [
        //             {
        //                 childReference: 'waitEvent1'
        //             },
        //             {
        //                 childReference: 'waitEvent2'
        //             }
        //         ]
        //         // ,
        //         // next: null,
        //         // children: ['end1', 'end2'],
        //         // fault: null
        //     };

        //     const wait2 = {
        //         guid: 'existingWaitWithNoneTerminatedChildrenGuid',
        //         name: 'wait1',
        //         elementType: ELEMENT_TYPE.WAIT,
        //         childReferences: [
        //             {
        //                 childReference: 'waitEvent1'
        //             },
        //             {
        //                 childReference: 'waitEvent2'
        //             }
        //         ]
        //         // ,
        //         // next: null,
        //         // children: ['end3', 'end4'],
        //         // fault: null
        //     };

        //     const mockStoreData = {
        //         wait1,
        //         wait2,
        //         waitEvent1,
        //         waitEvent2,
        //         waitEvent3,
        //         end1,
        //         end2,
        //         end3,
        //         end4
        //     };

        //     beforeAll(() => {
        //         Store.setMockState({
        //             elements: mockStoreData
        //         });
        //     });
        //     afterAll(() => {
        //         Store.resetStore();
        //     });

        let waitFromPropertyEditor;
        //     let waitFromPropertyEditorWithChildren;

        //     let existingWaitFromPropertyEditorWithAllTerminatedChildren;
        //     let existingWaitFromPropertyEditorWithThreeWaitEvents;
        //     let existingWaitFromPropertyEditorWithNoneTerminatedChildren;

        beforeEach(() => {
            //         shouldUseAlc(false);

            waitFromPropertyEditor = {
                guid: newWaitGuid,
                waitEvents: [
                    {
                        guid: 'waitEvent1'
                    }
                ]
            };

            //         waitFromPropertyEditorWithChildren = {
            //             guid: waitWithChildrenGuid,
            //             waitEvents: [
            //                 {
            //                     guid: 'waitEvent1'
            //                 }
            //             ],
            //             children: null
            //         };

            //         // existingWaitFromPropertyEditorWithChildren = {
            //         //     guid: existingWaitWithChildrenGuid,
            //         //     waitEvents: [
            //         //         {
            //         //             guid: 'existingWaitEvent1'
            //         //         }
            //         //     ],
            //         //     children: ['screen1', 'screen2', null]
            //         // };

            //         existingWaitFromPropertyEditorWithAllTerminatedChildren = {
            //             guid: existingWaitWithAllTerminatedChildrenGuid,
            //             waitEvents: [
            //                 {
            //                     guid: 'waitEvent1'
            //                 },
            //                 {
            //                     guid: 'waitEvent2'
            //                 }
            //             ],
            //             children: ['end1', 'end2']
            //         };

            //         existingWaitFromPropertyEditorWithNoneTerminatedChildren = {
            //             guid: existingWaitWithNoneTerminatedChildrenGuid,
            //             waitEvents: [
            //                 {
            //                     guid: 'waitEvent1'
            //                 },
            //                 {
            //                     guid: 'waitEvent2'
            //                 }
            //             ],
            //             children: ['end3', 'end4']
            //         };

            //         existingWaitFromPropertyEditorWithThreeWaitEvents = {
            //             guid: existingWaitWithAllTerminatedChildrenGuid,
            //             waitEvents: [
            //                 {
            //                     guid: 'waitEvent1'
            //                 },
            //                 {
            //                     guid: 'waitEvent2'
            //                 },
            //                 {
            //                     guid: 'waitEvent3'
            //                 }
            //             ],
            //             children: ['end1', 'end2']
            //         };
        });

        it('element type is WAIT_WITH_MODIFIED_AND_DELETED_WAIT_EVENTS', () => {
            const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);

            expect(result.elementType).toEqual(ELEMENT_TYPE.WAIT_WITH_MODIFIED_AND_DELETED_WAIT_EVENTS);
        });

        it('wait element type is WAIT', () => {
            const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);

            expect(result.canvasElement.elementType).toEqual(ELEMENT_TYPE.WAIT);
        });

        describe('defaultConnectorLabel', () => {
            it('is used if passed in', () => {
                const defaultConnectorLabel = 'some label';

                waitFromPropertyEditor.defaultConnectorLabel = defaultConnectorLabel;
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);

                expect(result.canvasElement.defaultConnectorLabel).toEqual(defaultConnectorLabel);
            });
        });

        describe('connection properties of a decision', () => {
            it('wait does not include FAULT in availableConnections when addFaultConnectionForWaitElement is falsy', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.canvasElement.availableConnections).toHaveLength(1);
                expect(result.canvasElement.availableConnections[0]).toEqual({
                    type: CONNECTOR_TYPE.DEFAULT
                });
            });

            it('wait has the right connectorCount when addFaultConnectionForWaitElement is falsy', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.canvasElement.connectorCount).toEqual(2);
            });

            it('wait includes FAULT in availableConnections when addFaultConnectionForWaitElement is truthy', () => {
                waitFromPropertyEditor.guid = existingWaitGuid;
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.canvasElement.availableConnections).toHaveLength(2);
                expect(result.canvasElement.availableConnections[0]).toEqual({
                    type: CONNECTOR_TYPE.DEFAULT
                });
                expect(result.canvasElement.availableConnections[1]).toEqual({
                    type: CONNECTOR_TYPE.FAULT
                });
            });

            it('wait has the right connectorCount when addFaultConnectionForWaitElement is truthy', () => {
                waitFromPropertyEditor.guid = existingWaitGuid;
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.canvasElement.connectorCount).toEqual(1);
            });

            it('wait has the right maxConnections', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.canvasElement.maxConnections).toEqual(3);
            });
        });

        describe('new/modified waitEvents', () => {
            let waitEvents;

            beforeEach(() => {
                waitEvents = [{ guid: 'a' }, { guid: 'b' }, { guid: 'c' }];

                waitFromPropertyEditor.waitEvents = waitEvents;
            });

            it('wait includes waitEvent references for all waitEvents present', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);

                expect(result.canvasElement.childReferences).toHaveLength(3);
                expect(result.canvasElement.childReferences[0].childReference).toEqual(waitEvents[0].guid);
                expect(result.canvasElement.childReferences[1].childReference).toEqual(waitEvents[1].guid);
                expect(result.canvasElement.childReferences[2].childReference).toEqual(waitEvents[2].guid);
            });

            it('includes waitEvents for all waitEvents present', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);

                expect(result.childElements).toHaveLength(3);
                expect(result.childElements[0].guid).toEqual(waitEvents[0].guid);
                expect(result.childElements[1].guid).toEqual(waitEvents[1].guid);
                expect(result.childElements[2].guid).toEqual(waitEvents[2].guid);
            });

            it('has the right maxConnections', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);

                expect(result.canvasElement.maxConnections).toEqual(5);
            });
        });

        describe('deleted waitEvents', () => {
            const screen1 = {
                guid: 'screen1',
                name: 'screen1',
                elementType: ELEMENT_TYPE.SCREEN,
                prev: null,
                next: null,
                parent: 'existingWaitWithChildrenGuid',
                childIndex: 0,
                isTerminal: false
            };
            const screen2 = {
                guid: 'screen2',
                name: 'screen2',
                elementType: ELEMENT_TYPE.SCREEN,
                prev: null,
                next: null,
                parent: 'existingWaitWithChildrenGuid',
                childIndex: 1,
                isTerminal: true
            };
            const mockStoreState = {
                screen1,
                screen2
            };
            beforeAll(() => {
                Store.setMockState({
                    elements: mockStoreState
                });
            });
            afterAll(() => {
                Store.resetStore();
            });
            beforeEach(() => {
                waitFromPropertyEditor = {
                    guid: existingWaitGuid,
                    supportsBranching: true,
                    waitEvents: [
                        {
                            guid: 'waitEvent1'
                        }
                    ]
                };
            });
            it('wait does not include waitEvent references for deleted waitEvents', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.canvasElement.childReferences).toHaveLength(1);
                expect(result.canvasElement.childReferences[0].childReference).toEqual(
                    waitFromPropertyEditor.waitEvents[0].guid
                );
            });
            it('includes all deleted waitEvents', () => {
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.deletedChildElementGuids).toHaveLength(2);
                expect(result.deletedChildElementGuids[0]).toEqual(existingWait.childReferences[0].childReference);
                expect(result.deletedChildElementGuids[1]).toEqual(existingWait.childReferences[1].childReference);
            });
            it('has the right maxConnections when branching is not supported', () => {
                waitFromPropertyEditor.supportsBranching = false;
                const result = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(waitFromPropertyEditor);
                expect(result.canvasElement.maxConnections).toEqual(2);
            });
        });
    });

    describe('createWaitWithWaitEventReferences', () => {
        let waitFromFlow;

        beforeEach(() => {
            waitFromFlow = {
                guid: existingWaitGuid,
                waitEvents: [
                    {
                        name: 'waitEvent1',
                        guid: 'waitEvent1'
                    },
                    {
                        name: 'waitEvent2',
                        guid: 'waitEvent2'
                    },
                    {
                        name: 'waitEvent3',
                        guid: 'waitEvent3'
                    }
                ]
            };
        });

        it('includes the return value of a call to baseCanvasElement', () => {
            createWaitWithWaitEventReferences(waitFromFlow);

            expect(baseCanvasElementWithFault).toHaveBeenCalledWith(waitFromFlow);
        });

        it('element type is WAIT', () => {
            const result = createWaitWithWaitEventReferences(waitFromFlow);

            const wait = result.elements[existingWaitGuid];
            expect(wait.elementType).toEqual(ELEMENT_TYPE.WAIT);
        });

        describe('defaultConnectorLabel', () => {
            it('defaults to LABELS.emptyDefaultWaitPathLabel', () => {
                const result = createWaitWithWaitEventReferences(waitFromFlow);
                const wait = result.elements[existingWaitGuid];

                expect(wait.defaultConnectorLabel).toEqual(LABELS.emptyDefaultWaitPathLabel);
            });
            it('is used if passed in', () => {
                const defaultConnectorLabel = 'some label';

                waitFromFlow.defaultConnectorLabel = defaultConnectorLabel;

                const result = createWaitWithWaitEventReferences(waitFromFlow);
                const wait = result.elements[existingWaitGuid];

                expect(wait.defaultConnectorLabel).toEqual(defaultConnectorLabel);
            });
        });
        describe('waitEvents', () => {
            it('wait includes waitEvents for all waitEvents present', () => {
                const result = createWaitWithWaitEventReferences(waitFromFlow);
                const wait = result.elements[existingWaitGuid];

                expect(wait.childReferences).toHaveLength(3);
                expect(wait.childReferences[0].childReference).toEqual(waitFromFlow.waitEvents[0].guid);
                expect(wait.childReferences[1].childReference).toEqual(waitFromFlow.waitEvents[1].guid);
                expect(wait.childReferences[2].childReference).toEqual(waitFromFlow.waitEvents[2].guid);
            });

            it('are included in element map for all waitEvents present', () => {
                const result = createWaitWithWaitEventReferences(waitFromFlow);

                expect(result.elements[waitFromFlow.waitEvents[0].guid]).toMatchObject(waitFromFlow.waitEvents[0]);
                expect(result.elements[waitFromFlow.waitEvents[1].guid]).toMatchObject(waitFromFlow.waitEvents[1]);
                expect(result.elements[waitFromFlow.waitEvents[2].guid]).toMatchObject(waitFromFlow.waitEvents[2]);
            });
        });
        describe('wait connections', () => {
            let result;
            let wait;
            beforeEach(() => {
                result = createWaitWithWaitEventReferences(waitFromFlow);
                wait = result.elements[existingWaitGuid];
            });
            it('have the correct connector count when all connections are available', () => {
                expect(wait.connectorCount).toBe(0);
            });

            it('have the correct number of max connections', () => {
                expect(wait.maxConnections).toBe(5);
            });

            it('have the correct available connections', () => {
                expect(wait.availableConnections).toHaveLength(5);
                expect(wait.availableConnections[0]).toEqual({
                    childReference: 'waitEvent1',
                    type: CONNECTOR_TYPE.REGULAR
                });
                expect(wait.availableConnections[1]).toEqual({
                    childReference: 'waitEvent2',
                    type: CONNECTOR_TYPE.REGULAR
                });
                expect(wait.availableConnections[2]).toEqual({
                    childReference: 'waitEvent3',
                    type: CONNECTOR_TYPE.REGULAR
                });
                expect(wait.availableConnections[3]).toEqual({
                    type: CONNECTOR_TYPE.DEFAULT
                });
                expect(wait.availableConnections[4]).toEqual({
                    type: CONNECTOR_TYPE.FAULT
                });
            });
        });
    });
    describe('createWaitMetadataObject', () => {
        let waitFromStore;

        beforeEach(() => {
            waitFromStore = {
                guid: existingWaitGuid,
                childReferences: [
                    {
                        childReference: existingWaitEventGuid
                    },
                    {
                        childReference: 'waitEvent2'
                    },
                    {
                        childReference: 'waitEvent3'
                    }
                ]
            };
        });

        it('includes the return value of a call to baseCanvasElementMetadataObject', () => {
            createWaitMetadataObject(waitFromStore);

            expect(baseCanvasElementMetadataObject).toHaveBeenCalledWith(waitFromStore, {});
        });

        describe('waitEvents', () => {
            it('wait includes waitEvents for all waitEvent references present', () => {
                const wait = createWaitMetadataObject(waitFromStore);

                expect(wait.waitEvents).toHaveLength(3);
                expect(wait.waitEvents[0].guid).toEqual(existingWaitEventGuid);
                expect(wait.waitEvents[1].guid).toEqual(waitFromStore.childReferences[1].childReference);
                expect(wait.waitEvents[2].guid).toEqual(waitFromStore.childReferences[2].childReference);
            });

            describe('conditions', () => {
                it('calls createConditionMetadataObject for each condition given', () => {
                    const mockCondition = { leftHandSide: 'foo' };
                    const mockWaitEvent = { conditions: [mockCondition] };
                    getElementByGuid.mockReturnValueOnce(mockWaitEvent);

                    const wait = createWaitMetadataObject(waitFromStore);

                    expect(createConditionMetadataObject).toHaveBeenCalledTimes(1);
                    expect(createConditionMetadataObject).toHaveBeenCalledWith(mockCondition);
                    expect(wait.waitEvents[0].conditions).toHaveLength(1);
                    expect(wait.waitEvents[0].conditions[0]).toEqual(mockCondition);
                    expect(wait.waitEvents[0].conditions[0]).toBe(createConditionMetadataObject.mock.results[0].value);
                });

                it('sets the condition logic to AND when no conditions exist', () => {
                    const wait = createWaitMetadataObject(waitFromStore);

                    expect(wait.waitEvents[0].conditionLogic).toEqual(CONDITION_LOGIC.AND);
                    expect(wait.waitEvents[1].conditionLogic).toEqual(CONDITION_LOGIC.AND);
                    expect(wait.waitEvents[2].conditionLogic).toEqual(CONDITION_LOGIC.AND);
                });

                it('sets the condition logic to AND when condition logic is NO_CONDITIONS', () => {
                    const mockCondition = { leftHandSide: 'foo' };
                    const mockWaitEvent = {
                        conditions: [mockCondition],
                        conditionLogic: CONDITION_LOGIC.NO_CONDITIONS
                    };
                    getElementByGuid.mockReturnValueOnce(mockWaitEvent);

                    const wait = createWaitMetadataObject(waitFromStore);

                    expect(wait.waitEvents[0].conditionLogic).toEqual(CONDITION_LOGIC.AND);
                });

                it('sets conditions to empty list when condition logic is NO_CONDITIONS', () => {
                    const mockWaitEvent = {
                        conditions: [{}],
                        conditionLogic: CONDITION_LOGIC.NO_CONDITIONS
                    };
                    getElementByGuid.mockReturnValueOnce(mockWaitEvent);

                    const wait = createWaitMetadataObject(waitFromStore);

                    expect(wait.waitEvents[0].conditions).toHaveLength(0);
                });
            });

            it('sets the input parameters with result of createParameterItemMetadataObject for every input parameter given', () => {
                waitFromStore = {
                    guid: existingWaitGuid,
                    childReferences: [
                        {
                            childReference: emptyParameterValueWaitEventGuid
                        }
                    ]
                };

                const wait = createWaitMetadataObject(waitFromStore);

                let index = 0;
                wait.waitEvents[0].inputParameters.forEach((inputParameter) => {
                    expect(createInputParameterMetadataObject.mock.calls[index++][0]).toEqual(inputParameter);
                });

                expect(wait.waitEvents[0].inputParameters).toHaveLength(3);
                index = 0;
                wait.waitEvents[0].inputParameters.forEach((inputParameter) => {
                    expect(createInputParameterMetadataObject.mock.results[index++].value).toEqual(inputParameter);
                });
            });

            it('sets the output parameters with result of createParameterItemMetadataObject for output parameters with non empty values', () => {
                waitFromStore = {
                    guid: existingWaitGuid,
                    childReferences: [
                        {
                            childReference: emptyParameterValueWaitEventGuid
                        }
                    ]
                };

                const wait = createWaitMetadataObject(waitFromStore);

                expect(createOutputParameterMetadataObject.mock.calls[0][0]).toEqual(
                    wait.waitEvents[0].outputParameters[0]
                );
                expect(createOutputParameterMetadataObject.mock.calls[1][0]).toEqual(
                    wait.waitEvents[0].outputParameters[1]
                );

                expect(wait.waitEvents[0].outputParameters).toHaveLength(2);
                expect(wait.waitEvents[0].outputParameters[0]).toEqual(
                    createOutputParameterMetadataObject.mock.results[0].value
                );
                expect(wait.waitEvents[0].outputParameters[1]).toEqual(
                    createOutputParameterMetadataObject.mock.results[1].value
                );
            });
        });

        describe('defaultConnectorLabel', () => {
            it('defaults to LABELS.emptyDefaultWaitPathLabel', () => {
                const wait = createWaitMetadataObject(waitFromStore);

                expect(wait.defaultConnectorLabel).toEqual(LABELS.emptyDefaultWaitPathLabel);
            });
            it('is used if passed in', () => {
                const defaultConnectorLabel = 'some label';
                waitFromStore.defaultConnectorLabel = defaultConnectorLabel;

                const wait = createWaitMetadataObject(waitFromStore);

                expect(wait.defaultConnectorLabel).toEqual(defaultConnectorLabel);
            });
        });
    });

    describe('isWaitTimeEventType', () => {
        it('returns true for wait time event type', () => {
            expect(isWaitTimeEventType('AlarmEvent')).toBe(true);
            expect(isWaitTimeEventType('DateRefAlarmEvent')).toBe(true);
        });
        it('returns false for platform event type', () => {
            expect(isWaitTimeEventType('PlatformEvent1__e')).toBe(false);
        });
    });

    describe('getParametersPropertyName', () => {
        it('returns correctly the parameter property name', () => {
            expect(getParametersPropertyName(true)).toBe('inputParameters');
            expect(getParametersPropertyName()).toBe('outputParameters');
        });
    });
});
