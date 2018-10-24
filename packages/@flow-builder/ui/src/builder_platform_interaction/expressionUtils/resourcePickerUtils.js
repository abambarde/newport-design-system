import {
    filterAndMutateMenuData,
    filterFieldsForChosenElement,
    getStoreElements,
    getSecondLevelItems,
} from './menuDataRetrieval';

const getFieldMenuData = (elementConfig, populateParamTypesFn, parentItem, entityFields) => {
    const showAsFieldReference = true;
    const showSubText = true;
    let menuData;

    const allowedParamTypes = populateParamTypesFn();
    if (entityFields) {
        menuData = filterFieldsForChosenElement(parentItem, allowedParamTypes, entityFields, showAsFieldReference, showSubText);
    } else {
        // when handling fetch menu data (user selects new sobject) we will not have the fields yet
        const entityName = parentItem.objectType;
        getSecondLevelItems(entityName, (fields) => {
            menuData = filterFieldsForChosenElement(parentItem, allowedParamTypes, fields, showAsFieldReference, showSubText);
        });
    }
    return menuData;
};

const getFerovMenuData = (elementConfig, propertyEditorElementType, populateParamTypesFn, allowSobjectForFields,
    enableFieldDrilldown, storeInstance, includeNewResource, showSystemVariables) => {
    const menuDataElements = getStoreElements(storeInstance.getCurrentState(),
        elementConfig || { elementType: propertyEditorElementType });

    return filterAndMutateMenuData(menuDataElements, populateParamTypesFn(), includeNewResource,
        allowSobjectForFields, !enableFieldDrilldown, null, showSystemVariables);
};

/**
 * Populate menu data
 *
 * @param {Object} elementConfig    element config
 * @param {String} propertyEditorElementType    property editor element type
 * @param {String} populateParamTypesFn    the resource picker's function to populate paramTypes
 * @param {boolean} allowSobjectForFields    whether to show sobjects in menudata to allow users to select fields
 * @param {boolean} enableFieldDrilldown    whether to set hasNext to false for all menu items
 * @param {Object} storeInstance    instance of the store
 * @param {Object} includeNewResource    whether to show the "New Resource" option
 * @param {Object|undefined} parentItem    parent item
 * @param {Array} fields fields to be populated if parentItem is defined
 * @returns {Array} array of resources
 */
export const getMenuData = (elementConfig, propertyEditorElementType, populateParamTypesFn, allowSobjectForFields,
    enableFieldDrilldown, storeInstance, includeNewResource, parentItem, fields, showSystemVariables = true) => {
    let menuData;
    if (parentItem) {
        menuData = getFieldMenuData(elementConfig, populateParamTypesFn, parentItem, fields);
    } else {
        menuData = getFerovMenuData(elementConfig, propertyEditorElementType, populateParamTypesFn, allowSobjectForFields,
            enableFieldDrilldown, storeInstance, includeNewResource, showSystemVariables);
    }
    return menuData;
};
