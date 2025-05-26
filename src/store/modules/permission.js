const state = {
  currentRoutes: {}
}

const mutations = {
  SET_CURRENT_ROUTES: (state, routes) => {
    state.currentRoutes = routes
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
