import { getElementByGuid } from 'builder_platform_interaction/storeUtils';
import {
    createDecisionWithOutcomes,
    createDuplicateDecision,
    createOutcome,
    createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor,
    createDecisionWithOutcomeReferences,
    createDecisionMetadataObject
} from '../decision';
import { ELEMENT_TYPE, CONNECTOR_TYPE, CONDITION_LOGIC } from 'builder_platform_interaction/flowMetadata';
import { LABELS } from '../elementFactoryLabels';
import {
    baseCanvasElement,
    duplicateCanvasElementWithChildElements,
    baseChildElement,
    baseCanvasElementsArrayToMap
} from '../base/baseElement';
import {
    baseCanvasElementMetadataObject,
    baseChildElementMetadataObject,
    createConditionMetadataObject
} from '../base/baseMetadata';
import { getConnectionProperties } from '../commonFactoryUtils/decisionAndWaitConnectionPropertiesUtil';

jest.mock('builder_platform_interaction/storeUtils', () => {
    return {
        getElementByGuid: jest.fn()
    };
});

const newDecisionGuid = 'newDecision';
const existingDecisionGuid = 'existingDecision';
const existingDecision = {
    guid: existingDecisionGuid,
    outcomeReferences: [{ outcomeReference: 'existingOutcome1' }, { outcomeReference: 'existingOutcome2' }]
};

getElementByGuid.mockImplementation(guid => {
    if (guid === newDecisionGuid) {
        return null;
    } else if (guid === existingDecisionGuid) {
        return existingDecision;
    }

    return {
        guid
    };
});

jest.mock('../base/baseElement');
baseCanvasElement
    .mockImplementation(element => {
        return Object.assign({}, element);
    })
    .mockName('baseCanvasElementMock');
duplicateCanvasElementWithChildElements
    .mockImplementation(() => {
        const duplicatedElement = {};
        const duplicatedChildElements = {
            duplicatedOutcomeGuid: {
                guid: 'duplicatedOutcomeGuid',
                name: 'duplicatedOutcomeName'
            }
        };
        const updatedChildReferences = [
            {
                outcomeReference: 'duplicatedOutcomeGuid'
            }
        ];
        const availableConnections = [
            {
                type: CONNECTOR_TYPE.REGULAR,
                childReference: 'duplicatedOutcomeGuid'
            },
            {
                type: CONNECTOR_TYPE.DEFAULT
            }
        ];

        return {
            duplicatedElement,
            duplicatedChildElements,
            updatedChildReferences,
            availableConnections
        };
    })
    .mockName('duplicateCanvasElementWithChildElementsMock');
baseChildElement
    .mockImplementation(outcome => {
        return Object.assign({}, outcome);
    })
    .mockName('baseChildElementMock');
baseCanvasElementsArrayToMap.mockImplementation(jest.requireActual('../base/baseElement').baseCanvasElementsArrayToMap);

jest.mock('../base/baseMetadata');
baseCanvasElementMetadataObject.mockImplementation(element => {
    return Object.assign({}, element);
});
baseChildElementMetadataObject.mockImplementation(element => {
    return Object.assign({}, element);
});
createConditionMetadataObject
    .mockImplementation(element => Object.assign({}, element))
    .mockName('createConditionMetadataObject');

jest.mock('../commonFactoryUtils/decisionAndWaitConnectionPropertiesUtil');
getConnectionProperties.mockImplementation(() => {
    return {
        connectorCount: 1,
        availableConnections: [
            {
                type: CONNECTOR_TYPE.DEFAULT
            }
        ],
        addFaultConnectionForWaitElement: false
    };
});

// TODO: https://gus.my.salesforce.com/a07B0000004ihceIAA - add connector tests

