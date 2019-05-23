import Vue from 'vue'
import Vuex from 'vuex'

// Sales Global Vuex Module
import Global from './modules/global'

//  Sales Index Vuex Module
import SalesIndex from './modules/index'

// Sales Create Vuex Module
import SalesCreate from './modules/create'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    Global,
    SalesIndex,
    SalesCreate,
  }
})
