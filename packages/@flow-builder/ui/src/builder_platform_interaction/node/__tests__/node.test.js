import { createElement } from 'lwc';
import { EditElementEvent, DeleteElementEvent, CANVAS_EVENT } from "builder_platform_interaction/events";
import Node from "builder_platform_interaction/node";
import { getShadowRoot } from 'lwc-test-utils';

const createComponentUnderTest = (isSelected) => {
    const el = createElement('builder_platform_interaction-node', {
        is: Node
    });
    el.node = {
        guid: '1',
        locationX : '20px',
        locationY : '40px',
        elementType : 'ASSIGNMENT',
        label : 'First Node',
        description : 'My first test node',
        config: {isSelected}
    };
    document.body.appendChild(el);
    return el;
};

const selectors = {
    nodeContainer: '.node-container',
    iconSelected: '.icon-section.selected',
    icon: '.icon',
    trash: '.trash-can'
};

const dblClick = (component) => {
    const doubleClickEvent = new Event('dblclick', {
        'bubbles'   : true,
        'cancelable': true,
    });
    const nodeIcon = getShadowRoot(component).querySelector(selectors.icon);
    nodeIcon.dispatchEvent(doubleClickEvent);
};

describe('node', () => {
    it('Checks if node is rendered correctly', () => {
        const nodeComponent = createComponentUnderTest(false);
        return Promise.resolve().then(() => {
            expect(nodeComponent.node.guid).toEqual('1');
            expect(nodeComponent.node.locationX).toEqual('20px');
            expect(nodeComponent.node.locationY).toEqual('40px');
            expect(nodeComponent.node.elementType).toEqual('ASSIGNMENT');
            expect(nodeComponent.node.label).toEqual('First Node');
            expect(nodeComponent.node.description).toEqual('My first test node');
            expect(nodeComponent.node.config.isSelected).toBeFalsy();
        });
    });

    it('Checks if node selected event is dispatched when icon is clicked', () => {
        const nodeComponent = createComponentUnderTest(false);
        return Promise.resolve().then(() => {
            const callback = jest.fn();
            nodeComponent.addEventListener(CANVAS_EVENT.NODE_SELECTED, callback);
            getShadowRoot(nodeComponent).querySelector(selectors.icon).click();
            expect(callback).toHaveBeenCalled();
        });
    });

    it('Checks if node selected event is dispatched when selected icon is clicked', () => {
        const nodeComponent = createComponentUnderTest(true);
        return Promise.resolve().then(() => {
            const callback = jest.fn();
            nodeComponent.addEventListener(CANVAS_EVENT.NODE_SELECTED, callback);
            getShadowRoot(nodeComponent).querySelector(selectors.icon).click();
            expect(callback).toHaveBeenCalled();
        });
    });


    it('Checks if a selected node has the right styling', () => {
        const nodeComponent = createComponentUnderTest(true);
        return Promise.resolve().then(() => {
            expect(getShadowRoot(nodeComponent).querySelector(selectors.iconSelected)).toBeTruthy();
        });
    });

    it('Checks if an EditElementEvent is dispatched when icon is double clicked', () => {
        const nodeComponent = createComponentUnderTest(false);
        return Promise.resolve().then(() => {
            const callback = jest.fn();
            nodeComponent.addEventListener(EditElementEvent.EVENT_NAME, callback);
            dblClick(nodeComponent);
            expect(callback).toHaveBeenCalled();
            expect(callback.mock.calls[0][0]).toMatchObject({
                detail: {
                    canvasElementGUID: nodeComponent.node.guid
                }
            });
        });
    });

    it('Checks if node delete event is dispatched when trash is clicked', () => {
        const nodeComponent = createComponentUnderTest(true);
        return Promise.resolve().then(() => {
            const callback = jest.fn();
            nodeComponent.addEventListener(DeleteElementEvent.EVENT_NAME, callback);
            getShadowRoot(nodeComponent).querySelector(selectors.trash).click();
            expect(callback).toHaveBeenCalled();
        });
    });
});