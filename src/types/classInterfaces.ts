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
    checkAllAxis: Function;
    checkAxis: Function;
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