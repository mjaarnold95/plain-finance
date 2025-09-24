// server/db.js
const state = new Map();
// map userId -> { accessToken, cursor }
export function getUser(userId) { return state.get(userId) || {}; }
export function setUser(userId, patch) {
    const prev = state.get(userId) || {}; state.set(userId, { ...prev, ...patch });
}
