import { BoardMapTile } from './interfaces';

/** Custom Event fired when balls are deleted. */
export interface BallsDeletedEvent extends CustomEvent {
    detail: {
        /** Deleted balls. */
        balls: BoardMapTile[];
        /** Points earned from move. */
        points: number;
    };
}

/** Custom Event fired when new balls are generated on the board. */
export interface BallsGeneratedEvent extends CustomEvent {
    /** Generated balls. */
    detail: BoardMapTile[];
}