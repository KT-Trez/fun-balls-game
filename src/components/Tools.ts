export default class Tools {
  /**
   * Returns number from (min, max) range - not inclusive.
   * @static
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
   * @static
   * @param {number} min - min of range.
   * @param {number} max - max of range.
   */
  static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Removes duplicated items from array.
   * @param array
   */
  static removeArrayDuplicates(array: any[]): any[] {
    return array.filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t) === JSON.stringify(v)))===i);
  }
}