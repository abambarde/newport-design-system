import { LightningElement, api, track } from "lwc";
import { drawingLibInstance as lib} from "builder_platform_interaction/drawingLib";
import { isMultiSelect, canDelete, canZoom, setupCanvasElements, setupConnectors, checkMarqueeSelection } from "./canvasUtils";
import { SCALE_BOUNDS, getScaleAndOffsetValuesOnZoom, getOffsetValuesOnPan, getDistanceBetweenViewportCenterAndElement, isElementInViewport } from "./zoomPanUtils";
import { isCanvasElement } from "builder_platform_interaction/elementConfig";
import { AddElementEvent, DeleteElementEvent, CanvasMouseUpEvent, AddConnectionEvent, ConnectorSelectedEvent, MarqueeSelectEvent, ZOOM_ACTION, MARQUEE_ACTION } from "builder_platform_interaction/events";
import { KEYS } from "./keyConstants";
import { logPerfMarkStart, logPerfMarkEnd } from "builder_platform_interaction/loggingUtils";

/**
 * Canvas component for flow builder.
 *
 * @ScrumTeam Process UI
 * @since 214
 */

const canvas = 'canvas';

const SELECTORS = {
    CANVAS: '.canvas',
    INNER_CANVAS: '.inner-canvas'
};

const CURSOR_STYLE_GRAB = 'grab';
const CURSOR_STYLE_GRABBING = 'grabbing';
const CURSOR_STYLE_CROSSHAIR = 'crosshair';

export default class Canvas extends LightningElement {
    @api nodes = [];
    @api connectors = [];

    @track isMarqueeModeOn = false;
    @track isMarqueeInProgress = false;
    @track marqueeEndPoint = [0, 0];
    @track isZoomOutDisabled = false;
    @track isZoomInDisabled = true;
    @track isZoomToView = true;

    canvasArea;
    innerCanvasArea;

    canvasElementGuidToContainerMap = {};

    // Scaling variable used for zooming
    currentScale = 1.0;

    // Variable to keep a track of when mouse is down on the canvas
    isCanvasMouseDown = false;

    // Variable to keep a track of when panning is in progress
    isPanInProgress = false;

    // Mouse position variables used for panning
    canvasMouseDownPoint = [0, 0];
    canvasMouseMovePoint = [0, 0];

    // Scaled offsetLeft and offsetTop values when mouse down happens for panning
    scaledOffsetsOnPanStart = [0, 0];

    // Variable to keep a track of when mouse is down on the overlay
    isOverlayMouseDown = false;

    // Mouse position variables used for marquee selection
    marqueeStartPoint = [0, 0];

    // Set to keep track the current selected nodes for marquee selection
    currentSelectedCanvasElementGuids = new Set();

    constructor() {
        super();
        logPerfMarkStart(canvas);
        lib.setNewConnection(this.connectionAdded);
        lib.clickConnection(this.connectionClicked);
    }

    /**
     * Method to set up any new connections made within the canvas.
     * @param {object} connectorInfo - Contains all the information about the new connector
     */
    connectionAdded = (connectorInfo) => {
        const addConnectionEvent = new AddConnectionEvent(connectorInfo.sourceId, connectorInfo.targetId);
        this.dispatchEvent(addConnectionEvent);
    };

    /**
     * Fires connector selection event.
     * @param {object} connection - jsPlumb's connector object
     * @param {object} event - connection click event coming from drawing-lib.js
     */
    connectionClicked = (connection, event) => {
        event.stopPropagation();
        const isMultiSelectKeyPressed = isMultiSelect(event);
        const connectorSelectedEvent = new ConnectorSelectedEvent(connection.id, isMultiSelectKeyPressed);
        this.dispatchEvent(connectorSelectedEvent);
    };

    /* ********************** */
    /*     Event handlers     */
    /* ********************** */

    /**
     * Handling mouse enter event for canvas. If mouse is down while entering, initialize panning
     *
     * @param {object} event - mouse enter event
     */
    handleCanvasMouseEnter = (event) => {
        if (!this.isMarqueeModeOn && (event.buttons === 1 || event.buttons === 3)) {
            this._initPanStart(event);
        }
    };

    /**
     * Handling mouse leave event for canvas. If mouse is down while leaving then reset panning variables
     */
    handleCanvasMouseLeave = () => {
        if (this.isCanvasMouseDown) {
            this._resetPan();
        }
    };

