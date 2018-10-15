import {recordCreateReducer} from "../recordCreateReducer";
import {
    AddRecordFieldAssignmentEvent,
    DeleteRecordFieldAssignmentEvent,
    UpdateRecordFieldAssignmentEvent,
    PropertyChangedEvent
} from "builder_platform_interaction/events";
import { NUMBER_RECORDS_TO_STORE } from "builder_platform_interaction/recordEditorLib";
import {EXPRESSION_PROPERTY_TYPE} from "builder_platform_interaction/expressionUtils";

const recordCreateUsingFieldsTemplate = () =>
    ({
        description : {value: '', error: null},
        elementType : 'RECORD_CREATE',
        guid : 'RECORDCREATE_2',
        isCanvasElement : true,
        label : {value: 'testRecordFields', error: null},
        locationX : 358,
        locationY : 227,
        name : {value: 'testRecordFields', error: null},
        numberRecordsToStore : {value: NUMBER_RECORDS_TO_STORE.FIRST_RECORD, error: null},
        inputAssignments : [{
            leftHandSide: {value: "Account.BillingCountry", error: null},
            rightHandSide: {value: "myCountry", error: null},
            rightHandSideDataType: {value: "String", error: null},
            rightHandSideGuid: {value: "myCountry", error: null},
            rowIndex: "724cafc2-7744-4e46-8eaa-f2df29539d1d"}
        ],
        object : {value: 'account', error: null},
        assignRecordIdToReference: {value: 'varToStoreId', error: null},
    });


const recordCreateUsingSobjectTemplate = () =>
    ({
        description : {value: '', error: null},
        elementType : 'RECORD_CREATE',
        guid : 'RECORDCREATE_2',
        isCanvasElement : true,
        label : {value: 'testRecordFields', error: null},
        locationX : 358,
        locationY : 227,
        name : {value: 'testRecordFields', error: null},
        numberRecordsToStore : {value: NUMBER_RECORDS_TO_STORE.FIRST_RECORD, error: null},
        processMetadataValues: [],
        inputReference: {value: 'VARIABLE_6', error: null},
        assignRecordIdToReference: {value: '', error: null},
    });


describe('record-create-reducer using sObject', () => {
    let originalState;
    beforeEach(() => {
        originalState = recordCreateUsingSobjectTemplate();
    });
    describe('update property action', () => {
        it('updates the inputReference property', () => {
            const propertyName = 'inputReference';
            const value = 'VARIABLE_33';
            const error = null;
            const propChangedEvent = new PropertyChangedEvent(propertyName, value, error, null, originalState.inputReference.value);
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordCreateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.inputReference.value).toEqual('VARIABLE_33');
            expect(newState.inputReference.error).toBe(null);
        });
        it('fetch the error from the action instead of rerunning validation', () => {
            const propertyName = 'inputReference';
            const value = 'notValidSobject';
            const error = 'You have entered an invalid value.';
            const propChangedEvent = new PropertyChangedEvent(propertyName, value, error, null, originalState.inputReference.value);
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordCreateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.inputReference.value).toEqual(value);
            expect(newState.inputReference.error).toBe(error);
        });
    });
    it('ignores unknown events', () => {
        const event = {
            type: 'unknown event',
            detail: {
                propertyName: 'label',
                value: 'newlabel',
                error: null
            }
        };
        const resultObj = recordCreateReducer(originalState, event);
        expect(resultObj).toBe(originalState);
    });
});
describe('record-create-reducer using fields', () => {
    let originalState;
    beforeEach(() => {
        originalState = recordCreateUsingFieldsTemplate();
    });
    describe('update property action', () => {
        it('updates the object property', () => {
            const propertyName = 'object';
            const value = 'USER';
            const error = null;
            const propChangedEvent = new PropertyChangedEvent(propertyName, value, error, null, originalState.object.value);
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordCreateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.object.value).toEqual('USER');
            expect(newState.object.error).toBe(null);
        });
        it('not a valid Object : fetch the error from the action instead of rerunning validation', () => {
            const propertyName = 'object';
            const value = 'notValidSobject';
            const error = 'You have entered an invalid value.';
            const propChangedEvent = new PropertyChangedEvent(propertyName, value, error, null, originalState.object.value);
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordCreateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.object.value).toEqual(value);
            expect(newState.object.error).toBe(error);
        });
    });
    describe('handle list item events', () => {
        it('add an assignment item', () => {
            const event = {
                type: AddRecordFieldAssignmentEvent.EVENT_NAME,
            };
            const newState = recordCreateReducer(originalState, event);
            expect(newState.inputAssignments).toHaveLength(2);
            expect(newState).not.toBe(originalState);
        });
        it('delete an assignment item', () => {
            const event = {
                type: DeleteRecordFieldAssignmentEvent.EVENT_NAME,
                detail: {
                    index: 0,
                }
            };
            const newState = recordCreateReducer(originalState, event);
            expect(newState.inputAssignments).toHaveLength(0);
            expect(newState).not.toBe(originalState);
        });
        it('update the left hand side of an assignment item', () => {
            const event = {
                type: UpdateRecordFieldAssignmentEvent.EVENT_NAME,
                detail: {
                    index: 0,
                    value: {[EXPRESSION_PROPERTY_TYPE.LEFT_HAND_SIDE]: {value: 'Account.Description', error: null}},
                }
            };
            const newState = recordCreateReducer(originalState, event);
            expect(newState.inputAssignments).toHaveLength(1);
            expect(newState.inputAssignments[0].leftHandSide.value).toBe('Account.Description');
            expect(newState).not.toBe(originalState);
        });
    });
    describe('handle property changed event', () => {
        describe('update numberRecordsToStore from All Records to First Record', () => {
            let newState;
            beforeAll(() => {
                const propertyName = 'numberRecordsToStore';
                const value = NUMBER_RECORDS_TO_STORE.FIRST_RECORD;
                const error = null;
                const propChangedEvent = new PropertyChangedEvent(propertyName, value, error, null, originalState.object.value);
                propChangedEvent.detail.ignoreValidate = true;
                newState = recordCreateReducer(originalState, propChangedEvent);
            });
            it('should reset object', () => {
                expect(newState.object.value).toBe('');
            });
            it('should reset inputAssignments', () => {
                expect(newState.inputAssignments).toHaveLength(1);
                expect(newState.inputAssignments[0].leftHandSide.value).toBe('');
            });
        });
        describe('update numberRecordsToStore from First Record to All Records', () => {
            let newState;
            beforeAll(() => {
                originalState = recordCreateUsingSobjectTemplate();
                const propertyName = 'numberRecordsToStore';
                const value = NUMBER_RECORDS_TO_STORE.ALL_RECORDS;
                const error = null;
                const propChangedEvent = new PropertyChangedEvent(propertyName, value, error, null, originalState.inputReference.value);
                propChangedEvent.detail.ignoreValidate = true;
                newState = recordCreateReducer(originalState, propChangedEvent);
            });
            it('should reset inputReference', () => {
                expect(newState.inputReference.value).toBe('');
            });
        });
    });
});