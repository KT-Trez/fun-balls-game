import Board from '../classes/Board';

/**
 * Tile used in boardProcessArr array.
 * @extends Coordinates
 */
export interface BoardProcessTile extends Coordinates {
    /** Number of next step while pathfinding from start to finish. */
    pathHelper?: number;

    /** Type of tile. */
    type?: string;

    /** Had tile, assigned pathHelper. */
    wasSearched: boolean;
}

/** Game board dimensions */
export interface BoardData {
    /** Board height. */
    height: number;

    /** Board instance. */
    instance?: Board;

    /** Board width. */
    width: number;
}

/**
 * Tile used in BoardMap
 * @extends Coordinates
 */
export interface BoardTile extends Coordinates {
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
export type BoardMap = BoardTile[][];

/** BoardProcess's array. */
export type BoardProcess = BoardProcessTile[][];