export const arrayConcat = Array.prototype.concat

function concat<T>(...args: (T | T[])[]): T[]
function concat(): any {
  return arrayConcat.apply([], arguments as any)
}
export { concat }

// export function at<T>(a: T[], index: number): T | undefined {
//   return index < 0 ? a[a.length + index] : a[index]
// }

export function last<T>(a: T[]): T | undefined {
  return a[a.length - 1]
}

export const arrayPush = Array.prototype.push

// export const is_equal_with_zero =
//   Object.is ||
//   ((function(x: any, y: any): boolean {
//     return x === y
//       ? x !== 0 || 1 / x === 1 / y
//       : x !== x && y !== y
//   }) as typeof Object.is)
