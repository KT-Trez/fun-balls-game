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
export interface BoardSize {
    /** Board height */
    height: number;

    /** Board width */
    width: number;
}

/** Coordinates of a tile */
export interface Coordinates {
    /** Horizontal coordinate of tile. */
    x: number | null;

    /** Vertical coordinate of tile. */
    y: number | null;
}

/** BoardProcess Array. */
export type BoardProcess = Array<Array<BoardProcessTile>>;