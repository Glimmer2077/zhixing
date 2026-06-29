import { act, renderHook } from '@testing-library/react'

import { PATH_STORAGE_KEY, useNavigation } from './useNavigation'

describe('useNavigation', () => {
  it('starts from a persisted path', () => {
    window.localStorage.setItem(PATH_STORAGE_KEY, JSON.stringify(['work', 'deep-work']))

    const { result } = renderHook(() => useNavigation())

    expect(result.current.path).toEqual(['work', 'deep-work'])
    expect(window.history.state).toEqual({ zhixingPath: ['work', 'deep-work'] })
  })

  it('persists push, pop, and reset changes', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => result.current.push('work'))
    expect(readStoredPath()).toEqual(['work'])

    act(() => result.current.push('deep-work'))
    expect(readStoredPath()).toEqual(['work', 'deep-work'])

    act(() => result.current.pop())
    expect(readStoredPath()).toEqual(['work'])

    act(() => result.current.reset())
    expect(readStoredPath()).toEqual([])
  })

  it('ignores malformed persisted paths', () => {
    window.localStorage.setItem(PATH_STORAGE_KEY, JSON.stringify(['work', 1]))

    const { result } = renderHook(() => useNavigation())

    expect(result.current.path).toEqual([])
    expect(readStoredPath()).toEqual([])
  })
})

const readStoredPath = (): unknown =>
  JSON.parse(window.localStorage.getItem(PATH_STORAGE_KEY) ?? '')
