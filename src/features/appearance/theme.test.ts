import {
  THEME_STORAGE_KEY,
  applyThemePreference,
  readThemePreference,
  writeThemePreference,
  type ThemePreference,
} from './theme'

describe('theme preference', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it.each<ThemePreference>(['system', 'light', 'dark'])(
    'round-trips the %s preference through localStorage',
    (preference) => {
      writeThemePreference(preference)

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(preference)
      expect(readThemePreference()).toBe(preference)
    },
  )

  it('falls back to system when storage is missing or invalid', () => {
    expect(readThemePreference()).toBe('system')

    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia')

    expect(readThemePreference()).toBe('system')
  })

  it('applies explicit themes and clears the override for system', () => {
    applyThemePreference('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

    applyThemePreference('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    applyThemePreference('system')
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })
})
