import {
    ConnectorRenderInfo,
    LayoutConfig,
    Option,
    ConnectorVariant,
    ConditionType,
    ConnectorConnectionInfo
} from './flowRendererUtils';

import { Guid } from './model';
import ConnectorType from './ConnectorTypeEnum';
import {
    createSvgPath,
    Offset,
    createOffsetLocation,
    SvgPathParams,
    SvgInfo,
    createSvgInfo,
    Geometry
} from './svgUtils';

/**
 * Get the guid for a condition
 *
 * @param conditionOptions - The condition options
 * @param index - The condition index
 * @returns The condition value guid
 */
function getConditionValue(conditionOptions: Option[], index: number): Guid | undefined {
    if (index < conditionOptions.length) {
        return conditionOptions[index].value;
    }
}

/**
 * Creates an SvgInfo for a straight connector
 *
 * @param height - The connector height
 * @param svgMarginTop - The top margin
 * @param svgMarginBottom - The bottom margin
 * @param layoutConfig  - The layout config
 * @returns The SvgInfo for the connector
 */
function createStraightConnectorSvgInfo(
    height: number,
    svgMarginTop: number,
    svgMarginBottom: number,
    layoutConfig: LayoutConfig
): SvgInfo {
    const { strokeWidth } = layoutConfig.connector;

    if (svgMarginBottom < 0) {
        height += -svgMarginBottom;
    }

    const geometry = {
        x: -strokeWidth / 2,
        y: 0,
        w: strokeWidth,
        h: height
    };

    const path = createSvgPath({
        start: createOffsetLocation({ x: 0, y: svgMarginTop }, [strokeWidth / 2, 0]),
        offsets: [[0, height - svgMarginBottom - svgMarginTop]]
    });

    return {
        geometry,
        path
    };
}

/**
 * Creates a ConnectorRenderInfo for a connector that links a node to its next node
 *
 * @param connectionInfo - The connector connection info
 * @param connectorType - Type of the connector being created
 * @param offsetY - y offset of the connector relative to the source element
 * @param height - Height of the connector
 * @param menuOpened - True if the contextual menu is open
 * @param layoutConfig - The layout configuration
 * @param isFault - Whether this is part of a fault connector
 * @param variant - The variant for the connector
 * @param conditionOptions - The condition options
 * @param conditionType - The condition type
 * @returns The ConnectorRenderInfo for the connector
 */
function createConnectorToNextNode(
    connectionInfo: ConnectorConnectionInfo,
    connectorType: ConnectorType,
    offsetY: number,
    height: number,
    menuOpened: boolean,
    layoutConfig: LayoutConfig,
    isFault: boolean,
    variant: ConnectorVariant,
    conditionOptions?: Option[],
    conditionType?: ConditionType
): ConnectorRenderInfo {
    const { strokeWidth } = layoutConfig.connector;
    const { addOffset, labelOffset } = layoutConfig.connector.types[connectorType]!;
    const connectorConfig = layoutConfig.connector.types[connectorType]!;
    let { svgMarginTop = 0, svgMarginBottom = 0 } = connectorConfig;

    if (connectorConfig.variants != null) {
        const variantConfig = connectorConfig.variants[variant]!;
        svgMarginTop = variantConfig.svgMarginTop != null ? variantConfig.svgMarginTop : svgMarginTop;
        svgMarginBottom = variantConfig.svgMarginBottom != null ? variantConfig.svgMarginBottom : svgMarginBottom;
    }

    const geometry = { x: 0, y: offsetY, w: strokeWidth, h: height };

    return {
        geometry,
        addInfo: { offsetY: addOffset, menuOpened },
        connectionInfo,
        svgInfo: createStraightConnectorSvgInfo(height, svgMarginTop, svgMarginBottom, layoutConfig),
        labelOffsetY: labelOffset,
        type: connectorType,
        conditionOptions,
        conditionValue: conditionOptions ? getConditionValue(conditionOptions, connectionInfo.childIndex!) : undefined,
        isFault,
        conditionType
    };
}

/**
 * Returns the params needed to draw an svg for a left branch connector
 *
 * @param width - Width of the svg
 * @param height - Height of the svg
 * @param layoutConfig - The config for the layout
 * @returns The params for the branch svg path
 */
function getBranchLeftPathParams(width: number, height: number, layoutConfig: LayoutConfig): SvgPathParams {
    const { curveRadius } = layoutConfig.connector;

    return {
        start: { x: width, y: 0 },
        offsets: [
            [-width + curveRadius, 0],
            [-curveRadius, curveRadius],
            [0, height - curveRadius]
        ]
    };
}

/**
 * Returns the params needed to draw an svg for a right branch connector
 *
 * @param width - Width of the svg
 * @param height - Height of the svg
 * @param layoutConfig - The config for the layout
 * @returns The params for the branch svg path
 */
function getBranchRightPathParams(width: number, height: number, layoutConfig: LayoutConfig): SvgPathParams {
    const { curveRadius } = layoutConfig.connector;

    return {
        start: { x: 0, y: 0 },
        offsets: [
            [width - curveRadius, 0],
            [curveRadius, curveRadius],
            [0, height - curveRadius]
        ]
    };
}

