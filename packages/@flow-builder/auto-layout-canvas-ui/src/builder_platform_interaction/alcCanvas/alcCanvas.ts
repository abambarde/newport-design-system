import { LightningElement, track, api } from 'lwc';
import {
    renderFlow,
    toggleFlowMenu,
    closeFlowMenu,
    updateDeletionPathInfo,
    clearDeletionPathInfo,
    calculateFlowLayout,
    getDefaultLayoutConfig,
    animate,
    MenuType,
    panzoom,
    NodeType,
    getTargetGuidsForReconnection,
    Guid,
    NodeRenderInfo,
    FlowRenderContext,
    FlowRenderInfo,
    FlowInteractionState,
    Dimension,
    invokeModal,
    modalBodyVariant,
    resolveParent,
    isBranchTerminal,
    hasGoToOnNext,
    shouldDeleteGoToOnNext,
    ElementMetadata,
    ConnectionSource
} from 'builder_platform_interaction/autoLayoutCanvas';
import {
    ZOOM_ACTION,
    ClosePropertyEditorEvent,
    DeleteElementEvent,
    ToggleSelectionModeEvent,
    ClickToZoomEvent,
    CanvasMouseUpEvent,
    EditElementEvent
} from 'builder_platform_interaction/events';
import {
    AlcSelectionEvent,
    AlcCreateConnectionEvent,
    ToggleMenuEvent,
    NodeResizeEvent,
    MoveFocusToNodeEvent,
    MoveFocusToConnectorEvent,
    CreateGoToConnectionEvent,
    DeleteBranchElementEvent,
    TabOnMenuTriggerEvent
} from 'builder_platform_interaction/alcEvents';
import {
    getAlcFlowData,
    getAlcMenuData,
    getCanvasElementSelectionData,
    getCanvasElementDeselectionData,
    AutoLayoutCanvasMode,
    AutoLayoutCanvasContext,
    getFirstSelectableElementGuid
} from 'builder_platform_interaction/alcComponentsUtils';
import { getFocusPath } from './alcCanvasUtils';
import { commands, keyboardInteractionUtils, loggingUtils } from 'builder_platform_interaction/sharedUtils';
import { LABELS } from './alcCanvasLabels';

// alloted time between click events in ms, where two clicks are interpreted as a double click
const DOUBLE_CLICK_THRESHOLD = 250;

const MAX_ZOOM = 1;
const MIN_ZOOM = 0.1;

const ZOOM_SCALE_STEP = 0.2;

const selectors = {
    triggerButton: 'builder_platform_interaction-start-node-trigger-button',
    contextButton: 'builder_platform_interaction-start-node-context-button',
    scheduledPathButton: 'builder_platform_interaction-start-node-scheduled-path-button',
    nodeMenu: 'builder_platform_interaction-alc-node-menu',
    alcMenu: 'builder_platform_interaction-alc-menu',
    startMenu: 'builder_platform_interaction-alc-start-menu',
    connectorMenu: 'builder_platform_interaction-alc-connector-menu',
    canvasClass: '.canvas',
    flowContainerClass: '.flow-container'
};

const defaultConfig = getDefaultLayoutConfig();

const CONNECTOR_ICON_SIZE = defaultConfig.connector.icon.w;
const MENU_ICON_SIZE = defaultConfig.node.icon.w;

const SYNTHETIC_ZOOM_TO_VIEW_EVENT = { detail: { action: ZOOM_ACTION.ZOOM_TO_VIEW } };

const FULL_OPACITY_CLASS = 'full-opacity';

const { ZoomInCommand, ZoomOutCommand, ZoomToFitCommand, ZoomToViewCommand } = commands;

const { KeyboardInteractions } = keyboardInteractionUtils;

const { logPerfTransactionEnd, logPerfTransactionStart } = loggingUtils;

const AUTOLAYOUT_CANVAS = 'AUTOLAYOUT_CANVAS';

const AUTOLAYOUT_CANVAS_SELECTION = 'AUTOLAYOUT_CANVAS_SELECTION';

// needed to compensate for floating point arithmetic imprecisions
const FUDGE = 0.02;

/**
 * debounce function
 *
 * @param fct - The function to debounce to
 * @param wait - The time to wait
 * @returns -
 */
function debounce(fct, wait) {
    let timeoutId;

    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        timeoutId = setTimeout(() => {
            return fct(...args);
        }, wait);
    };
}

export default class AlcCanvas extends LightningElement {
    _animatePromise: Promise<void> = Promise.resolve() as Promise<void>;

    /* if the builder has been disconnected */
    _isDisconnected = false;

    /* the canvas element (ie the viewport) */
    _canvasElement;

    /* the container for the flow and menus */
    _flowContainerElement;

    /* the flow model to render */
    _flowModel;

    /* map fo element metadata */
    _elementsMetadata!: ElementMetadata[];

    /* the rendering context */
    _flowRenderContext!: FlowRenderContext;

    /* the rendered flow */
    _flowRenderInfo!: FlowRenderInfo;

    /* the selection mode */
    _isSelectionMode: boolean | undefined;

    /* the top most selected element's guid */
    _topSelectedGuid!: Guid | null;

    /* the guid of the element we are reconnecting to another element */
    _currentTargetGuid!: Guid | null;

    /* the guid of the source of the GoTo connection */
    _goToSourceGuid!: Guid | null;

