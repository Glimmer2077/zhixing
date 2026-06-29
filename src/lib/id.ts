import { nanoid } from 'nanoid'

export type IdFactory = () => string

export const createId: IdFactory = () => nanoid()
