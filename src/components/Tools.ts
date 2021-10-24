export default class Tools {
  /**
   * Returns number from (min, max) range - not inclusive.
   * @param {number} min - min of range.
   * @param {number} max - max of range.
   */
  static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Returns number from <min, max> range - inclusive.
   * @param {number} min - min of range.
   * @param {number} max - max of range.
   */
  static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}