import Vue from 'vue'
import Router from 'vue-router'

import Index from './views/Index.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('./views/Create.vue')
    },
    {
      path: '/:id',
      name: 'show',
      component: () => import('./views/Show.vue')
    },
    {
      path: '/:id/edit',
      name: 'edit',
      component: () => import('./views/Edit.vue')
    }
  ]
})
