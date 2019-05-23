import Vue    from 'vue'
import App    from './App.vue'
import router from './router'
import store  from './store'

import "semantic-ui-css/semantic.min.css"
import SuiVue from "semantic-ui-vue"

import { format, distanceInWords } from "date-fns"

Vue.use(SuiVue)

Vue.config.productionTip = false

Vue.mixin({
  methods: {
    format,
    distanceInWords,
    getSaleColor(status) {
      let color = null
      switch(status)
      {
        case 'complete' : color = { backgroundColor: "#21ba45"}; break;
        case 'confirmed': color = { backgroundColor: "#ffffff", color: "#21ba45"}; break;
        case 'open'     : color = { backgroundColor: "#6435c9"}; break;
        case 'canceled' : color = { backgroundColor: "#db2828"}; break; // MST RED: #CF3534 SEMANTIC RED: #DB2828
        case 'tentative': color = { backgroundColor: "#fbbd08"}; break;
        case 'no show'  : color = { backgroundColor: "#f2711c"}; break;
      }
      return color
    },
    getSaleLabelColor(status) {
      let className = null
      switch(status)
      {
        case 'complete' : className = "ui left pointing green label"      ; break;
        case 'confirmed': className = "ui left pointing basic green label"; break;
        case 'open'     : className = "ui left pointing violet label"     ; break;
        case 'canceled' : className = "ui left pointing red label"        ; break;
        case 'tentative': className = "ui left pointing yellow label"     ; break;
        case 'no show'  : className = "ui left pointing orange label"     ; break;
      }
      return className
    },
    getSaleIcon(status) {
      let className = null
      switch(status)
      {
        case 'complete' : className = "checkmark icon"          ; break;
        case 'confirmed': className = "thumbs up icon"          ; break;
        case 'open'     : className = "unlock icon"             ; break;
        case 'canceled' : className = "remove icon"             ; break;
        case 'tentative': className = "help icon"               ; break;
        case 'no show'  : className = "thumbs outline down icon"; break;
      }
      return className
    },
  }
})

Vue.prototype.$dateFormat = { long: "dddd, MMMM D, YYYY [at] h:mm a", short: "dddd, MMMM D, YYYY" }

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
