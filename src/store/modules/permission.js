// import { asyncRoutes, constantRoutes } from '@/router'
import { getRoutes } from '@/api/role'
import { deepClone } from '@/utils'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

function computeRoutes(routesObject) {
  const routes = []
  routesObject.forEach(rb => {
    const curRoute = deepClone(rb)
    const s = `/src/${curRoute.component}`
    if (curRoute.component === 'layout/Layout') { curRoute.component = Layout } else if (curRoute.component === 'views/icons/index') {
      console.log(s)
      curRoute.component = () => import('/src/views/icons/index')
    } else {
      curRoute.component = import(s)
      // curRoute.component = (resolve) => require([s], resolve)
    }
    if (curRoute?.children) {
      curRoute.children = computeRoutes(curRoute.children)
    }
    routes.push(curRoute)
  })
  // console.log(routes)
  return routes
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
// export function filterAsyncRoutes(routes, roles) {
//   const res = []

//   routes.forEach(route => {
//     const tmp = { ...route }
//     if (hasPermission(roles, tmp)) {
//       if (tmp.children) {
//         tmp.children = filterAsyncRoutes(tmp.children, roles)
//       }
//       res.push(tmp)
//     }
//   })
//   return res
// }

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    // state.addRoutes = routes
    // state.routes = constantRoutes.concat(routes)
    state.routes = routes
  }
}

const actions = {
  async generateRoutes({ commit }, roles) {
    let accessedRoutes = []
    // 通过前端获取路由路径，不用
    // if (roles.includes('admin')) {
    //   accessedRoutes = asyncRoutes || []
    // } else {
    //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
    // }
    // 通过api获取路由路径
    await getRoutes(roles).then(res => {
      accessedRoutes = computeRoutes(res?.data)
    })
    console.log(accessedRoutes)
    return new Promise(resolve => {
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
