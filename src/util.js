//@flow
import type {Dict} from './model'
export const map = (f:Function) => (xs:any) => xs.map(f)
export const chain = (f:Function) => (xs:{chain: Function}) => xs.chain(f)

export const filter = (f:Function) => (xs:any) => xs.filter(f)

export const compose = (...fs:Function[]) => fs.reduce((g, f) => x => g(f(x)), x => x)


export const toPairs = (dict:Dict) => Object.keys(dict).map(k => [k, dict[k]])

export const fromPairs = (pairs:[string, any][]) => pairs.reduce((dict, [k, v]) => ({...dict, [k]:v}), {})

export const contains = (x:any) => (xs:any[]) =>
  xs.indexOf(x) !== -1

export const omit = (keys:string[]) =>
  compose(fromPairs, filter(([k]) => !contains(k)(keys)), toPairs)

export const pick = (keys:string[]) => (obj:Dict) =>
  keys.reduce((o, k) => ({...o, [k] : obj[k]}), {})
