/** Interface for Board class. */
export interface BoardInterface {
    /** Object to emit and listen for board custom events. */
    eventInterface: EventTarget;
    /** Function that returns specified tile, from BoardMap. */
    getBoardMapTile: Function;
    /** Returns path obtained from board's pathfinder. */
    getPath: Function;
    /** Moves ball in boardMap data. */
    moveBall: Function;
    /** Renders new board and sets board's event handlers. */
    startGame: Function;
}

/** Interface for Collider class. */
export interface ColliderInterface {
    /** Searches for all balls that can be deleted. */
    checkAllAxis: Function;
    /** Searches horizontally and vertically for balls that can be deleted. */
    checkAxis: Function;
    /** Searches for balls that can be in a slant. */
    checkSlant: Function;
    /** Searches for balls that can be in all slants. */
    checkSlants: Function;
}

/** Interface for Pathfinder class. */
export interface PathfinderInterface {
    /** Searches for shortest path between start and end points. */
    findPath: Function;
}

/** Interface for Renderer class. */
export interface RendererInterface {
    /** Renders board in DOM. */
    renderBoard: Function;
    /** Sets board's event handlers. */
    setRenderForBoardEvents: Function;
}