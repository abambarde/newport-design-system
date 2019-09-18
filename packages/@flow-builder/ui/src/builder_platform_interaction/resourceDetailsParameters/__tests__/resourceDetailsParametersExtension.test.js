import ResourceDetailsParametersExtensionConfig from '../resourceDetailsParametersExtension';
import { mockFlowRuntimeEmailFlowExtensionDescription } from 'mock/flowExtensionsData';
import { emailScreenFieldAutomaticOutput } from 'mock/storeData';

jest.mock('builder_platform_interaction/storeLib', () =>
    require('builder_platform_interaction_mocks/storeLib')
);

jest.mock('builder_platform_interaction/flowExtensionLib', () => ({
    describeExtension: jest.fn(() =>
        Promise.resolve(mockFlowRuntimeEmailFlowExtensionDescription)
    )
}));

describe('resource-details-parameters-extension', () => {
    const callback = jest.fn();
    describe('fetchExtensionOutputParameters', () => {
        const fetchExtensionOutputFetchFunc = ResourceDetailsParametersExtensionConfig.fetch();
        test.each`
            resourceGuid
            ${null}
            ${undefined}
            ${''}
            ${'GUID_NOT_IN_STORE'}
        `('Invalid resourceGuid: "$resourceGuid"', ({ resourceGuid }) => {
            fetchExtensionOutputFetchFunc(resourceGuid, callback);
            return Promise.resolve().then(() =>
                expect(callback).toHaveBeenCalledWith(
                    [],
                    `No resource found for GUID: ${resourceGuid}`
                )
            );
        });
        test('Existing resourceGuid', () => {
            fetchExtensionOutputFetchFunc(
                emailScreenFieldAutomaticOutput.guid,
                callback
            );
            return Promise.resolve().then(() =>
                expect(callback).not.toHaveBeenCalledWith(
                    [],
                    expect.any(String)
                )
            );
        });
    });
    describe('mapperExtensionOutputParameter', () => {
        const mapperExtensionOutputMapFunc = ResourceDetailsParametersExtensionConfig.map();
        test.each`
            rawParameter
            ${null}
            ${undefined}
            ${{}}
        `('Invalid rawParameter: "$rawParameter"', ({ rawParameter }) => {
            const actualResult = mapperExtensionOutputMapFunc(rawParameter);
            expect(actualResult).toEqual({});
        });
    });
});
