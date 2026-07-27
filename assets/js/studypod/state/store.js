/**
 * Simple pub/sub store — fixed for Preclinic integration
 */
export function createStore(initial = {}) {
  const listeners = new Map();
  const state = {
    currentUserId: initial.currentUserId || null,
    currentRole: initial.currentRole || null,
    activeConversationId: initial.activeConversationId || null,
    leftCollapsed: false,
    rightCollapsed: false,
    ...initial,
  };
  function subscribe(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => listeners.get(event).delete(fn);
  }
  function publish(event, data) {
    const set = listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(data); } catch (e) { console.error("store publish error", e); }
    }
  }
  function setState(patch) { Object.assign(state, patch); publish("state:changed", { ...state }); }
  function getState() { return { ...state }; }
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (!e.key || !e.key.startsWith("studyPod_")) return;
      switch (e.key) {
        case "studyPod_conversations": publish("conversations:changed", null); break;
        case "studyPod_messages": publish("messages:changed", null); break;
        case "studyPod_offers": publish("offers:changed", null); break;
        case "studyPod_profiles": publish("profiles:changed", null); break;
        case "studyPod_stats": publish("stats:changed", null); break;
      }
    });
  }
  return { subscribe, publish, setState, getState };
}
