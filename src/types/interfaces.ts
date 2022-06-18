import Board from '../classes/Board';

/**
 * Tile used in board process
 * @extends Coordinates
 */
export interface BoardProcessTile extends Coordinates {
    /** Index of next step while pathfinding from start to finish. */
    pathHelper?: number;

    /** Type of tile. */
    type?: string;

    /** Whether tile has already assigned path's algorithm data or not. */
    wasSearched: boolean;
}

/** Game board data */
export interface BoardData {
    /** Board height. */
    height: number;

    /** Board instance. */
    instance?: Board;

    /** Board width. */
    width: number;
}

/**
 * Data of tile used in BoardMap.
 * This is the same as BoardMapTile, but doesn't directly reference BoardMap as it's purpose is to model new tiles
 * @extends BoardMapTile
 */
export interface BoardMapTileData extends BoardMapTile {}

/**
 * Tile used in BoardMap
 * @extends Coordinates
 */
export interface BoardMapTile extends Coordinates {
    /** Tile's color. */
    color: string | null;
    /** Tile's type. */
    type: string;
}

/** Coordinates of a tile */
export interface Coordinates {
    /** Horizontal coordinate of tile. */
    x: number | null;

    /** Vertical coordinate of tile. */
    y: number | null;
}

export interface EndPoints {
    /** Ending point of path. */
    finish: Coordinates;
    /** Starting point of path. */
    start: Coordinates;
}

/** BoardMap's array. */
export type BoardMap = BoardMapTile[][];

/** BoardProcess's array. */
export type BoardProcess = BoardProcessTile[][];