    _goToSourceBranchIndex!: number | null;

    /* whether a goto connection being made is part of rerouting an existing goto */
    _isReroutingGoto!: boolean;

    /* Array of guids the user can merge into */
    _mergeableGuids!: Guid[];

    /* Array of guids the user can goTo */
    _goToableGuids!: Guid[];

    /* guid of the first mergeable non-next element */
    _firstMergeableNonNullNext!: Guid | null;

    /**
     * Guid to set focus on when entering selection mode
     * to select a GoTo target
     */
    _elementGuidToFocus!: Guid | null;

    /* the current scale with a domain of [MIN_ZOOM, MAX_ZOOM] */
    _scale!: number;

    /* offsets to center the zoom */
    _panzoomOffsets;

    /** pending interaction state to be processed in the next render cycle */
    _pendingInteractionState: FlowInteractionState | null = null;

    /** Used for ZoomEnd trigger */
    _eventOpenMenuAfterZoom;
    /** Used for ZoomEnd trigger */
    _interactionStateAfterZoom;

    // Number of nodes which require dynamic rendering upon initial load
    // If this is > 0, then a spinner will be shown until all dynamic nodes
    // have rendered and the canvas layout is complete
    //
    // Note: this is only used for the initial render
    dynamicNodeCountAtLoad = 0;

    // Variable to keep a track of when panning is in progress
    isPanInProgress = false;

    /* tracks whether the start menu as been display when first opening a flow */
    @track
    initialStartMenuDisplayed = false;

    constructor() {
        super();
        this.keyboardInteractions = new KeyboardInteractions();
        logPerfTransactionStart(AUTOLAYOUT_CANVAS, null, null);
    }

    // stash the last clicked element guid until the DOUBLE_CLICK_THRESHOLD is exceeded
    lastClickedElementGuid: string | null = null;

    @track
    isZoomToView = true;

    @track
    isZoomInDisabled = true;

    @track
    isZoomOutDisabled = false;

    @track
    flow;

    @track
    menu;

    @track
    moveFocusToMenu;

    @track
    menuOpacityClass = '';

    @api
    disableDebounce = false;

    @api
    disableAnimation = false;

    @api
    isPasteAvailable!: boolean;

    @api
    offsets = [0, 0];

    @api
    keyboardInteractions;

    @api
    disableAddElements;

    @api
    disableDeleteElements;

    @api
    supportsScheduledPaths;

    /**
     * The active element refers to the element currently being edited using the property editor panel
     */
    @api
    activeElementGuid;

    @api
    set elementsMetadata(elementsMetadata: ElementMetadata[]) {
        this._elementsMetadata = elementsMetadata;
        // Used to make sure flow.info sent to alc-flow does not have stale elementsMetadata
        if (this._elementsMetadata) {
            this.updateFlowRenderContext({ elementsMetadata: this._convertToElementMetadataMap() });
        }
    }

    get elementsMetadata(): ElementMetadata[] {
        return this._elementsMetadata!;
    }

    // This will be true when we are selecting or reconnecting
    @api
    set isSelectionMode(isSelectionMode) {
        this._isSelectionMode = isSelectionMode;
        this.handleSelectionModeChange();
    }

    get isSelectionMode() {
        return this._isSelectionMode;
    }

    @api
    set flowModel(flowModel) {
        this._flowModel = flowModel;
        this.updateFlowRenderContext({ flowModel });
    }

    get flowModel() {
        return this._flowModel;
    }

    @api
    focusOnNode = (elementGuid: Guid) => {
        const pathToFocusNode = getFocusPath(this.flowModel, [{ guid: elementGuid }]);
        const alcFlow = this.template.querySelector('builder_platform_interaction-alc-flow');
        alcFlow.findNode(pathToFocusNode).focus();
    };

    @api
    focusOnConnector = (elementGuid: Guid, childIndex?: number) => {
        const pathToFocusNode = getFocusPath(this.flowModel, [{ guid: elementGuid }]);
        const alcFlow = this.template.querySelector('builder_platform_interaction-alc-flow');
        alcFlow.findConnector(pathToFocusNode, childIndex).focus();
    };

    /**
     * Closes any opened node or connector menu
     */
    @api
    closeNodeOrConnectorMenu() {
        const interactionState = closeFlowMenu(this._flowRenderContext.interactionState);
        this._pendingInteractionState = null;
        this.menu = null;
        this.updateFlowRenderContext({ interactionState });
    }

    /**
     * When focus is initiated on the canvas, set focus on the Start element
     */
    @api
    focus() {
        // TODO (W-9424079): Move focus to first focus-able element when in selection mode
        this.focusOnNode(this.getStartElementGuid());
    }

    get autoLayoutCanvasContext(): AutoLayoutCanvasContext {
        const mode = this._goToSourceGuid
            ? AutoLayoutCanvasMode.RECONNECTION
            : this.isSelectionMode
            ? AutoLayoutCanvasMode.SELECTION
            : AutoLayoutCanvasMode.DEFAULT;
        const isPasteAvailable = this.isPasteAvailable;
        return {
            isPasteAvailable,
            mode
        };
    }

    get showConnectorMenu() {
        return this.menu != null && this.menu.connectorMenu === MenuType.CONNECTOR;
    }

    get showNodeMenu() {
        return this.menu != null && this.menu.connectorMenu === MenuType.NODE;
    }

