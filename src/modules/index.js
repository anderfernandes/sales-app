import axios from "axios"

const SERVER = "http://10.51.135.136:8000"

const saleStatuses = [
  { key: "open",      text: "Open",      value: "open",      icon: "unlock"     },
  { key: "confirmed", text: "Confirmed", value: "confirmed", icon: "thumbs up"  },
  { key: "complete",  text: "Completed", value: "complete",  icon: "check"      },
  { key: "tentative", text: "Tentative", value: "tentative", icon: "help"       },
  { key: "canceled",  text: "Canceled",  value: "tentative", icon: "remove"     },
  { key: "no show",   text: "No Show",   value: "no show",   icon: "thumbs down"},
]

export default {
  // State
  state: {
    sales         : [],
    customers     : [],
    organizations : [],
    cashiers      : [],
    statuses      : saleStatuses,
    page          : 1,
    q             : "",
    isLoading     : true,
    showModal     : false,
    
    currencySettings  : {
			minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  // Mutations
  mutations: {
    // SET SALES
    SET_SALES(state, payload) {
      Object.assign(state.sales, payload)
    },

    // SET_CUSTOMERS
    SET_CUSTOMERS(state, payload) {
      Object.assign(state.customers, payload)
    },

    // SET_ORGANIZATIONS
    SET_ORGANIZATIONS(state, payload) {
      Object.assign(state.organizations, payload)
    },

    // SET_CASHIERS
    SET_CASHIERS(state, payload) {
      Object.assign(state.cashiers, payload)
    },

    // SET_IS_LOADING
    SET_IS_LOADING(state, payload) {
      state.isLoading = payload
    },

    // SET_SHOW_MODAL
    SET_SHOW_MODAL(state, payload) {
      state.showModal = payload
    },
  },
  // Actions
  actions: {

    // Fetches sales, pagination aware
    async fetchSales({ state, commit, rootState }) {
      try {
        let url = state.q.length == 0
                    ? `${SERVER}/api/sales?sort=desc&orderBy=id&page=${state.page}`
                    : `${SERVER}/api/sales?sort=desc&orderBy=id&page=${state.page}${state.q}`
        
        const response = await axios.get(url)
        const sales = response.data.data
        commit("SET_SALES", sales)
      } catch (error) {
        alert(`Error in fetchSales: ${error.message}`)
      }
    },

    // Fetch customers
    async fetchCustomers({ state, commit, rootState }) {
      try {
        const response = await axios.get(`${SERVER}/api/customers`)
        let customers = response.data.map(customer => ({
          key   : customer.id,
          value : customer.id,
          text  : customer.name,
        }))
        commit("SET_CUSTOMERS", customers)
      } catch (error) {
        alert(`Error in fetchCustomers: ${error.message}`)
      }
    },

    // Fetch organizations
    async fetchOrganizations({ state, commit, rootState }) {
      try {
        const response = await axios.get(`${SERVER}/api/organizations`)
        let organizations = response.data.map(organization => ({
          key   : organization.id,
          value : organization.id,
          text  : organization.name,
        }))
        organizations.unshift({
          key   : 0,
          value : null,
          text  : "All Organizations"
        })
        commit('SET_ORGANIZATIONS', organizations)
      } catch (error) {
        alert(`Error in fetchOrganizations: ${error.message}`)
      }
    },

    // Fetch cashiers
    async fetchCashiers({ state, commit, rootState }) {
      try {
        const response = await axios.get(`${SERVER}/api/staff`)
        let cashiers = await response.data.map(cashier => ({
          icon  : "user circle",
          key   : cashier.id,
          value : cashier.id,
          text  : cashier.firstname,
        }))
        cashiers.unshift({
          key   : 0,
          value : null,
          text  : "All Cashiers",
        })
        commit('SET_CASHIERS', cashiers)
      } catch (error) {
        alert(`Error in fetchCashiers: ${error.message}`)
      }
    },

    // Set isLoading
    setIsLoading(context, payload) {
      context.commit("SET_IS_LOADING", payload)
    },

    // Set showModal
    setShowModal(context, payload) {
      context.commit("SET_SHOW_MODAL", payload)
    },

  },

  // getters
  getters: {
    sales            : state => state.sales,
    customers        : state => state.customers,
    organizations    : state => state.organizations,
    cashiers         : state => state.cashiers,
    statuses         : state => state.statuses,
    page             : state => state.page,
    q                : state => state.q,
    isLoading        : state => state.isLoading,
    currencySettings : state => state.currencySettings,
    showModal        : state => state.showModal,
  },
}