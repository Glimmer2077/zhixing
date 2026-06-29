export type Clock = () => number

export const now: Clock = () => Date.now()