    get menuContainerClasses() {
        return 'menu-container ' + this.menuOpacityClass;
    }

    /**
     * Used to return the data that drives the start node.
     * This is different from what is in elementsMetadata
     *
     * @returns - The start element
     */
    get startMenuElement() {
        let startRenderInfo;

        if (this.menu.elementMetadata.type === NodeType.START) {
            startRenderInfo = this.flow.flowInfo.nodes.find((info) => info.metadata.type === NodeType.START);
        }

        return startRenderInfo != null ? startRenderInfo.node : null;
    }

    get scale() {
        return this._scale;
    }

    set scale(scale) {
        this._scale = scale;
        this.isZoomInDisabled = scale >= MAX_ZOOM - FUDGE;
        this.isZoomOutDisabled = scale <= MIN_ZOOM + FUDGE;
        this.isZoomToView = this.isZoomInDisabled;
    }

    get canvasStyle() {
        const [x, y] = this.offsets;

        return `margin-left: ${x}px; margin-top: ${y}px`;
    }

    /**
     * Spinner shown if all dynamic node components have not rendered
     * We need to wait for them since the layout will not be valid until they are done
     *
     * This should never return true after initial render
     *
     * @returns - True if the spinner should be displayed
     */
    get showSpinner(): boolean {
        return (
            !this._flowRenderContext ||
            this.dynamicNodeCountAtLoad > this._flowRenderContext.dynamicNodeDimensionMap.size ||
            !this.initialStartMenuDisplayed
        );
    }

    getStartElementGuid() {
        return this.flowModel[NodeType.ROOT].children[0];
    }

    getOpenedMenu() {
        return (
            this.template.querySelector(selectors.nodeMenu) ||
            this.template.querySelector(selectors.startMenu) ||
            this.template.querySelector(selectors.connectorMenu)
        );
    }

    renderedCallback() {
        this.menuOpacityClass = this.menu != null ? FULL_OPACITY_CLASS : '';

        if (this._canvasElement == null) {
            this._canvasElement = this.template.querySelector(selectors.canvasClass);
            this.updateFlowRenderContext();
        }

        if (!this._flowContainerElement) {
            const flowContainerElement = this.template.querySelector(selectors.flowContainerClass);
            if (flowContainerElement != null) {
                this._flowContainerElement = flowContainerElement;
                this.initializePanzoom();

                // open the start element menu on load
                const startElementGuid = this.getStartElementGuid();
                const startElement = this.flowModel[startElementGuid];
                const containerGeometry = this.getDomElementGeometry(this._flowContainerElement);

                const interactionState = {
                    ...this._flowRenderContext.interactionState,
                    menuInfo: { key: startElementGuid, type: MenuType.NODE, needToPosition: false },
                    deletionPathInfo: null
                };

                const event = new ToggleMenuEvent({
                    top: containerGeometry.y - MENU_ICON_SIZE / 2,
                    left: containerGeometry.x - MENU_ICON_SIZE / 2,
                    offsetX: 0,
                    type: MenuType.NODE,
                    guid: startElementGuid,
                    elementMetadata: this._flowRenderContext.elementsMetadata[startElement.elementType]
                });

                this.openMenu(event, interactionState);
            }
        }

        const menuElement = this.getOpenedMenu();

        if (menuElement != null) {
            const { w, h } = this.getDomElementGeometry(menuElement);

            const interactionState = this._pendingInteractionState || this._flowRenderContext.interactionState;
            const menuInfo = interactionState.menuInfo!;
            const { geometry } = menuInfo;

            this._pendingInteractionState = null;

            if (geometry == null || geometry.h !== h) {
                this.updateFlowRenderContext({
                    interactionState: {
                        ...interactionState,
                        menuInfo: { ...menuInfo, geometry: { w, h, x: 0, y: 0 } }
                    }
                });
            }
        }

        // Moving focus to the expected element when entering selection mode to
        // select the GoTo target. This needs to happen in the renderedCallback since we
        // need to wait for all the nodes to re-render before moving the focus.
        if (this._elementGuidToFocus) {
            this.focusOnNode(this._elementGuidToFocus);
            this._elementGuidToFocus = null;
        }

        const numberOfElements = this.flowModel && Object.keys(this.flowModel).length;
        logPerfTransactionEnd(AUTOLAYOUT_CANVAS, { numberOfElements }, null);
    }

    /**
     * Helper function that converts this._elementsMetadata to map of elementType -> metaData
     *
     * @returns - The elements metadata map
     */
    _convertToElementMetadataMap() {
        return this._elementsMetadata!.reduce((acc, elementMetadata) => {
            acc[elementMetadata.elementType] = elementMetadata;
            return acc;
        }, {});
    }

    /**
     * Creates the initial flow render context
     *
     * @returns A new flow render context
     */
    createInitialFlowRenderContext(): FlowRenderContext {
        // transforms the elementsMetadata array to a map
        const elementsMetadataMap = this._convertToElementMetadataMap();

        return {
            flowModel: this.flowModel,
            nodeLayoutMap: {},
            interactionState: {
                menuInfo: { key: this.getStartElementGuid(), type: MenuType.NODE }
            },
            elementsMetadata: elementsMetadataMap,
            layoutConfig: { ...getDefaultLayoutConfig() },
            isDeletingBranch: false,
            dynamicNodeDimensionMap: new Map<Guid, Dimension>()
        } as FlowRenderContext;
    }