/**
 * Create an SvgInfo for a branch connector
 *
 * @param width - Connector width
 * @param height - Connector height
 * @param connectorType - Left or right branch ConnectorType
 * @param layoutConfig  - The layout config
 * @returns an SvgInfo for the connector
 */
function getBranchSvgInfo(
    width: number,
    height: number,
    connectorType: ConnectorType.BRANCH_LEFT | ConnectorType.BRANCH_RIGHT,
    layoutConfig: LayoutConfig
): SvgInfo {
    const { strokeWidth } = layoutConfig.connector;
    const isLeft = connectorType === ConnectorType.BRANCH_LEFT;

    const startOffset: Offset = [strokeWidth / 2, strokeWidth / 2];

    const svgPathParams = isLeft
        ? getBranchLeftPathParams(width, height, layoutConfig)
        : getBranchRightPathParams(width, height, layoutConfig);

    return createSvgInfo(svgPathParams, startOffset);
}

/**
 * Creates a ConnectorRenderInfo for a branch connector.
 * This is the connector that joins a parent node to its outermost branch
 *
 * @param parent - The parent guid
 * @param childIndex - The child branch index
 * @param geometry - The geometry for the connector
 * @param connectorType - The branch type: left or right
 * @param layoutConfig - The config for the layout
 * @param isFault - Whether this is part of a fault connector
 * @returns a ConnectorRenderInfo for the branch connector
 */
function createBranchConnector(
    parent: Guid,
    childIndex: number,
    geometry: Geometry,
    connectorType: ConnectorType.BRANCH_LEFT | ConnectorType.BRANCH_RIGHT,
    layoutConfig: LayoutConfig,
    isFault: boolean
): ConnectorRenderInfo {
    const { w, h } = geometry;
    const svgInfo = getBranchSvgInfo(w, h, connectorType, layoutConfig);

    return {
        type: connectorType,
        geometry,
        svgInfo,
        isFault,
        connectionInfo: {
            parent,
            childIndex
        }
    };
}

/**
 * Creates a ConnectorRenderInfo for a merge connector.
 * This is the connector that joins an outermost merging branch back to its parent
 *
 * @param parent - The parent guid
 * @param childIndex - The child branch index
 * @param geometry - The geometry for the connector
 * @param connectorType - The merge type: left or right
 * @param layoutConfig  - The layout config
 * @param isFault - Whether this is part of a fault connector
 * @returns a ConnectorRenderInfo for the merge connector
 */
function createMergeConnector(
    parent: Guid,
    childIndex: number,
    geometry: Geometry,
    connectorType: ConnectorType.MERGE_LEFT | ConnectorType.MERGE_RIGHT,
    layoutConfig: LayoutConfig,
    isFault: boolean
): ConnectorRenderInfo {
    const { w, h } = geometry;
    return {
        geometry,
        svgInfo: createMergeSvgInfo(w, h, connectorType, layoutConfig),
        type: connectorType,
        isFault,
        connectionInfo: {
            parent,
            childIndex
        }
    };
}

/**
 * Create an SvgInfo for a merge connector
 *
 * @param width - Connector width
 * @param height - Connector height
 * @param connectorType - Left or right merge connector type
 * @param layoutConfig  - The layout config
 * @returns an SvgInfo for the connector
 */
function createMergeSvgInfo(
    width: number,
    height: number,
    connectorType: ConnectorType.MERGE_LEFT | ConnectorType.MERGE_RIGHT,
    layoutConfig: LayoutConfig
) {
    const { strokeWidth } = layoutConfig.connector;
    const offset: Offset = [strokeWidth / 2, 0];

    const svgPathParams =
        connectorType === ConnectorType.MERGE_LEFT
            ? getMergeLeftPathParams(width, height, layoutConfig)
            : getMergeRightPathParams(width, height, layoutConfig);

    return createSvgInfo(svgPathParams, offset);
}

/**
 * Returns the params needed to draw an svg path for a left merge connector
 *
 * @param width - The connector width
 * @param height - The connector height
 * @param layoutConfig - The layout config
 * @returns The params for the merge svg path
 */
function getMergeLeftPathParams(width: number, height: number, layoutConfig: LayoutConfig): SvgPathParams {
    const { curveRadius } = layoutConfig.connector;

    const curveOffsetY = (height - 2 * curveRadius) / 2;

    return {
        start: { x: 0, y: 0 },
        offsets: [
            [0, curveOffsetY],
            [curveRadius, curveRadius],
            [width - 2 * curveRadius, 0],
            [curveRadius, curveRadius],
            [0, curveOffsetY]
        ]
    };
}

/**
 * Returns the params needed to draw an svg path for a right merge connector
 *
 * @param width - The connector width
 * @param height - The connector height
 * @param layoutConfig - The layout config
 * @returns The params for the merge svg path
 */
function getMergeRightPathParams(width: number, height: number, layoutConfig: LayoutConfig): SvgPathParams {
    const { curveRadius } = layoutConfig.connector;

    const curveOffsetY = (height - 2 * curveRadius) / 2;

    return {
        start: { x: width, y: 0 },
        offsets: [
            [0, curveOffsetY],
            [-curveRadius, curveRadius],
            [-(width - 2 * curveRadius), 0],
            [-curveRadius, curveRadius],
            [0, curveOffsetY]
        ]
    };
}

export { createConnectorToNextNode, createMergeConnector, createBranchConnector };
