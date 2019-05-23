//import axios from "axios"

//const SERVER = "http://10.51.135.136:8000"

export default {
  
  state : {
    errors   : {},

  },

  mutations : {
    
    // SET_ERRORS
    SET_ERRORS(state, payload) {
      Object.assign(state.errors, payload)
    },

  },

  actions : {
    
  },

  
  getters : {
    errors   : state => state.errors,
    
  },
}