    /**
     * Handles a elements selection change
     */
    handleSelectionModeChange() {
        if (this.isSelectionMode) {
            this.closeNodeOrConnectorMenu();
            if (this.autoLayoutCanvasContext.mode === AutoLayoutCanvasMode.RECONNECTION) {
                const firstSelectableElementGuid = getFirstSelectableElementGuid(this.flowModel, 'root');
                if (firstSelectableElementGuid) {
                    // Setting _elementGuidToFocus to firstSelectableElementGuid so that
                    // we can set focus on the correct node during the renderedCallback
                    this._elementGuidToFocus = firstSelectableElementGuid;
                }
            }
        } else {
            this._topSelectedGuid = null;
            this._goToSourceGuid = null;
            this._isReroutingGoto = false;
            this._goToSourceBranchIndex = null;
            this._currentTargetGuid = null;
            this._mergeableGuids = [];
            this._goToableGuids = [];
            this._firstMergeableNonNullNext = null;

            // make all elements selectable and unselected when exiting selection mode
            if (this.flowModel != null) {
                const allGuids = Object.keys(this.flowModel);
                const alcSelectionEvent = new AlcSelectionEvent([], allGuids, allGuids, null);
                this.dispatchEvent(alcSelectionEvent);
            }
        }
    }

    /**
     * Updates the flow render context, and triggers a rerender
     *
     * @param {FlowRenderContext} flowRenderContext - One or more flow render context properties
     */
    updateFlowRenderContext(flowRenderContext = {}) {
        if (this._elementsMetadata == null || this.flowModel == null || this._canvasElement == null) {
            return;
        }

        const isFirstRender = this._flowRenderContext == null;

        if (isFirstRender) {
            this.rerender = this.disableDebounce ? this.rerender : debounce(this.rerender, 10);
            this._flowRenderContext = this.createInitialFlowRenderContext();
            this._scale = MAX_ZOOM;

            // Note the number of dynamic node components we have.  A spinner will be shown
            // until they've all rendered
            const nodes: { elementType: string }[] = Object.values(this.flowModel);

            let count = 0;
            nodes.forEach((node) => {
                const metadata = this._flowRenderContext.elementsMetadata[node.elementType];
                if (metadata && metadata.dynamicNodeComponent) {
                    count++;
                }
            });

            this.dynamicNodeCountAtLoad = count;
        }

        this._flowRenderContext = Object.assign(this._flowRenderContext, flowRenderContext);
        this.rerender(isFirstRender);
    }

    /**
     * Zoom to full scale when clicking on a node or connector button
     *
     * @param obj - an object
     * @param obj.top  - The top position of the menu button
     * @param obj.left - The left position of the menu button
     * @param {number} menuButtonHalfWidth - The half width of the menu button
     */
    zoomForMenuDisplay({ top, left }, menuButtonHalfWidth) {
        const { x, y } = this.getDomElementGeometry(this._canvasElement);

        const buttonOffset = menuButtonHalfWidth * this.scale;
        top = top - y + buttonOffset;
        left = left - x + buttonOffset;

        this.handleZoomAction(SYNTHETIC_ZOOM_TO_VIEW_EVENT, { top, left });
    }

    /**
     * Hack required to process double clicks on an element when a menu is opened (See @W-8984298):
     *
     * Since the first click of a double click will close the previously opened menu,
     * the second click might not land on the element as it might have changed location
     * because of the new layout. As a workaround, we create a transiant transplarent
     * overlay over the whole canvas to capture the second click and process it.
     *
     * see @W-8984298
     */
    handleOverlayClick() {
        this.dispatchEvent(new EditElementEvent(this.lastClickedElementGuid));
        this.lastClickedElementGuid = null;
    }

    handleMenuPositionUpdate(event) {
        let menuInfo = this._flowRenderContext.interactionState.menuInfo!;

        if (menuInfo != null && menuInfo.needToPosition) {
            this.lastClickedElementGuid = menuInfo.key;

            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                // clear the guid after the double click threshold is exceeded
                this.lastClickedElementGuid = null;
            }, DOUBLE_CLICK_THRESHOLD);

