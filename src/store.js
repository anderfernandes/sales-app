import Vue from 'vue'
import Vuex from 'vuex'

//  Sales Index Vuex Module
import SalesIndex from './modules/index'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    SalesIndex
  }
})