    /**
     * Handling mouse down event for canvas. If mouse down happens on canvas then init panning with current mouse position.
     *
     * @param {object} event - mouse down event
     */
    handleCanvasMouseDown = (event) => {
        if (!this.isMarqueeModeOn) {
            this._initPanStart(event);
        }
    };

    /**
     * Handling mouse move event for canvas. Updating the offsets as the mouse moves to pan the canvas.
     *
     * @param {object} event - mouse move event
     */
    handleCanvasMouseMove = (event) => {
        if (this.isCanvasMouseDown) {
            this.isPanInProgress = true;

            // Calculating mouse coordinates on mouse move
            this.canvasMouseMovePoint = this._getMousePoint(event);

            const panConfig = {
                scaledOffsetsOnPanStart: this.scaledOffsetsOnPanStart,
                mouseDownPoint: this.canvasMouseDownPoint,
                mouseMovePoint: this.canvasMouseMovePoint
            };

            // Getting the new offset values of the innerCanvas
            const { newScaledOffsetLeft, newScaledOffsetTop } = getOffsetValuesOnPan(panConfig);

            // Updating the left and top offsets of the innerCanvas.
            if (newScaledOffsetLeft !== undefined && newScaledOffsetTop !== undefined) {
                this._updateInnerCanvasPosition(newScaledOffsetLeft, newScaledOffsetTop);
            }
        }
    };

    /**
     * Handling mouse up event for canvas. If panning is not in progress and mouse up happens directly on canvas/innerCanvas
     * then dispatch the canvas mouse up event to deselect all the selected canvas elements and connectors. Also reset
     * the the panning variables.
     *
     * @param {object} event - mouse up event
     */
    handleCanvasMouseUp = (event) => {
        this.canvasArea.focus();

        // We need the this.isPanInProgress check here so that we don't deselect elements when the user ends panning
        if (!this.isPanInProgress && event.target && (event.target.classList.contains('canvas') || event.target.classList.contains('inner-canvas'))) {
            const canvasMouseUpEvent = new CanvasMouseUpEvent();
            this.dispatchEvent(canvasMouseUpEvent);
        }

        this._resetPan();
    };

    /**
     * Handling the context menu event and resetting the pan variables.
     */
    handleCanvasContextMenu = () => {
        this._resetPan();
    };

    /**
     * Handling key down event for canvas
     *
     * @param {object} event - key down event
     */
    handleKeyDown = (event) => {
        if (canDelete(event, this.isCanvasMouseDown, this.isMarqueeModeOn)) {
            // Code block for deletion of selected canvas elements and connectors. This should not happen when mouse is
            // down on the canvas or the marquee mode is turned on
            event.preventDefault();
            const deleteEvent = new DeleteElementEvent();
            this.dispatchEvent(deleteEvent);
        } else if (canZoom(event, this.isCanvasMouseDown, this.isMarqueeInProgress)) {
            // Code block for zooming shortcuts. This should not happen when mouse is down on the canvas or the marquee
            // is in progress
            event.preventDefault();
            if (event.key === KEYS.NEGATIVE) {
                this._canvasZoom(ZOOM_ACTION.ZOOM_OUT);
            } else if (event.key === KEYS.ZERO) {
                this._canvasZoom(ZOOM_ACTION.ZOOM_TO_FIT);
            } else if (event.key === KEYS.ONE) {
                this._canvasZoom(ZOOM_ACTION.ZOOM_TO_VIEW);
            } else if (event.key === KEYS.EQUAL) {
                this._canvasZoom(ZOOM_ACTION.ZOOM_IN);
            }
        }
    };

    /**
     * Handler for when a draggable element is being dragged over the canvas.
     *
     * @param {Object} event drag over event
     */
    handleDragOver = (event) => {
        event.preventDefault();
        // NOTE: For security reasons, we don't have access to data in the dataTransfer object in
        // the drag over event. This prevents things like dom elements from other namespaces from
        // being able to see data they're not supposed to see.
        event.dataTransfer.dropEffect = 'copy';
    };

    /**
     * Handler for when a draggable element is dropped on the canvas.
     *
     * @param {Object} event drop event
     */
    handleDrop = (event) => {
        event.preventDefault();
        const elementType = event.dataTransfer.getData('text');
        if (!isCanvasElement(elementType)) {
            return;
        }

        const locationX = (event.clientX - this.innerCanvasArea.getBoundingClientRect().left) / this.currentScale;
        const locationY = (event.clientY - this.innerCanvasArea.getBoundingClientRect().top) / this.currentScale;

        const addElementEvent = new AddElementEvent(elementType, locationX, locationY);
        this.dispatchEvent(addElementEvent);
    };

