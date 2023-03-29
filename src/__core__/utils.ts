function concat<T>(...args: (T | T[])[]): T[]
function concat(): any {
  return Array.prototype.concat.apply([], arguments as any)
}
export { concat }

// export function at<T>(a: T[], index: number): T | undefined {
//   return index < 0 ? a[a.length + index] : a[index]
// }

export function last<T>(a: T[]): T | undefined {
  return a[a.length - 1]
}
