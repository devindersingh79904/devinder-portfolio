// In-memory access token (not localStorage) to reduce XSS exposure.
// The long-lived refresh token lives in an httpOnly cookie set by the backend;
// on a hard reload the app calls /admin/refresh to re-hydrate this token.
let accessToken: string | null = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token: string | null) => { accessToken = token }
export const clearAccessToken = () => { accessToken = null }