describe('decision', () => {
    describe('createDecisionWithOutcomes', () => {
        it('includes the return value of a call to baseCanvasElement', () => {
            createDecisionWithOutcomes(existingDecision);

            expect(baseCanvasElement).toHaveBeenCalledWith(existingDecision);
        });

        it('element type is DECISION', () => {
            const decision = createDecisionWithOutcomes();

            expect(decision.elementType).toEqual(ELEMENT_TYPE.DECISION);
        });

        describe('defaultConnectorLabel', () => {
            it('defaults to LABELS.emptyDefaultOutcomeLabel', () => {
                const decision = createDecisionWithOutcomes();

                expect(decision.defaultConnectorLabel).toEqual(LABELS.emptyDefaultOutcomeLabel);
            });
            it('is used if passed in', () => {
                const defaultConnectorLabel = 'some label';

                const decision = createDecisionWithOutcomes({
                    defaultConnectorLabel
                });

                expect(decision.defaultConnectorLabel).toEqual(defaultConnectorLabel);
            });
        });
        describe('outcomes', () => {
            it('includes a single default outcome if no outcome references present', () => {
                const outcome = {
                    foo: 'bar'
                };
                baseChildElement.mockReturnValueOnce(outcome);
                const decision = createDecisionWithOutcomes();

                expect(decision.outcomes).toHaveLength(1);
                expect(decision.outcomes[0]).toEqual(outcome);
            });

            it('includes outcomes for all outcome references present', () => {
                const outcomeReferences = [
                    { outcomeReference: 'a' },
                    { outcomeReference: 'b' },
                    { outcomeReference: 'c' }
                ];

                const decision = createDecisionWithOutcomes({
                    outcomeReferences
                });

                expect(decision.outcomes).toHaveLength(3);
                expect(decision.outcomes[0].guid).toEqual(outcomeReferences[0].outcomeReference);
                expect(decision.outcomes[1].guid).toEqual(outcomeReferences[1].outcomeReference);
                expect(decision.outcomes[2].guid).toEqual(outcomeReferences[2].outcomeReference);
            });
        });
    });

    describe('createDuplicateDecision function', () => {
        const { duplicatedElement, duplicatedChildElements } = createDuplicateDecision(
            {},
            'duplicatedGuid',
            'duplicatedName',
            {},
            {}
        );

        it('duplicatedElement has updated outcomeReferences', () => {
            expect(duplicatedElement.outcomeReferences).toEqual([
                {
                    outcomeReference: 'duplicatedOutcomeGuid'
                }
            ]);
        });
        it('duplicatedElement has updated availableConnections', () => {
            expect(duplicatedElement.availableConnections).toEqual([
                {
                    type: CONNECTOR_TYPE.REGULAR,
                    childReference: 'duplicatedOutcomeGuid'
                },
                {
                    type: CONNECTOR_TYPE.DEFAULT
                }
            ]);
        });
        it('duplicatedElement has updated defaultConnectorLabel', () => {
            expect(duplicatedElement.defaultConnectorLabel).toEqual(LABELS.emptyDefaultOutcomeLabel);
        });
        it('returns correct duplicatedChildElements', () => {
            expect(duplicatedChildElements).toEqual({
                duplicatedOutcomeGuid: {
                    guid: 'duplicatedOutcomeGuid',
                    name: 'duplicatedOutcomeName'
                }
            });
        });
    });

    describe('createOutcome', () => {
        beforeEach(() => {
            baseChildElement.mockClear();
        });
        it('calls baseChildElement with elementType = OUTCOME', () => {
            createOutcome();
            expect(baseChildElement.mock.calls[0][1]).toEqual(ELEMENT_TYPE.OUTCOME);
        });

        it('calls baseChildElement with an empty outcome by default', () => {
            createOutcome();
            expect(baseChildElement.mock.calls[0][0]).toEqual({});
        });

        it('uses existing values when passed in an outcome object', () => {
            const mockCondition1 = { operator: 'foo' };
            const mockCondition2 = { operator: 'bar' };
            const mockOutcome = {
                conditionLogic: CONDITION_LOGIC.OR,
                conditions: [mockCondition1, mockCondition2],
                dataType: 'sfdc'
            };

            createOutcome(mockOutcome);

            expect(baseChildElement.mock.calls[0][0]).toEqual(mockOutcome);
        });
    });

    describe('createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor', () => {
        let decisionFromPropertyEditor;

        beforeEach(() => {
            decisionFromPropertyEditor = {
                guid: newDecisionGuid,
                outcomes: [
                    {
                        guid: 'outcome1'
                    }
                ]
            };
        });

        it('includes the return value of a call to baseCanvasElement', () => {
            createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(decisionFromPropertyEditor);

            expect(baseCanvasElement).toHaveBeenCalledWith(decisionFromPropertyEditor);
        });

        it('element type is DECISION_WITH_MODIFIED_AND_DELETED_OUTCOMES', () => {
            const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                decisionFromPropertyEditor
            );

            expect(result.elementType).toEqual(ELEMENT_TYPE.DECISION_WITH_MODIFIED_AND_DELETED_OUTCOMES);
        });

        it('decision element type is DECISION', () => {
            const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                decisionFromPropertyEditor
            );

            expect(result.canvasElement.elementType).toEqual(ELEMENT_TYPE.DECISION);
        });

        describe('defaultConnectorLabel', () => {
            it('defaults to LABELS.emptyDefaultOutcomeLabel', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.canvasElement.defaultConnectorLabel).toEqual(LABELS.emptyDefaultOutcomeLabel);
            });
            it('is used if passed in', () => {
                const defaultConnectorLabel = 'some label';

                decisionFromPropertyEditor.defaultConnectorLabel = defaultConnectorLabel;
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.canvasElement.defaultConnectorLabel).toEqual(defaultConnectorLabel);
            });
        });

        describe('connection properties of a decision', () => {
            it('result has availableConnections', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );
                expect(result.canvasElement.availableConnections).toHaveLength(1);
                expect(result.canvasElement.availableConnections[0]).toEqual({
                    type: CONNECTOR_TYPE.DEFAULT
                });
            });

            it('has connectorCount', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );
                expect(result.canvasElement.connectorCount).toEqual(1);
            });

            it('decision has the right maxConnections', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );
                expect(result.canvasElement.maxConnections).toEqual(2);
            });
        });

        describe('new/modified outcomes', () => {
            let outcomes;

            beforeEach(() => {
                outcomes = [{ guid: 'a' }, { guid: 'b' }, { guid: 'c' }];

                decisionFromPropertyEditor.outcomes = outcomes;
            });

            it('decision includes outcome references for all outcomes present', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.canvasElement.outcomeReferences).toHaveLength(3);
                expect(result.canvasElement.outcomeReferences[0].outcomeReference).toEqual(outcomes[0].guid);
                expect(result.canvasElement.outcomeReferences[1].outcomeReference).toEqual(outcomes[1].guid);
                expect(result.canvasElement.outcomeReferences[2].outcomeReference).toEqual(outcomes[2].guid);
            });

            it('includes outcomes for all outcomes present', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.childElements).toHaveLength(3);
                expect(result.childElements[0].guid).toEqual(outcomes[0].guid);
                expect(result.childElements[1].guid).toEqual(outcomes[1].guid);
                expect(result.childElements[2].guid).toEqual(outcomes[2].guid);
            });

            it('has the right maxConnections', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.canvasElement.maxConnections).toEqual(4);
            });
        });

        describe('deleted outcomes', () => {
            beforeEach(() => {
                decisionFromPropertyEditor = {
                    guid: existingDecisionGuid,
                    outcomes: [
                        {
                            guid: 'outcome1'
                        }
                    ]
                };
            });

            it('decision does not include outcome references for deleted outcomes', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.canvasElement.outcomeReferences).toHaveLength(1);
                expect(result.canvasElement.outcomeReferences[0].outcomeReference).toEqual(
                    decisionFromPropertyEditor.outcomes[0].guid
                );
            });

            it('includes all deleted outcomes', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.deletedChildElementGuids).toHaveLength(2);
                expect(result.deletedChildElementGuids[0]).toEqual(
                    existingDecision.outcomeReferences[0].outcomeReference
                );
                expect(result.deletedChildElementGuids[1]).toEqual(
                    existingDecision.outcomeReferences[1].outcomeReference
                );
            });

            it('has the right maxConnections', () => {
                const result = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(
                    decisionFromPropertyEditor
                );

                expect(result.canvasElement.maxConnections).toEqual(2);
            });
        });
    });

    describe('createDecisionWithOutcomeReferences', () => {
        let decisionFromFlow;

        beforeEach(() => {
            decisionFromFlow = {
                guid: existingDecisionGuid,
                rules: [
                    {
                        name: 'outcome1',
                        guid: 'outcome1'
                    },
                    {
                        name: 'outcome2',
                        guid: 'outcome2'
                    },
                    {
                        name: 'outcome3',
                        guid: 'outcome3'
                    }
                ]
            };
        });

        it('includes the return value of a call to baseCanvasElement', () => {
            createDecisionWithOutcomeReferences(decisionFromFlow);

            expect(baseCanvasElement).toHaveBeenCalledWith(decisionFromFlow);
        });

        it('element type is DECISION', () => {
            const result = createDecisionWithOutcomeReferences(decisionFromFlow);

            const decision = result.elements[existingDecisionGuid];
            expect(decision.elementType).toEqual(ELEMENT_TYPE.DECISION);
        });

        describe('defaultConnectorLabel', () => {
            it('defaults to LABELS.emptyDefaultOutcomeLabel', () => {
                const result = createDecisionWithOutcomeReferences(decisionFromFlow);
                const decision = result.elements[existingDecisionGuid];

                expect(decision.defaultConnectorLabel).toEqual(LABELS.emptyDefaultOutcomeLabel);
            });
            it('is used if passed in', () => {
                const defaultConnectorLabel = 'some label';

                decisionFromFlow.defaultConnectorLabel = defaultConnectorLabel;

                const result = createDecisionWithOutcomeReferences(decisionFromFlow);
                const decision = result.elements[existingDecisionGuid];

                expect(decision.defaultConnectorLabel).toEqual(defaultConnectorLabel);
            });
        });
        describe('outcomes', () => {
            it('decision includes outcomes for all rules present', () => {
                const result = createDecisionWithOutcomeReferences(decisionFromFlow);
                const decision = result.elements[existingDecisionGuid];

                expect(decision.outcomeReferences).toHaveLength(3);
                expect(decision.outcomeReferences[0].outcomeReference).toEqual(decisionFromFlow.rules[0].guid);
                expect(decision.outcomeReferences[1].outcomeReference).toEqual(decisionFromFlow.rules[1].guid);
                expect(decision.outcomeReferences[2].outcomeReference).toEqual(decisionFromFlow.rules[2].guid);
            });

            it('are included in element map for all rules present', () => {
                const result = createDecisionWithOutcomeReferences(decisionFromFlow);

                expect(result.elements[decisionFromFlow.rules[0].guid]).toMatchObject(decisionFromFlow.rules[0]);
                expect(result.elements[decisionFromFlow.rules[1].guid]).toMatchObject(decisionFromFlow.rules[1]);
                expect(result.elements[decisionFromFlow.rules[2].guid]).toMatchObject(decisionFromFlow.rules[2]);
            });
        });
    });
    describe('createDecisionMetadataObject', () => {
        let decisionFromStore;

        beforeEach(() => {
            decisionFromStore = {
                guid: existingDecisionGuid,
                outcomeReferences: [
                    {
                        outcomeReference: 'outcome1'
                    },
                    {
                        outcomeReference: 'outcome2'
                    },
                    {
                        outcomeReference: 'outcome3'
                    }
                ]
            };
        });

        it('includes the return value of a call to baseCanvasElementMetadataObject', () => {
            createDecisionMetadataObject(decisionFromStore);

            expect(baseCanvasElementMetadataObject).toHaveBeenCalledWith(decisionFromStore, {});
        });

        describe('outcomes', () => {
            it('decision includes rules for all outcome references present', () => {
                const decision = createDecisionMetadataObject(decisionFromStore);

                expect(decision.rules).toHaveLength(3);
                expect(decision.rules[0].guid).toEqual(decisionFromStore.outcomeReferences[0].outcomeReference);
                expect(decision.rules[1].guid).toEqual(decisionFromStore.outcomeReferences[1].outcomeReference);
                expect(decision.rules[2].guid).toEqual(decisionFromStore.outcomeReferences[2].outcomeReference);
            });

            it('calls createConditionMetadataObject for each condition given', () => {
                const mockCondition = { leftHandSide: 'foo' };
                const mockOutcome = { conditions: [mockCondition] };
                getElementByGuid.mockReturnValueOnce(mockOutcome);
                const decision = createDecisionMetadataObject(decisionFromStore);
                expect(createConditionMetadataObject).toHaveBeenCalledTimes(1);
                expect(decision.rules[0].conditions).toHaveLength(1);
                expect(decision.rules[0].conditions[0]).toEqual(mockCondition);
                expect(decision.rules[0].conditions[0]).toBe(createConditionMetadataObject.mock.results[0].value);
            });
        });

        describe('defaultConnectorLabel', () => {
            it('defaults to LABELS.emptyDefaultOutcomeLabel', () => {
                const decision = createDecisionMetadataObject(decisionFromStore);

                expect(decision.defaultConnectorLabel).toEqual(LABELS.emptyDefaultOutcomeLabel);
            });
            it('is used if passed in', () => {
                const defaultConnectorLabel = 'some label';
                decisionFromStore.defaultConnectorLabel = defaultConnectorLabel;

                const decision = createDecisionMetadataObject(decisionFromStore);

                expect(decision.defaultConnectorLabel).toEqual(defaultConnectorLabel);
            });
        });
    });
});
