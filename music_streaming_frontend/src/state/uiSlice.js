export const uiInitialState = {
  sidebarCollapsed: false,
};

/**
 * Action types (namespace 'ui/')
 * - ui/toggleSidebar
 * - ui/setSidebarCollapsed (payload: { collapsed: boolean })
 */
export function uiReducer(state = uiInitialState, action) {
  switch (action?.type) {
    case "ui/toggleSidebar":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "ui/setSidebarCollapsed": {
      const v = action?.payload?.collapsed;
      if (typeof v !== "boolean") return state;
      return { ...state, sidebarCollapsed: v };
    }
    default:
      return state;
  }
}