    /**
     * Handling mouse enter event for overlay. If mouse is down while entering the overlay then start creating
     * the marquee box
     *
     * @param {object} event - mouse enter event
     */
    handleOverlayMouseEnter = (event) => {
        event.stopPropagation();
        if (event.buttons === 1 || event.buttons === 3) {
            this._initMarqueeBox(event);
        }
    };

    /**
     * Handling mouse leave event for overlay. Clear the marquee box and update the variables so that marquee selection
     * doesn't continue when mouse enters the canvas again.
     *
     * @param {object} event - mouse leave event
     */
    handleOverlayMouseLeave = (event) => {
        event.stopPropagation();
        if (this.isMarqueeInProgress) {
            this._clearMarqueeBox();
        }
    };

    /**
     * Handling mouse down event for overlay and initialize the marquee box.
     *
     * @param {object} event - mouse down event
     */
    handleOverlayMouseDown = (event) => {
        event.stopPropagation();
        this._initMarqueeBox(event);
        this.currentSelectedCanvasElementGuids.clear();
    };

    /**
     * Handling mouse move event for overlay. If mouse is down while mouse move happens then create the marquee box.
     *
     * @param {object} event - mouse move event
     */
    handleOverlayMouseMove = (event) => {
        event.stopPropagation();
        if (this.isOverlayMouseDown) {
            this.marqueeEndPoint = this._getMousePoint(event);
            this.isMarqueeInProgress = true;
            // Check the marquee selection elements and update their selected state if in the list
            const { canvasElementGuidsToSelect, canvasElementGuidsToDeselect, connectorGuidsToSelect, connectorGuidsToDeselect } = checkMarqueeSelection(this.nodes, this.connectors, this.currentSelectedCanvasElementGuids, this.marqueeStartPoint, this.marqueeEndPoint);
            if (canvasElementGuidsToSelect.length !== 0 || canvasElementGuidsToDeselect.length !== 0 || connectorGuidsToSelect.length !== 0 || connectorGuidsToDeselect.length !== 0) {
                const marqueeSelectEvent = new MarqueeSelectEvent(canvasElementGuidsToSelect, canvasElementGuidsToDeselect, connectorGuidsToSelect, connectorGuidsToDeselect);
                this.dispatchEvent(marqueeSelectEvent);
            }
        }
    };

    /**
     * Handling mouse up event for overlay. Clear the marquee box and update the variables accordingly.
     *
     * @param {object} event - mouse up event
     */
    handleOverlayMouseUp = (event) => {
        event.stopPropagation();
        this._clearMarqueeBox();
    };

    /**
     * Handling context menu event for overlay and clearing the marquee box.
     *
     * @param {object} event - context menu event
     */
    handleOverlayContextMenu = (event) => {
        event.stopPropagation();
        this._clearMarqueeBox();
    };

    /**
     * Handling the toggleMarqueeOn event to turn on the marquee mode.
     */
    handleMarqueeOn = () => {
        this._toggleMarqueeMode(MARQUEE_ACTION.MARQUEE_ON);
    };

    /**
     * Method to handle zooming of the flow using the zoom panel.
     *
     * @param {object} event - click to zoom event coming from zoom-panel.js
     */
    handleZoom = (event) => {
        if (event && event.detail.action) {
            this._canvasZoom(event.detail.action);
        }
    };

    /* ********************** */
    /*     Helper Methods     */
    /* ********************** */

    /**
     * Helper method to update the cursor styling.
     *
     * @param {String} cursorStyle - new cursor style
     * @private
     */
    _updateCursorStyling = (cursorStyle) => {
        if (cursorStyle === CURSOR_STYLE_GRAB) {
            this.canvasArea.classList.remove('grabbing', 'crosshair');
            this.canvasArea.classList.add('grab');
        } else if (cursorStyle === CURSOR_STYLE_GRABBING) {
            this.canvasArea.classList.remove('grab', 'crosshair');
            this.canvasArea.classList.add('grabbing');
        } else if (cursorStyle === CURSOR_STYLE_CROSSHAIR) {
            this.canvasArea.classList.remove('grab', 'grabbing');
            this.canvasArea.classList.add('crosshair');
        }
    };

