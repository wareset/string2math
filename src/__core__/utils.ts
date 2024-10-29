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

export function isFunction(v: any): v is Function {
  return typeof v === 'function'
}

export const objectHasOwn =
  Object.hasOwn ||
  (function (o, k) {
    return Object.prototype.hasOwnProperty.call(o, k)
  } as typeof Object.hasOwn)