            this._animatePromise.then(() => {
                menuInfo = { ...menuInfo, needToPosition: false };

                const interactionState = { ...this._flowRenderContext.interactionState, menuInfo };

                const menuButtonHalfWidth =
                    menuInfo.type === MenuType.CONNECTOR ? CONNECTOR_ICON_SIZE / 2 : MENU_ICON_SIZE / 2;
                const containerGeometry = this.getDomElementGeometry(this._flowContainerElement);

                this.menu = Object.assign(
                    getAlcMenuData(
                        event,
                        menuButtonHalfWidth,
                        containerGeometry,
                        this._scale,
                        this._flowRenderContext,
                        menuInfo.needToPosition
                    ),
                    { elementsMetadata: this._elementsMetadata }
                );

                this.updateFlowRenderContext({ interactionState });
            });
        }
    }

    /**
     * Toggles the node or connector menu
     *
     * @param {ToggleMenuEvent} event - the toggle menu event
     */
    handleToggleMenu = (event) => {
        const { detail } = event;
        const { type, elementMetadata } = detail;
        const isNodeMenu = type === MenuType.NODE;

        // return if a node doesn't support a menu
        if (isNodeMenu && !elementMetadata.supportsMenu) {
            return;
        }

        if (event.detail.isPositionUpdate && this.menu != null && this.menu.style != null) {
            return;
        }

        const interactionState = toggleFlowMenu(detail, this._flowRenderContext.interactionState);

        if (interactionState.menuInfo != null) {
            if (this.scale === MAX_ZOOM) {
                this.openMenu(event, interactionState);
            } else {
                const connectorMenu = event.detail.type;
                const menuButtonHalfWidth =
                    connectorMenu === MenuType.CONNECTOR ? CONNECTOR_ICON_SIZE / 2 : MENU_ICON_SIZE / 2;
                this.zoomForMenuDisplay(event.detail, menuButtonHalfWidth);
                this._interactionStateAfterZoom = toggleFlowMenu(detail, this._flowRenderContext.interactionState);
                this._eventOpenMenuAfterZoom = event;
            }
        } else {
            this.menu = null;
            this._pendingInteractionState = null;
            this.updateFlowRenderContext({ interactionState });
        }
    };

    handleCloseMenu = (event) => {
        event.stopPropagation();
        this.closeNodeOrConnectorMenu();
    };

    openMenuAfterClick() {
        if (this._eventOpenMenuAfterZoom && this._interactionStateAfterZoom) {
            this.openMenu(this._eventOpenMenuAfterZoom, this._interactionStateAfterZoom);
            this._eventOpenMenuAfterZoom = null;
            this._interactionStateAfterZoom = null;
        }
    }

    /**
     * Opens the connector or node menu
     *
     * @param event - The event
     * @param interactionState - The interaction state
     */
    openMenu(event: ToggleMenuEvent, interactionState: FlowInteractionState) {
        this.menuOpacityClass = FULL_OPACITY_CLASS;

        const connectorMenu = event.detail.type;

        const menuButtonHalfWidth = connectorMenu === MenuType.CONNECTOR ? CONNECTOR_ICON_SIZE / 2 : MENU_ICON_SIZE / 2;
        const containerGeometry = this.getDomElementGeometry(this._flowContainerElement);

        this.menu = Object.assign(
            getAlcMenuData(
                event,
                menuButtonHalfWidth,
                containerGeometry,
                this._scale,
                this._flowRenderContext,
                interactionState.menuInfo!.needToPosition
            ),
            { elementsMetadata: this._elementsMetadata }
        );
        this.moveFocusToMenu = event.detail.moveFocusToMenu;

        this._pendingInteractionState = interactionState;
    }

    /**
     * Handles the "Add GoTo" connector menu item selection
     *
     * @param event - The Goto path event
     */
    handleAddOrRerouteGoToItemSelection = (event) => {
        event.stopPropagation();

        const { prev, parent, childIndex, next, canMergeEndedBranch, isReroute } = event.detail;
        this._goToSourceGuid = prev || parent;
        this._goToSourceBranchIndex = childIndex;
        this._currentTargetGuid = next;
        this._isReroutingGoto = isReroute;

        const { mergeableGuids, goToableGuids, firstMergeableNonNullNext } = getTargetGuidsForReconnection(
            this.flowModel,
            prev,
            parent,
            next,
            canMergeEndedBranch,
            childIndex
        );
        this._mergeableGuids = mergeableGuids;
        this._goToableGuids = goToableGuids;
        this._firstMergeableNonNullNext = firstMergeableNonNullNext;

        const selectableGuids = firstMergeableNonNullNext
            ? [...mergeableGuids, ...goToableGuids, firstMergeableNonNullNext]
            : [...mergeableGuids, ...goToableGuids];

        this.dispatchEvent(new ToggleSelectionModeEvent());
        const alcSelectionEvent = new AlcSelectionEvent([], [], selectableGuids, null, true);
        this.dispatchEvent(alcSelectionEvent);
    };

    dispatchAlcSelectionEvent({ isSelected, canvasElementGUID }) {
        logPerfTransactionStart(AUTOLAYOUT_CANVAS_SELECTION, null, null);
        // transforms the elementsMetadata array to a map
        const elementsMetadataMap = this._convertToElementMetadataMap();
        const flowModel = this.flowModel;

        const {
            canvasElementGuidsToSelect,
            canvasElementGuidsToDeselect,
            selectableCanvasElementGuids,
            topSelectedGuid
        } = !isSelected
            ? getCanvasElementSelectionData(elementsMetadataMap, flowModel, canvasElementGUID, this._topSelectedGuid)
            : getCanvasElementDeselectionData(elementsMetadataMap, flowModel, canvasElementGUID, this._topSelectedGuid);

        this._topSelectedGuid = topSelectedGuid;

        const alcSelectionEvent = new AlcSelectionEvent(
            canvasElementGuidsToSelect,
            canvasElementGuidsToDeselect,
            selectableCanvasElementGuids,
            this._topSelectedGuid
        );
        this.dispatchEvent(alcSelectionEvent);
        logPerfTransactionEnd(
            AUTOLAYOUT_CANVAS_SELECTION,
            {
                numberOfSelectedElements: canvasElementGuidsToSelect.length,
                numberOfDeselectedElements: canvasElementGuidsToDeselect.length
            },
            null
        );
    }

    /**
     * Handles node selection and deselection
     *
     * @param event - The Selected Deselected event
     */
    handleNodeSelectionDeselection = (event) => {
        event.stopPropagation();
        if (this._goToSourceGuid != null) {
            if (this._goToableGuids.includes(event.detail.canvasElementGUID)) {
                this.dispatchEvent(
                    new CreateGoToConnectionEvent(
                        this._goToSourceGuid,
                        this._goToSourceBranchIndex,
                        event.detail.canvasElementGUID,
                        this._isReroutingGoto
                    )
                );
            } else if (this._mergeableGuids.includes(event.detail.canvasElementGUID)) {
                let sourceElement;
                let source: ConnectionSource;
                if (this._isReroutingGoto) {
                    // When a GoTo is present we need to use _goToSourceBranchIndex to generate the source
                    sourceElement = this.flowModel[this._goToSourceGuid];
                    source = { guid: sourceElement.guid, childIndex: this._goToSourceBranchIndex };
                } else {
                    sourceElement = this.flowModel[this._currentTargetGuid!];
                    const { prev, childIndex, parent } = sourceElement;
                    source = { guid: parent || prev, childIndex };
                }

                this.dispatchEvent(new AlcCreateConnectionEvent(source, event.detail.canvasElementGUID));
            } else if (this._firstMergeableNonNullNext === event.detail.canvasElementGUID) {
                this.dispatchEvent(
                    new DeleteElementEvent(
                        [this._currentTargetGuid!],
                        this.flowModel[this._currentTargetGuid!].elementType,
                        null
                    )
                );
            }
            this.dispatchEvent(new ToggleSelectionModeEvent());
        } else {
            this.dispatchAlcSelectionEvent(event.detail);
        }
    };

    /**
     * Clears the deletionPathInfo from the interaction state that in turn clears the highlighted
     * path on the canvas
     */
    handleClearHighlightedPath = () => {
        const interactionState = clearDeletionPathInfo(this._flowRenderContext.interactionState);
        this.updateFlowRenderContext({ interactionState });
    };

    /**
     * Highlights the path to be deleted
     *
     * @param event - The HighlightPathsToDelete event
     */
    handleHighlightPathsToDelete = (event) => {
        const { elementGuidToDelete, childIndexToKeep } = event.detail;
        const elementToDelete = resolveParent(this.flowModel, elementGuidToDelete);

        const shouldHighlightBeyondMergingPoint = !!(
            shouldDeleteGoToOnNext(this.flowModel, elementToDelete, childIndexToKeep) ||
            (elementToDelete.next &&
                childIndexToKeep != null &&
                isBranchTerminal(this.flowModel, elementToDelete, childIndexToKeep))
        );

        const interactionState = updateDeletionPathInfo(
            event.detail.elementGuidToDelete,
            event.detail.childIndexToKeep,
            this._flowRenderContext.interactionState,
            shouldHighlightBeyondMergingPoint
        );
        this.updateFlowRenderContext({ interactionState });
    };

    /**
     * Handles moving focus to the connector from the Connector Menu
     *
     * @param event - moveFocusToConnector event coming from connectorMenu
     */
    handleMoveFocusToConnector = (event: MoveFocusToConnectorEvent) => {
        event.stopPropagation();
        this.focusOnConnector(event.detail.focusGuid, event.detail.index);
    };

    /**
     * Handles moving focus to the node from the Start/Regular Node Menu
     *
     * @param event - moveFocusToNode event coming from nodeMenu or startMenu
     */
    handleMoveFocusToNode = (event: MoveFocusToNodeEvent) => {
        event.stopPropagation();
        this.focusOnNode(event.detail.focusGuid);
    };

    handleTabOnMenuTrigger = (event: TabOnMenuTriggerEvent) => {
        event.stopPropagation();
        this.moveFocusToMenu = true;
        const { shift } = event.detail;
        const openedMenu = this.getOpenedMenu();
        if (openedMenu) {
            openedMenu.moveFocus(shift);
        }
    };

    /**
     * Re-renders the flow
     *
     * @param {boolean} isFirstRender - true if it's the first time rendering the flow
     */
    rerender = (isFirstRender) => {
        if (this._isDisconnected) {
            // return if disconnected; this may occur because of debouncing
            return;
        }

        calculateFlowLayout(this._flowRenderContext);

        if (
            isFirstRender ||
            this.disableAnimation ||
            this.dynamicNodeCountAtLoad > this._flowRenderContext.dynamicNodeDimensionMap.size ||
            !this.initialStartMenuDisplayed
        ) {
            // first render, no animation
            this.renderFlow(1);

            this.initialStartMenuDisplayed =
                this.initialStartMenuDisplayed || this.template.querySelector(selectors.startMenu) != null;

            // reset the nodeLayoutMap to prevent animations until the start menu has been displayed
            if (!this.initialStartMenuDisplayed) {
                this._flowRenderContext.nodeLayoutMap = {};
            }
        } else {
            const { menuInfo } = this._flowRenderContext.interactionState;

            // 10ms animation when needToPosition
            const duration = menuInfo != null && menuInfo.needToPosition ? 10 : undefined;

            this._animatePromise = animate((progress) => this.renderFlow(progress), duration);
        }
    };

    /**
     * Initializes the panzoom object
     */
    initializePanzoom() {
        this._panzoom = panzoom(this._flowContainerElement, {
            smoothScroll: false,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            // disable wheel zoom
            beforeWheel: () => true,

            // disable touch zoom
            onTouch: () => true,

            // disable double click zoom
            onDoubleClick: () => true,

            // disable pinch zoom
            pinchSpeed: 1,

            // disable zoom keys
            filterKey: () => true
        });

        const boundFunction = () => this.openMenuAfterClick();
        this._panzoom.on('zoomend', boundFunction);
        this.panzoomMoveToCenterTop();
        this._panzoomOffsets = { x: 0, y: 0 - (this.getFlowHeight() * MIN_ZOOM) / 2 };
        this._panzoom.on('pan', () => {
            this.isPanInProgress = true;
        });
        this._panzoom.on('panend', () => {
            this.isPanInProgress = false;
        });
    }

    /**
     * Centers the flow
     */
    panzoomMoveToCenterTop() {
        this._panzoom.moveTo(this.getDomElementGeometry(this._canvasElement).w / 2, 0);
    }

    /**
     * Renders the flow
     *
     * @param {number} progress - the animation progress with domain [0, 1]
     */
    renderFlow(progress) {
        this._flowRenderInfo = renderFlow(this._flowRenderContext, progress);
        this.flow = getAlcFlowData(this._flowRenderInfo, { guid: NodeType.ROOT } as NodeRenderInfo, 0);
    }

    /**
     * Returns the natural height of the flow (without scaling)
     *
     * @returns the non-scaled height of the flow
     */
    getFlowHeight() {
        return this._flowRenderInfo.geometry.h;
    }

    /**
     * Returns a Geometry object for a DOM element
     *
     * @param {Object} domElement - a DOM element
     * @returns The Geometry for the DOM element
     */
    getDomElementGeometry(domElement) {
        const { left, right, top, bottom } = domElement.getBoundingClientRect();
        return { x: left, y: top, w: right - left, h: bottom - top };
    }

    /**
     * Returns the coordinates of the center of the canvas
     *
     * @returns - The canvas center
     */
    getCanvasCenter() {
        const { w, h } = this.getDomElementGeometry(this._canvasElement);

        return {
            left: w / 2,
            top: h / 2
        };
    }

    /**
     * Handles a zoom action
     *
     * @param {Object} event - An event with the zoom action
     * @param {Object} position - The coords of the mouse click
     */
    handleZoomAction = (event, position = this.getCanvasCenter()) => {
        let { top, left } = position;
        const zoomAction = event.detail.action;

        let closeMenu = this.menu != null;
        let scale = this.scale;

        switch (zoomAction) {
            case ZOOM_ACTION.ZOOM_OUT:
                scale -= ZOOM_SCALE_STEP;
                scale = Math.max(scale, MIN_ZOOM);
                break;
            case ZOOM_ACTION.ZOOM_IN:
                scale += ZOOM_SCALE_STEP;
                scale = Math.min(scale, MAX_ZOOM);
                break;
            case ZOOM_ACTION.ZOOM_TO_VIEW:
                if (scale + FUDGE < MAX_ZOOM) {
                    scale = MAX_ZOOM / scale;
                } else {
                    return;
                }
                closeMenu = false;
                break;
            case ZOOM_ACTION.ZOOM_TO_FIT:
                // center top
                top = 0;
                this._panzoomOffsets = { x: 0, y: 0 };
                ({ left } = this.getCanvasCenter());
                this.panzoomMoveToCenterTop();

                scale = Math.min(this.getDomElementGeometry(this._canvasElement).h / this.getFlowHeight(), MAX_ZOOM);
                break;
            default:
        }

        if (closeMenu) {
            this.closeNodeOrConnectorMenu();
        }

        const { x, y } = this._panzoomOffsets;
        if (zoomAction === ZOOM_ACTION.ZOOM_TO_VIEW) {
            /**
             * smoothZoom is using  scale: scaleMultiplier * fromValue
             * fromValue is the actual scale
             * scaleMultiplier is the third parameter of the function.
             * smoothZoomAbs does not trigger the zoomEnd event that we need in this case.
             */
            this._panzoom.smoothZoom(left + x, top + y, scale);
            scale = MAX_ZOOM;
        } else {
            this._panzoom.smoothZoomAbs(left + x, top + y, scale);
        }
        this.scale = scale;
    };

    setupCommandsAndShortcuts = () => {
        // Zoom In Command
        const zoomInCommand = new ZoomInCommand(() => this.handleZoomAction(new ClickToZoomEvent(ZOOM_ACTION.ZOOM_IN)));
        this.keyboardInteractions.setupCommandAndShortcut(zoomInCommand, {
            ctrlOrCmd: true,
            alt: true,
            key: '»'
        });

        // Zoom Out Command
        const zoomOutCommand = new ZoomOutCommand(() =>
            this.handleZoomAction(new ClickToZoomEvent(ZOOM_ACTION.ZOOM_OUT))
        );
        this.keyboardInteractions.setupCommandAndShortcut(zoomOutCommand, {
            ctrlOrCmd: true,
            alt: true,
            key: '½'
        });

        // Zoom To Fit Command
        const zoomToFitCommand = new ZoomToFitCommand(() =>
            this.handleZoomAction(new ClickToZoomEvent(ZOOM_ACTION.ZOOM_TO_FIT))
        );
        this.keyboardInteractions.setupCommandAndShortcut(zoomToFitCommand, {
            ctrlOrCmd: true,
            alt: true,
            key: '1'
        });

        // Zoom To View Command
        const zoomToViewCommand = new ZoomToViewCommand(() =>
            this.handleZoomAction(new ClickToZoomEvent(ZOOM_ACTION.ZOOM_TO_VIEW))
        );
        this.keyboardInteractions.setupCommandAndShortcut(zoomToViewCommand, {
            ctrlOrCmd: true,
            alt: true,
            key: '0'
        });
    };

    connectedCallback() {
        this.keyboardInteractions.addKeyDownEventListener(this.template);
        this.setupCommandsAndShortcuts();
    }

    disconnectedCallback() {
        this._isDisconnected = true;
        this.keyboardInteractions.removeKeyDownEventListener(this.template);
    }

    handleCanvasClick = (event) => {
        event.stopPropagation();

        this.closeNodeOrConnectorMenu();
        const closePropertyEditorEvent = new ClosePropertyEditorEvent();
        this.dispatchEvent(closePropertyEditorEvent);
    };

    /**
     * Handling mouse up event for canvas. If panning is not in progress and mouse up happens directly on canvas/innerCanvas
     * then dispatch the canvas mouse up event to deselect all the selected canvas elements and connectors. Also reset
     * the the panning variables.
     *
     * @param {object} event - mouse up event
     */
    handleCanvasMouseUp = (event) => {
        // We need the this.isPanInProgress check here so that we don't deselect elements when the user ends panning
        if (
            !this._isSelectionMode &&
            !this.isPanInProgress &&
            event.currentTarget &&
            (event.currentTarget.classList.contains('canvas') ||
                event.currentTarget.classList.contains('flow-container'))
        ) {
            const canvasMouseUpEvent = new CanvasMouseUpEvent();
            this.dispatchEvent(canvasMouseUpEvent);
        }
        this.isPanInProgress = false;
    };

    /**
     * Add the dimension information for the guid to dynamicNodeDimensionMap
     * Which will be used during flow rendering to ensure layout respects
     * the dimensions of nodes with dynamicNodeComponents.
     *
     * @param event - The NodeResizeEvent event
     */
    handleDynamicNodeRender = (event: NodeResizeEvent) => {
        event.stopPropagation();
        const { width, height } = event.detail;

        // scale dimensions to account for zooming, and add them to the map
        this._flowRenderContext.dynamicNodeDimensionMap.set(event.detail.guid, {
            w: width / this.scale,
            h: height / this.scale
        });

        // Wait for all dynamic components from the initial load to render (and thuws have dimensions)
        // before calculating layout.
        //
        // When new dynamic node component nodes are added later, the flow render context is
        // updated immediately
        if (this._flowRenderContext.dynamicNodeDimensionMap.size >= this.dynamicNodeCountAtLoad) {
            this.updateFlowRenderContext();
        }
    };

    handleDeleteElement = (event) => {
        const { selectedElementGUID } = event.detail;
        const elementToDelete = this.flowModel[selectedElementGUID[0]];
        const focusGuid = elementToDelete.prev || elementToDelete.parent;
        this.focusOnConnector(focusGuid, elementToDelete.childIndex);
    };

    handleBranchElementDeletion = (event: DeleteBranchElementEvent) => {
        const { selectedElementGUID, selectedElementType, childIndexToKeep } = event.detail;
        const selectedElement = this.flowModel[selectedElementGUID[0]];
        if (childIndexToKeep != null) {
            if (
                selectedElement.next &&
                isBranchTerminal(this.flowModel, selectedElement, childIndexToKeep) &&
                this.flowModel[selectedElement.next!].nodeType !== NodeType.END &&
                !hasGoToOnNext(this.flowModel, selectedElement.guid)
            ) {
                // When the branch to persist is terminated and the deleting element's next is not an end element
                // or a GoTo target, a warning modal would be invoked, otherwise a DeleteElementEvent would be dispatched
                invokeModal({
                    headerData: {
                        headerTitle: LABELS.deleteWarningHeaderTitle
                    },
                    bodyData: {
                        bodyTextOne: LABELS.deleteWarningBodyTextLabel,
                        bodyVariant: modalBodyVariant.WARNING_ON_CANVAS_MODE_TOGGLE
                    },
                    footerData: {
                        buttonOne: {
                            buttonVariant: 'Brand',
                            buttonLabel: LABELS.cancelButtonLabel
                        },
                        buttonTwo: {
                            buttonLabel: LABELS.confirmDeleteLabel,
                            buttonCallback: () => {
                                this.dispatchEvent(
                                    new DeleteElementEvent(selectedElementGUID, selectedElementType, childIndexToKeep)
                                );
                            }
                        }
                    },
                    headerClass: 'slds-theme_alert-texture slds-theme_warning',
                    bodyClass: 'slds-p-around_medium'
                });
            } else {
                this.dispatchEvent(new DeleteElementEvent(selectedElementGUID, selectedElementType, childIndexToKeep));
            }
        } else {
            this.dispatchEvent(new DeleteElementEvent(selectedElementGUID, selectedElementType, childIndexToKeep));
        }
        const focusGuid = selectedElement.prev || selectedElement.parent;
        this.focusOnConnector(focusGuid, selectedElement.childIndex);
    };
}