    /**
     * Helper method to get the location of the mouse pointer on the canvas.
     *
     * @param {Object} event - event coming from handleCanvasMouseMove, handleOverlayMouseMove, _initPanStart and _initMarqueeBox
     * @private
     */
    _getMousePoint = (event) => {
        const mousePointX = event && event.clientX - this.canvasArea.offsetLeft;
        const mousePointY = event && event.clientY - this.canvasArea.offsetTop;

        return [mousePointX, mousePointY];
    };

    /**
     * Helper method used for initializing panning on canvas.
     *
     * @param {Object} event - event coming from handleCanvasMouseEnter and handleCanvasMouseDown
     * @private
     */
    _initPanStart = (event) => {
        this.isCanvasMouseDown = true;
        this._updateCursorStyling(CURSOR_STYLE_GRABBING);

        // Calculating mouse coordinates on mouse down
        this.canvasMouseDownPoint = this._getMousePoint(event);

        // Getting the scaled offset values of the inner canvas when mouse down happens
        this.scaledOffsetsOnPanStart = [this.innerCanvasArea.offsetLeft, this.innerCanvasArea.offsetTop];
    };

    /**
     * Helper method to reset the panning variables (isCanvasMouseDown and isPanInProgress) and updating the cursor style.
     * This is called from handleCanvasMouseLeave, handleCanvasMouseUp and handleCanvasContextMenu.
     *
     * @private
     */
    _resetPan = () => {
        this.isCanvasMouseDown = false;
        this.isPanInProgress = false;
        this._updateCursorStyling(CURSOR_STYLE_GRAB);
    };

    /**
     * Helper method to toggle the marquee mode.
     *
     * @param {String} action - Marquee action coming from handleMarqueeOn or _clearMarqueeBox
     * @private
     */
    _toggleMarqueeMode = (action) => {
        if (action === MARQUEE_ACTION.MARQUEE_ON) {
            // Enabling marquee mode
            this.isMarqueeModeOn = true;
            this._updateCursorStyling(CURSOR_STYLE_CROSSHAIR);
        } else if (action === MARQUEE_ACTION.MARQUEE_OFF) {
            // Disabling marquee mode
            this.isMarqueeModeOn = false;
            this._updateCursorStyling(CURSOR_STYLE_GRAB);
        }
    };

    /**
     * Init marquee box in canvas - set isOverlayMouseDown to true, update cursor styling and get the start point
     * for the marquee box.
     *
     * @param {Object} event - event coming from handleOverlayMouseEnter and handleOverlayMouseDown
     */
    _initMarqueeBox = (event) => {
        this.isOverlayMouseDown = true;
        this._updateCursorStyling(CURSOR_STYLE_CROSSHAIR);
        this.marqueeStartPoint = this._getMousePoint(event);
    };

    /**
     * Clear marquee box in canvas - set isOverlayMouseDown and isMarqueeInProgress to false and toggle the marquee
     * mode off
     *
     * @private
     */
    _clearMarqueeBox = () => {
        this.isOverlayMouseDown = false;
        this.isMarqueeInProgress = false;
        this._toggleMarqueeMode(MARQUEE_ACTION.MARQUEE_OFF);
    };

    /**
     * Helper method to updated the offsets of the innerCanvas.
     *
     * @param {Number} scaledOffsetLeft - left offset on a given scale
     * @param {Number} scaledOffsetTop - top offset on a given scale
     * @private
     */
    _updateInnerCanvasPosition = (scaledOffsetLeft = 0, scaledOffsetTop = 0) => {
        this.innerCanvasArea.style.left = scaledOffsetLeft + 'px';
        this.innerCanvasArea.style.top = scaledOffsetTop + 'px';
    };

