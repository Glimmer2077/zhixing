export const THEME_STORAGE_KEY = 'zhixing.theme.v1'

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

export const isThemePreference = (value: string | null): value is ThemePreference =>
  THEME_PREFERENCES.some((preference) => preference === value)

export const readThemePreference = (storage: Storage = window.localStorage): ThemePreference => {
  const storedPreference = storage.getItem(THEME_STORAGE_KEY)
  return isThemePreference(storedPreference) ? storedPreference : 'system'
}

export const writeThemePreference = (
  preference: ThemePreference,
  storage: Storage = window.localStorage,
) => {
  storage.setItem(THEME_STORAGE_KEY, preference)
}

export const applyThemePreference = (
  preference: ThemePreference,
  root: HTMLElement = document.documentElement,
) => {
  if (preference === 'system') {
    root.removeAttribute('data-theme')
    return
  }

  root.dataset.theme = preference
}
