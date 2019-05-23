import axios from "axios"

const SERVER = "http://10.51.135.136:8000"

let getDefaultState = () => ({
    // Sale data
    sale: {
      status         : "open",
      sell_to        : null,
      customer       : null,
      grades         : [],
      products       : [],
      taxable        : 0,
      payment_method : null,
      tendered       : 0,
      change_due     : 0,
      reference      : null,
      payments       : [],
      memo           : null, // New memo
      memos          : [],
      subtotal       : 0,
      tax            : 0,
      paid           : 0,
      total          : 0,
      balance        : 0,
    },

    // Options for dropdowns throughout form
    sell_to : [
			{ key: "organization", text: "Organization", value: 1 },
			{ key: "customer",     text: "Customer",     value: 0 },
    ],
    
    taxable : [
      { key: "No",  text: "No",  value: 0 },
			{ key: "Yes", text: "Yes", value: 1 },
    ],

    grades          : [],
    products        : [],
    payment_methods : [],
    settings        : {},
})

export default {
  
  state : getDefaultState(),

  mutations : {

    // RESET_CREATE
    RESET_CREATE(state) {
      const s = getDefaultState()
      Object.keys(s).forEach(key => {
        state[key] = s[key]
      })
    },
    
    // SET_GRADES
    SET_GRADES(state, payload) {
      Object.assign(state.grades, payload)
    },

    // SET_PRODUCTS
    SET_PRODUCTS(state, payload) {
      Object.assign(state.products, payload)
    },

    // SET_SETTINGS
    SET_SETTINGS(state, payload) {
      Object.assign(state.settings, payload)
    },

    REMOVE_PRODUCT(state, payload) {
      // Find product
      let i = state.sale.products.findIndex(product => product.id == payload.id)
      // Reset count
      Object.assign(state.sale.products[i], { amount: 0 })
      // Remove from array
      state.sale.products.splice(i, 1)
    },

    // SET_PAYMENT_METHODS
    SET_PAYMENT_METHODS(state, payload) {
      Object.assign(state.payment_methods, payload)
    },

    // CALCULATE_TOTALS
    CALCULATE_TOTALS(state) {
      let productTotals = 0
      let ticketTotals  = 0
      let tax = (state.settings.tax * state.sale.taxable) * state.sale.subtotal

      // Calculating product totals
      if (state.sale.products.length > 0)
        productTotals = state.sale.products.reduce((total, product) =>
          (total + (product.amount * product.price)), 0)


      Object.assign(state.sale, {
        tax      : tax, 
        subtotal : productTotals + ticketTotals,
        total    : productTotals + ticketTotals + tax,
      })
    },

  },

  actions : {
    
    // Fetch grades
    async fetchGrades({ commit }) {
      try {
        const response = await axios.get(`${SERVER}/api/grades`)
        let grades     = response.data.data.map(grade => ({
          key  : grade.id,
          text : grade.name,
          value: grade.id,
        }))
        commit("SET_GRADES", await grades)
      } catch (error) {
        alert(`Error in actions.fetchGrades: ${ error.message }`)
      }
    },
    
    // Fetch products
    async fetchProducts({ commit }) {
      try {
        const response = await axios.get(`${SERVER}/api/products`)
        let products   = response.data.data.map(product => ({
          key   : product.id,
          text  : product.name,
          value : {
            id          : product.id,
            amount      : 0,
            price       : product.price,
            name        : product.name,
            description : product.description,
            type        : product.type,
            cover       : product.cover,
          },
          icon  : 'box',
        }))
        commit("SET_PRODUCTS", await products)
      } catch (error) {
        alert(`Error in actions.fetchProducts: ${ error.message }`)
      }
    },

    // Fetch payment methods
    async fetchPaymentMethods({ commit }) {
      try {
        const response = await axios.get(`${SERVER}/api/payment-methods`)
        let payment_methods = response.data.data.map(payment_method => ({
					key  : payment_method.id, 
					text : payment_method.name,
					value: payment_method.id,
					icon : payment_method.icon
				}))
				await commit("SET_PAYMENT_METHODS", payment_methods)
      } catch (error) {
        alert(`Error in actions.fetchSettings: ${ error.message }`)
      }
    },

    // Fetch settings
    async fetchSettings({ commit }) {
      try {
        const response = await axios.get(`${SERVER}/api/settings`)
        let tax        = parseFloat(response.data.tax) / 100
        await commit('SET_SETTINGS', { tax: tax })
        //await context.commit('HAS_SETTINGS', true)
      } catch (error) {
        alert(`Error in actions.fetchSettings: ${ error.message }`)
      }
    }
  },

  
  getters : {
    sale            : state => state.sale,
    sell_to         : state => state.sell_to,
    taxable         : state => state.taxable,
    grades          : state => state.grades,
    products        : state => state.products,
    payment_methods : state => state.payment_methods,
    settings        : state => state.settings,
  },
}