    /**
     * Helper method to zoom the canvas.
     *
     * @param {String} action - Zoom action coming from handleKeyDown or handleZoom
     * @private
     */
    _canvasZoom = (action) => {
        const viewportAndOffsetConfig = {
            viewportDimensions: [this.canvasArea.clientWidth, this.canvasArea.clientHeight],
            centerOffsets: [this.innerCanvasArea.offsetLeft / this.currentScale, this.innerCanvasArea.offsetTop / this.currentScale]
        };

        // Calculating new scale and offset values. Offset values tell how much the inner canvas needs to be away from the
        // current viewport center on a given scale.
        const { newScaledOffsetLeft, newScaledOffsetTop, newScale } = getScaleAndOffsetValuesOnZoom(action, this.currentScale, viewportAndOffsetConfig, this.nodes);

        if (newScaledOffsetLeft !== undefined && newScaledOffsetTop !== undefined && newScale !== undefined) {
            this.currentScale = newScale;

            // Informing jsPlumb about the zoom level so that connectors are drawn on the new scale
            lib.setZoom(newScale);

            // Updating the scale and left and top properties of the canvas
            this.innerCanvasArea.style.transform = `scale(${this.currentScale})`;
            this._updateInnerCanvasPosition(newScaledOffsetLeft, newScaledOffsetTop);

            // Disabling and enabling zoom panel buttons based on the current scale.
            // Note: We can't simply use this.currentScale <= 0.2 because 0.200000001 is treated by the browser as 0.2 at
            // which point the button should be disabled. Removing the first condition would mean that on a scale of 0.2000001,
            // the button won't get disabled unless the button is clicked again but clicking it again won't visually change
            // anything on the screen
            this.isZoomOutDisabled = (this.innerCanvasArea.style.transform === 'scale(0.2)' || this.currentScale < SCALE_BOUNDS.MIN_SCALE);
            this.isZoomToView = this.isZoomInDisabled = (this.innerCanvasArea.style.transform === 'scale(1)');

            if ((this.isZoomOutDisabled || this.isZoomInDisabled || action === ZOOM_ACTION.ZOOM_TO_FIT || action === ZOOM_ACTION.ZOOM_TO_VIEW) && document.activeElement !== this.canvasArea) {
                this.canvasArea.focus();
            }
        }
    };

    /**
     * Public function to access the canvas element container. This is used in deletion of elements
     *
     * @param {String} guid - Guid of the canvas element for which we need the container
     * @returns {Object} Returns the canvasElementContainer associated with a given guid
     */
    @api getCanvasElementContainer(guid) {
        return this.canvasElementGuidToContainerMap[guid];
    }

    /**
     * Public function to bring the element into the viewport if it's not already present in the viewport.
     *
     * @param {String} canvasElementGuid - Guid of the element that needs to be searched and highlighted
     */
    @api panElementToViewIfNeeded = (canvasElementGuid = '') => {
        const searchedElementArray = this.nodes.filter(node => node.guid === canvasElementGuid);

        if (searchedElementArray && searchedElementArray.length === 1) {
            const searchedElement = searchedElementArray[0];

            const viewportCenterPoint = [this.canvasArea.clientWidth / 2, this.canvasArea.clientHeight / 2];

            // Calculate the new innerCanvas offsets that will bring the searched canvas element into the center of the viewport
            const { newScaledOffsetLeft, newScaledOffsetTop } = getDistanceBetweenViewportCenterAndElement(viewportCenterPoint, searchedElement.locationX, searchedElement.locationY, this.currentScale);

            const panToViewConfig = {
                originalScaledCenterOffsets: [this.innerCanvasArea.offsetLeft, this.innerCanvasArea.offsetTop],
                newScaledCenterOffsets: [newScaledOffsetLeft, newScaledOffsetTop],
                viewportCenterPoint
            };

            // In the element is current not in the viewport, we need to update our offsets to the newly calculated
            // ones and bring the searched canvas element into the center of the viewport
            if (!isElementInViewport(panToViewConfig)) {
                this._updateInnerCanvasPosition(newScaledOffsetLeft, newScaledOffsetTop);
            }
        }
    };

    renderedCallback() {
        if (!lib.getContainer()) {
            this.canvasArea = this.template.querySelector(SELECTORS.CANVAS);
            this.innerCanvasArea = this.template.querySelector(SELECTORS.INNER_CANVAS);
            lib.setContainer(this.innerCanvasArea);
        }
        const canvasElements = this.template.querySelectorAll('builder_platform_interaction-node');
        const connectors = this.template.querySelectorAll('builder_platform_interaction-connector');

        lib.setSuspendDrawing(true);

        this.canvasElementGuidToContainerMap = setupCanvasElements(canvasElements);
        setupConnectors(connectors, this.canvasElementGuidToContainerMap);

        lib.setSuspendDrawing(false, true);
        lib.repaintEverything(); // This repaint is needed otherwise sometimes the connector is not updated while doing undo/redo.
        logPerfMarkEnd(canvas, {numOfNodes: this.nodes && this.nodes.length});
    }
}
