const dateFormat = { long: "dddd, MMMM D, YYYY [at] h:mm a", short: "dddd, MMMM D, YYYY" }
const SERVER     = "http://10.51.147.77:8000"

Vue.config.devtools = true // DISABLE THIS IN PRODUCTION
Vue.use(SemanticUIVue)
Vue.component("flatpickr", VueFlatpickr)

Vue.mixin({
  methods: {
    format(date, format) { 
      return dateFns.format(date, format) 
    },
    distanceInWords(beginning, end) { 
      return dateFns.distanceInWords(beginning, end, { addSuffix: true }) 
    },
    getSaleColor(status) {
      let color = null
      switch(status)
      {
        case 'complete' : color = { backgroundColor: "#21ba45"}; break;
        case 'confirmed': color = { backgroundColor: "#ffffff", color: "#21ba45"}; break;
        case 'open'     : color = { backgroundColor: "#6435c9"}; break;
        case 'canceled' : color = { backgroundColor: "#cf3534"}; break;
        case 'tentative': color = { backgroundColor: "#fbbd08"}; break;
        case 'no show'  : color = { backgroundColor: "#f2851c"}; break;
      }
      return color
    },
    getSaleLabelColor(status) {
      let className = null
      switch(status)
      {
        case 'complete' : className = "ui left pointing green label"; break;
        case 'confirmed': className = "ui left pointing basic green label"; break;
        case 'open'     : className = "ui left pointing violet label"; break;
        case 'canceled' : className = "ui left pointing red label"; break;
        case 'tentative': className = "ui left pointing yellow label"; break;
        case 'no show'  : className = "ui left pointing organge label"; break;
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

Vue.prototype.$dateFormat = dateFormat

const getDefaultState = () => ({
		creator_id        : 3,
		settings          : [],
    events            : [],
    dates             : [], // Array for dates of each event, index + 1 is event number
    eventOptions      : [], // Array of objects with event options, index + 1 is event number
    tickets           : [], // Each item represents and event and every event containts tickets for that event
    availableTickets  : [],
    selectedTickets   : [],
    ticketOptions     : [], // Array of objects with tickets options, index + 1 is event number
		payments          : [], // Sale payments
		productOptions    : [],
    products          : [], // array, user defined
    availableProducts : [],
    selectedProducts  : [],
		subtotal          : 0,
		change_due        : 0,
		taxableOptions    : [
			{ key: "No",  text: "No",  value: 0 },
			{ key: "Yes", text: "Yes", value: 1 },
		],
		taxable           : 0,
		tax               : 0,
		tendered          : 0,
		paymentMethod     : 1, // Payment method chosen by user
		paymentMethods    : [], // Available payment methods
    memo              : "",
    memos             : [], // Sale memos, come from database
		sellTo            : null,
		sellToOptions     : [
			{ key: "organization", text: "Organization", value: 1 },
			{ key: "customer",     text: "Customer",     value: 0 },
		],
		saleStatus        : "open",
		saleStatuses      : [
			{ key: "open"     ,  text: "Open"     , value: "open"     , icon: "unlock"},
			{ key: "confirmed",  text: "Confirmed", value: "confirmed", icon: "thumbs up"},
			{ key: "complete" ,  text: "Completed", value: "complete" , icon: "check"},
			{ key: "tentative",  text: "Tentative", value: "tentative", icon: "help"},
			{ key: "no show"  ,  text: "No Show"  , value: "no show"  , icon: "thumbs down"},
		],
		customerOptions   : [],
		customer          : null,
		gradeOptions      : [],
		grades            : [],
		reference         : "",
		numberOfEvents    : 1,
		isLoading         : true,
		hasSettings       : false,
		hasPaymentMethods : false,
		hasCustomerOptions: false,
		hasGradeOptions   : false,
    hasProductOptions : false,
    errors            : {},
    showModal         : false,
    activeTab         : 0,
    paid              : 0,
    event_types       : [],
    sales             : [],
    currencySettings  : {
			minimumFractionDigits: 2,
      maximumFractionDigits: 2,
	  },
})

// Vuex global store
const store = new Vuex.Store({
	// alias to data in vue
	state: getDefaultState(),
	// ??
	mutations: {
    RESET(state) {
      Object.assign(state, getDefaultState)
    },
    SET_PAID(state, amount) {
      state.paid = amount
    },
    SET_SALES(state, sales) {
      Vue.set(state, "sales", sales)
    },
    SET_EVENT_TYPES(state, event_types) {
      Vue.set(state, "event_types", event_types)
    },
    SET_ACTIVE_TAB(state, index) {
      state.activeIndex = index
    },
    SET_DATES(state, payload) {
      Vue.set(state.dates, payload.index, payload.date)
    },
    SET_EVENT_OPTIONS(state, payload) {
      Vue.set(state.eventOptions, payload.index, payload.eventOptions)
    },
    SET_SHOW_MODAL(state) {
      state.showModal = !state.showModal
    },
    SET_ERRORS(state, errors)
    {
      Vue.set(state, "errors", errors)
    },
		SET_CHANGE_DUE(state) {
			let change_due = ((parseFloat(state.subtotal) + parseFloat(state.tax)) - parseFloat(state.tendered))
			state.change_due = change_due >= 0 ? 0 : change_due
		},
		SET_MEMO(state, memo) {
			state.memo = memo
    },
    SET_MEMOS(state, memos) {
      state.memos = memos
    },
		SET_EVENT(state, payload)
		{
			state.events.splice(payload.index, 1, payload.event_id)
    },
		SET_TAXABLE(state, taxable) {
			state.taxable = taxable
		},
		SET_TAX(state) {
			if (state.taxable)
				state.tax = state.subtotal * state.settings.tax
			else
				state.tax = 0
		},
		SET_SETTINGS(state, settings) {
			state.settings = settings
		},
		SET_SUBTOTAL(state) {
			let productTotals = 0
			let ticketTotals  = 0
			
			// Calculating product totals
			if (state.selectedProducts.length > 0)
				productTotals = state.selectedProducts.reduce((total, product) => 
					(total + (product.amount * product.price)), 0
				)

      // Calculating ticket totals
      if (state.tickets.length > 0)
        state.selectedTickets.forEach(eventTickets => {
          ticketTotals += eventTickets.reduce((total, ticket) => 
            (total + (ticket.amount * ticket.price)), 0
          )
        })

      /*if (state.tickets.length > 0)
        ticketTotals =  state.selectedTickets.reduce((total, ticket) =>
          (total + (ticket.amount * ticket.price)), 0
        )*/


			state.subtotal = productTotals + ticketTotals
		},
		SET_TENDERED(state, tendered) {
			state.tendered = tendered
    },
    SET_PAYMENTS(state, payments) {
      Vue.set(state, "payments", payments)
    },
		SET_PAYMENT_METHODS(state, paymentMethods) {
			Vue.set(state, 'paymentMethods', paymentMethods)
		},
		SET_PAYMENT_METHOD(state, paymentMethod) {
			state.paymentMethod = paymentMethod
		},
		SET_SELL_TO(state, sellTo) {
			state.sellTo = sellTo
		},
		SET_SALE_STATUS(state, saleStatus) {
			state.saleStatus = saleStatus
		},
		SET_CUSTOMER_OPTIONS(state, customers) {
			state.customerOptions = customers
		},
		SET_CUSTOMER(state, customer) {
			state.customer = customer
		},
		SET_GRADE_OPTIONS(state, gradeOptions) {
			state.gradeOptions = gradeOptions
		},
		SET_GRADES(state, grades) {
			Vue.set(state, 'grades', grades)
    },
    SET_PRODUCTS(state, products) {

      state.products         = products
      state.selectedProducts = []
      
      state.products.forEach(product_id => {
        let p = state.availableProducts.find(product => product.id == product_id)
        state.selectedProducts.push(p)
      })

		},
		SET_PRODUCT_OPTIONS(state, products) {
      
      let productOptions = products.map(product => ({
        key   : product.id,
        text  : `${product.name} (${product.type.name})`,
        value : product.id,
        icon  : "box",
      }))
      
      Vue.set(state, "productOptions", productOptions)

      let availableProducts = products.map(product => ({
        id          : product.id,
        amount      : 0,
        name        : product.name,
        description : product.description,
        type        : product.type,
        price       : product.price,
        cover       : product.cover, 
      }))
      
      Vue.set(state, "availableProducts", availableProducts)
    },
    SET_SELECTED_PRODUCTS(state, selectedProducts) {
      Vue.set(state, "selectedProducts", selectedProducts)
    },
    SET_TICKETS(state, payload) {

      //state.tickets         = tickets
      //state.selectedTickets = []
      
      // Set tickets for the event
      state.tickets.splice(payload.index, 1, payload.tickets)
      // Reset selected tickets so that we can add them again
      let selectedTickets = []
      state.selectedTickets.splice(payload.index, 1, selectedTickets)

      state.tickets[payload.index].forEach(ticket_id => {
        let t = state.availableTickets.find(ticket => ticket.id == ticket_id)
        selectedTickets.push(t)
      })
      state.selectedTickets.splice(payload.index, 1, selectedTickets)
			//state.tickets.splice(payload.index, 1, payload.tickets)
    },
    SET_TICKET_OPTIONS(state, tickets) {

      //console.log(tickets,  "SET_TICKET_OPTIONS")

      let ticketOptions = tickets.map(ticket => ({
        key   : ticket.id,
        text  : ticket.name,
        value : ticket.id,
        icon  : "ticket",
      }))

      Vue.set(state, "ticketOptions", ticketOptions)

      /*
      let availableTickets = tickets.map(ticket => {
        console.log(ticket.amount)
        let amount = ticket.amount || 0
        return {
          id          : ticket.id,
          amount      : amount,
          name        : ticket.name,
          description : ticket.description,
          type        : ticket.type,
          price       : ticket.price,
          event       : ticket.event,
        }
      })
      
      Vue.set(state, "availableTickets", availableTickets)
      */
      //Vue.set(state.ticketOptions, payload.index, payload.ticketOptions)
    },
    SET_AVAILABLE_TICKETS(state, tickets) {
      let availableTickets = tickets.map(ticket => {
        let amount = ticket.amount || 0
        return {
          id          : ticket.id,
          amount      : amount,
          name        : ticket.name,
          description : ticket.description,
          type        : ticket.type,
          price       : ticket.price,
          event       : ticket.event,
        }
      })
      Vue.set(state, "availableTickets", availableTickets)
    },
    // USE THIS ONLY TO UPDATE AMOUNT OF TICKETS WHEN EDITING, NEVER ON CREATING A SALE!!!
    UPDATE_SELECTED_TICKETS(state, payload) {
      let selectedTickets = payload.tickets.forEach(ticket => {
        let amount = ticket.amount || 0
        Vue.set(ticket, "amount", amount)
      })
      console.log(payload.tickets)
      state.selectedTickets.splice(payload.index, 1, payload.tickets)
    },
		SET_REFERENCE(state, reference) {
			state.reference = reference
		},
		SET_NUMBER_OF_EVENTS(state) {
			state.numberOfEvents++
		},
		HAS_SETTINGS(state, status) {
			state.hasSettings = status
		},
		HAS_PAYMENT_METHODS(state, status) {
			state.hasPaymentMethods = status
		},
		HAS_CUSTOMER_OPTIONS(state, status) {
			state.hasCustomerOptions = status
		},
		HAS_GRADE_OPTIONS(state, status) {
			state.hasGradeOptions = status
		},
		HAS_PRODUCT_OPTIONS(state, status) {
			state.hasProductOptions = status
		},
		SET_IS_LOADING(state) {
			state.isLoading = !state.isLoading
    },
    SET_CREATOR_ID(state, creator_id) {
      state.creator_id = creator_id
    }
	},
	// alias to computed properties in vue
	getters: {
    paid             : state => state.paid,
    sales            : state => state.sales,
    event_types      : state => state.event_types,
		creator_id       : state => state.creator_id,
		settings         : state => state.settings,
		taxableOptions   : state => state.taxableOptions,
		taxable          : state => state.taxable,
		ticket           : state => state.tickets,
		tickets          : state => state.tickets,
		productOptions   : state => state.productOptions,
		products         : state => state.products,
		subtotal         : state => state.subtotal,
		tax              : state => state.tax,
		total            : state => parseFloat(state.subtotal) + parseFloat(state.tax),
		tendered         : state => state.tendered,
		paymentMethods   : state => state.paymentMethods,
		paymentMethod    : state => state.paymentMethod,
		payments         : state => state.payments,
		sellToOptions    : state => state.sellToOptions,
		sellTo           : state => state.sellTo,
		saleStatuses     : state => state.saleStatuses,
		saleStatus       : state => state.saleStatus,
		customerOptions  : state => state.customerOptions,
		customer         : state => state.customer,
		gradeOptions     : state => state.gradeOptions,
		grades           : state => state.grades,
		numberOfEvents   : state => state.numberOfEvents,
		reference        : state => state.reference,
		isLoading        : state => state.isLoading,
		events           : state => state.events,
    memo             : state => state.memo,
    memos            : state => state.memos,
    change_due       : state => state.change_due,
    errors           : state => state.errors,
    hasErrors        : state => Object.keys(state.errors).length > 0,
    showModal        : state => state.showModal,
    dates            : state => state.dates,
    eventOptions     : state => state.eventOptions,
    ticketOptions    : state => state.ticketOptions,
    activeTab        : state => state.activeTab,
    currencySettings : state => state.currencySettings,
    sale             : state => state.sale,
    selectedProducts : state => state.selectedProducts,
    selectedTickets  : state => state.selectedTickets,
	},
	// alias to methods in vue
	actions: {
    reset(context) {
      context.commit("RESET")
    },
    updateSelectedTickets(context, payload) {
      context.commit("UPDATE_SELECTED_TICKETS", payload)
    },
    setAvailableTickets(context, tickets) {
      context.commit("SET_AVAILABLE_TICKETS", tickets)
    },
    setPayments(context, payments) {
      context.commit("SET_PAYMENTS", payments)
    },
    setSelectedProducts(context, selectedProducts) {
      context.commit("SET_SELECTED_PRODUCTS", selectedProducts)
    },
    setIsLoading(context) {
      context.commit("SET_IS_LOADING")
    },
    setPaid(context, amount) {
      context.commit("SET_PAID", amount)
    },
    setTickets(context, payload) {
      context.commit("SET_TICKETS", payload)
    },
    setActiveTab(context, index) {
      context.commit("SET_ACTIVE_TAB", index)
    },
    setDate(context, payload) {
      context.commit("SET_DATES", payload)
    },
    setEventOptions(context, payload) {
      context.commit("SET_EVENT_OPTIONS", payload)
    },
    setEvent(context, event) {
      context.commit("SET_EVENT", event) 
    },
    setTicketOptions(context, tickets) {
      context.commit("SET_TICKET_OPTIONS", tickets)
    },
    setShowModal(context) {
      context.commit("SET_SHOW_MODAL")
    },
    setErrors(context, errors) {
      context.commit("SET_ERRORS", errors)
    },
		setMemo(context, memo) {
			context.commit("SET_MEMO", memo)
    },
    setMemos(context, memos) {
      context.commit("SET_MEMOS", memos)
    },
		setProducts(context, products) {
      context.commit("SET_PRODUCTS", products)
      //context.commit("SET_IS_LOADING")
		},
		calculateTotals(context) {
			context.commit('SET_TAX')
			context.commit('SET_SUBTOTAL')
			context.commit('SET_CHANGE_DUE')
		},
		setTaxable(context, taxable) {
			context.commit('SET_TAXABLE', taxable)
		},
		setTax(context) {
			context.commit('SET_TAX')
		},
		setTendered(context, tendered) {
			context.commit("SET_TENDERED", tendered)
		},
		setPaymentMethod(context, paymentMethod) {
			context.commit('SET_PAYMENT_METHOD', paymentMethod)
		},
		setSellTo(context, sellTo) {
			context.commit('SET_SELL_TO', sellTo)
		},
		setSaleStatus(context, saleStatus) {
			context.commit('SET_SALE_STATUS', saleStatus)
		},
		setCustomer(context, customer) {
			context.commit('SET_CUSTOMER', customer)
		},
		setGrades(context, grades) {
			context.commit('SET_GRADES', grades)
		},
		setNumberOfEvents(context) {
			context.commit('SET_NUMBER_OF_EVENTS')
		},
		setReference(context, reference) {
			context.commit("SET_REFERENCE", reference)
		},
		async fetchSettings(context) {
      try {
        const response = await axios.get(`${SERVER}/api/settings`)
        let tax = parseFloat(response.data.tax) / 100
        await context.commit('SET_SETTINGS', { tax: tax })
        await context.commit('HAS_SETTINGS', true)
      } catch (error) {
        alert(`Error in actions.fetchSettings: ${ error.message }`)
      }
		},
		async fetchPaymentMethods(context) {
      try {
        const response = await axios.get(`${SERVER}/api/payment-methods`)
        let paymentMethods = response.data.data.map(payment_method => ({
					key  : payment_method.id, 
					text : payment_method.name,
					value: payment_method.id,
					icon : payment_method.icon
				}))
				await context.commit("SET_PAYMENT_METHODS", paymentMethods)
				await context.commit("HAS_PAYMENT_METHODS", true)
      } catch (error) {
        alert(`Error in actions.fetchSettings: ${ error.message }`)
      }
		},
		async fetchCustomers(context) {
      try {
        const response = await axios.get(`${SERVER}/api/customers`)
        let customerOptions = response.data.map(customer => {
          let organization = (customer.organization.id != 1)
                            ? `, ${customer.organization.name}` : ``
          return {
            key : customer.id,
            text: `${customer.name} (${customer.role}${organization})`,
            value: customer.id,
            icon: "user circle",
            organization: { id: customer.organization.id },
          }
        })
        await context.commit("SET_CUSTOMER_OPTIONS", customerOptions)
        await context.commit("HAS_CUSTOMER_OPTIONS", true)
      } catch (error) {
        alert(`Error in actions.fetchSettings: ${ error.message }`)
      }
		},
		async fetchGrades(context) {
      try {
        const response = await axios.get(`${SERVER}/api/grades`)
        let gradeOptions = response.data.data.map(grade => ({
          key  : grade.id,
          text : grade.name,
          value: grade.id,
        }))
        await context.commit("SET_GRADE_OPTIONS", gradeOptions)
        await context.commit("HAS_GRADE_OPTIONS", true)
      } catch (error) {
        alert(`Error in actions.fetchGrades: ${ error.message }`)
      }
		},
		async fetchProducts(context) {
      try {
        const response = await axios.get(`${SERVER}/api/products`)
        await context.commit("SET_PRODUCT_OPTIONS", response.data.data)
        await context.commit("HAS_PRODUCT_OPTIONS", true)
        await context.commit("SET_IS_LOADING")
      } catch (error) {
        alert(`Error in actions.fetchProducts: ${ error.message }`)
      }
    },
    async fetchSales(context) {
      try {
        const response = await axios.get(`${SERVER}/api/sales?sort=desc&orderBy=id`)
        await context.commit("SET_SALES", response.data.data)
      } catch (error) {
        alert(`Error in actions.fetchSales: ${ error.message }`)
      }
    },
    async fetchEventTypes(context) {
      try {
        const response = await axios.get(`${SERVER}/api/event-types`)
        context.commit("SET_EVENT_TYPES", response.data)
      } catch (error) {
        alert(`Error in actions.fetchEventTypes: ${ error.message }`)
      }
    },
	},
})

// Modal
const Modal = Vue.component("modal", {
  template: "#modal",
  computed: {
    open: {
      set() { store.dispatch("setShowModal") },
      get() { return store.getters.showModal }
    },
    errors() {
      let errors = []
      Object.values(this.$store.getters.errors).forEach(errorMessages => {
        errorMessages.forEach(errorMessage => errors.push(errorMessage))
      })
      return errors
    },
  },
})

// Event Form
const EventForm = Vue.component("event-form", {
	template: "#event-form",
	props: ["type", "cashier", "event-data", "tickets-data"],
	data: () => ({
		flatpickrConfig: {
			dateFormat: "l, F j, Y",
			defaultDate: "today",
    },
    event_type: null,
    isLoading: true,
	}),
	methods: {
		// Fetch Events
		async fetchEvents() {
      let date = dateFns.format(new Date(this.date), "YYYY-MM-DD")
      try {
        const response = await axios.get(`${SERVER}/api/events?start=${date}&type=${this.event_type || this.type}`)
        let eventOptions = response.data.map(event => {
          let time = dateFns.format(new Date(event.start), "h:mm aa")
          return {
            key  : event.id,
            text : `${event.show.id == 1 ? event.memo : event.show.name} at ${time}`,
            value: event.id,
          }
        })
        await this.$store.dispatch("setEventOptions", { index: this.$vnode.key - 1, eventOptions: eventOptions})
      } catch (error) {
        alert(`fetchEvents in EventForm failed: ${ error.message }`)
      }
    },
    // Fetch Sale Tickets
    async fetchSaleTickets() {
      try {
        const response = await axios.get(`${SERVER}/api/sale/${this.$route.params.id}`)
        let tickets = response.data.events[this.$vnode.key - 1].tickets.map(ticket => ticket.id)
        //await this.$store.dispatch("setSelectedTickets", tickets)
        this.tickets = tickets
        // Send already existing ticket amounts to store
        tickets = response.data.events[this.$vnode.key - 1].tickets
        await this.$store.dispatch("setAvailableTickets", tickets)
        await this.$store.dispatch("updateSelectedTickets", {index: this.$vnode.key - 1, tickets})
      } catch (error) {
        alert(`fetchSaleTickets in EventForm failed: ${error.message}`)
      }
    },
		// Fetch Tickets Types
		async fetchTicketsTypes() {
      try {
        const response = await axios.get(`${SERVER}/api/allowedTickets?event_type=${this.event_type || this.type}`)
        this.ticketOptions = response.data.data
      } catch (error) {
        alert(`fetchTicketTypes in EventForm failed: ${error.message}`)
      }
		},
	},
	computed: {
    placeholderMessage() {
      return (this.eventOptions) && (this.eventOptions.length == 0) 
              ? 'No events found' 
              : `${ this.eventOptions.length } ${ this.eventOptions.length == 1 ? 'event' : 'events'} found` 
    },
    selectedTickets() {
      return this.$store.getters.selectedTickets[ this.$vnode.key - 1 ]
    },
    eventOptions: {
      async set(eventOptions) { await this.$store.dispatch("setEventOptions", { index: this.$vnode.key - 1, eventOptions }) },
      get() { return store.getters.eventOptions[this.$vnode.key - 1] }
    },
    tickets: {
      set(tickets) { 
        this.$store.dispatch("setTickets", {index: this.$vnode.key - 1, tickets}) 
      },
      get() { 
        return this.$store.getters.ticket[ this.$vnode.key - 1 ] 
      }
    },
    ticketOptions: {
      set(ticketOptions) { 
        this.$store.dispatch("setTicketOptions", ticketOptions) 
        this.$store.dispatch("setAvailableTickets", ticketOptions)
      },
      get() { return store.getters.ticketOptions }
    },
    date: {
      async set(date) { await this.$store.dispatch("setDate", { index: this.$vnode.key - 1, date: date }) },
      get() { return store.getters.dates[this.$vnode.key -1] }
    },
		event: {
			async set(event_id) { 
				let event = { index: this.$vnode.key - 1, event_id: event_id }
				await this.$store.dispatch("setEvent", event) 
			},
			get() { return this.$store.getters.events[this.$vnode.key - 1] }
		}
  },
  async created() {
    await this.fetchTicketsTypes()
    if (this.$route.name == "edit") {
      await this.fetchEvents()
      await this.fetchSaleTickets()
      
    } else if (this.$route.name == "create") {
      this.date = dateFns.format(new Date(), "dddd, MMMM DD, YYYY")
    }
    this.isLoading = false
	},
	async updated() {
		await this.$store.dispatch("calculateTotals")
	}
})

// Sales Form
const SalesForm = Vue.component("sales-form", {
  props: ["type"],
  template: "#sales-form",
  components: { EventForm },
  async created() {
		await this.$store.dispatch("fetchSettings")
		await this.$store.dispatch("fetchCustomers")
		await this.$store.dispatch("fetchGrades")
		await this.$store.dispatch("fetchProducts")
		await this.$store.dispatch("fetchPaymentMethods")
    //console.log(this.$vnode.key)
    // Fetch payments if a sale exists?
    if (this.$route.params.id)
      await this.fetchSale()
  },
  async beforeMount() {
    await this.$store.dispatch("reset") 
  },
	async updated() {
    await this.$store.dispatch("calculateTotals")
  },
  async beforeDestroyed() {
    this.$store.dispatch("reset")
  },
	computed: {
    selectedProducts: {
      set(selectedProducts) { this.$store.dispatch("setSelectedProducts", selectedProducts) },
      get() { return this.$store.getters.selectedProducts }
    },
    activeTab: {
      set(index) { this.$store.dispatch("setActiveTab", index) },
      get() { return this.$store.getters.activeTab }
    },
    memos: {
      set(memos) { this.$store.dispatch("setMemos", memos) },
      get() { return this.$store.getters.memos }
    },
		memo: {
			set(memo) { this.$store.dispatch('setMemo', memo) },
			get()     { return this.$store.getters.memo }
		},
		payments: {
      set(payments) { this.$store.dispatch("setPayments", payments) },
      get() { return this.$store.getters.payments }
		},
		productOptions() {
			return this.$store.getters.productOptions
		},
		products: {
			set(newProduct) { store.dispatch('setProducts', newProduct) },
			get() { return this.$store.getters.products },
		},
		taxableOptions() { 
			return this.$store.getters.taxableOptions 
		},
		taxable: {
			set(taxable) { this.$store.dispatch('setTaxable', taxable) },
			get() { return this.$store.getters.taxable }
		},
		subtotal() {
      return this.$store.getters.subtotal.toLocaleString("en-US", store.getters.currencySettings)
		},
		tax() {
			return this.$store.getters.tax.toLocaleString("en-US", store.getters.currencySettings)
		},
		total() {
			return this.$store.getters.total.toLocaleString("en-US", store.getters.currencySettings)
		},
		tendered: {
			get() { 
				return this.$store.getters.tendered.toLocaleString("en-US", store.getters.currencySettings)
			},
			set(tendered) {
        this.$store.dispatch("setTendered", tendered) 
			}
    },
    paid: {
      set(amount) { this.$store.dispatch("setPaid", amount) },
      get() { 
        if (this.$store.getters.paid > 0 )
          return this.$store.getters.paid.toLocaleString("en-US", store.getters.currencySettings)
        else
          return 0..toLocaleString("en-US", store.getters.currencySettings)
      }
    },
		balance() {
			// Check if sale data exists and payments exist, if not, return 0
			let result = parseFloat(this.total) - parseFloat(this.tendered)
			if (result >= 0)
				return result.toLocaleString("en-US", store.getters.currencySettings)
			else 
				return (0).toLocaleString("en-US", store.getters.currencySettings)
		},
		change_due() {
			return this.$store.getters.change_due.toLocaleString("en-US", store.getters.currencySettings)
		},
		settings() {
			return this.$store.getters.settings
		},
		paymentMethods() {
			return this.$store.getters.paymentMethods
		},
		paymentMethod: {
			set(paymentMethod) { this.$store.dispatch('setPaymentMethod', paymentMethod) },
			get() { return this.$store.getters.paymentMethod }
		},
		sellToOptions() {
			return this.$store.getters.sellToOptions
		},
		sellTo: {
			set(sellTo) { this.$store.dispatch('setSellTo', sellTo) },
			get() { return this.$store.getters.sellTo }
		},
		saleStatus: {
			set(saleStatus) { this.$store.dispatch('setSaleStatus', saleStatus) },
			get() { return this.$store.getters.saleStatus }
		},
		saleStatuses() {
			return this.$store.getters.saleStatuses
		},
		customer: {
			set(customer) { this.$store.dispatch('setCustomer', customer) },
			get() { return this.$store.getters.customer }
		},
		customerOptions() {
			return this.$store.getters.customerOptions
		},
		grades: {
			set(grades) { this.$store.dispatch('setGrades', grades) },
			get() { return this.$store.getters.grades }
		},
		gradeOptions() {
			return this.$store.getters.gradeOptions
		},
		reference: {
			set(reference) { this.$store.dispatch('setReference', reference) },
			get() { return this.$store.getters.reference }
		},
		numberOfEvents: {
			set(numberOfEvents) { this.$store.dispatch('setNumberOfEvents', numberOfEvents) },
			get() { return this.$store.getters.numberOfEvents },
    },
    isLoading: {
      set(isLoading) { this.$store.dispatch("setIsLoading", isLoading) },
      get() { return this.$store.getters.isLoading }
    },
    errors() {
      return this.$store.getters.errors
    },
    isValid() {
      let errors = {}
      // Sell To Error Checking
      if (!this.sellTo)
        errors.sellTo = ["Select if this sale is for the customer you selected or the organization they work for."]
      else if (this.sellTo.length < 2)
        errors.sellTo = ["Reference must have at least 2 numbers"]
      else 
        delete errors.sellTo
      // Change Due error Checking
      if (parseFloat(this.change_due) < 0)
        errors.change_due = ["Change due must be greater or equal to zero."]
      else 
        delete errors.change_due
      // Tendered error checking
      if (parseFloat(this.tendered) < 0)
        errors.tendered = ["Tendered must be a positive number."]
      else 
        delete errors.tendered
      // Reference error checking
      if ((this.paymentMethod != 1) && (this.reference.length == 0))
        errors.reference = ["You must leave a reference if the customer not paying with cash."]
      else 
        delete errors.reference
        
      this.$store.dispatch("setErrors", errors)
      return !this.$store.getters.hasErrors
    },
	},
  methods: {
    // Fetch Sale
    async fetchSale() {
      let errors = {}
      errors.fetchSale = ["Unable to fetch sale"]
      try {
        const response = await axios.get(`${SERVER}/api/sale/${this.$route.params.id}`)
        let sale = response.data
          // Set sell to
          this.sellTo = sale.sell_to_organization ? 1 : 0
          // Set grades
          this.grades = sale.grades.map(grade => grade.id) // only id of grades
          // Set customer
          this.customer = sale.customer.id
          // Set product
          this.products = sale.products.map(product => product.id)
          // Set selected products
          this.selectedProducts = sale.products.map(product => ({
            id          : product.id,
            amount      : product.quantity,
            name        : product.name,
            description : product.description,
            type        : product.type,
            price       : product.price,
            cover       : product.cover, 
          })) 
          // Setting sale status
          this.saleStatus = sale.status
          // Setting memos
          this.memos = sale.memos
          // Setting subtotal
          //this.subtotal = sale.subtotal
          this.taxable = parseInt(sale.taxable)
          // Setting tendered
          this.paid = sale.payments.reduce((total, payment) => total + parseFloat(payment.total), 0)
          // Setting payments
          this.payments = sale.payments
          // Setting events in store
          sale.events.forEach((event, i) => {
            // Setting events in store
            this.$store.dispatch("setEvent", { index: i, event_id: event.id })
            // Setting event dates in store
            this.$store.dispatch("setDate", { index: i, date: this.format(new Date(event.start), this.$dateFormat.short) })
          })
      } catch (error) {
        alert(`fetchSale in SaleForm failed: ${ error.message }`)
      }
    },
		// Add a new event form for another event
		addEvent(event) {
			event.preventDefault()
			this.numberOfEvents++
    },
		async submit(event) {
			event.preventDefault()
			let request = {
				// Customer 
				customer     : this.$store.getters.customer,
				// Cashier
				creator_id   : this.$store.getters.creator_id,
				// Sale Data
				saleStatus   : this.$store.getters.saleStatus,
				taxable      : this.$store.getters.taxable,
				subtotal     : this.$store.getters.subtotal,
				tax          : this.$store.getters.tax,
        total        : this.$store.getters.total,
        tendered     : this.$store.getters.tendered,
				sellTo       : this.$store.getters.sellTo,
				// Payment Data
				paymentMethod: this.$store.getters.paymentMethod,
				change_due   : this.$store.getters.change_due,
				reference    : this.$store.getters.reference,
				// Ticket Data
				tickets      : this.$store.getters.tickets,
				// Products Data
				products     : this.$store.getters.products,
				// Event Data
				events       : this.$store.getters.events,
				// Grades Data 
				grades       : this.$store.getters.grades,
				// Memo
				memo         : this.$store.getters.memo,
			}
      console.log(request)
      /*if (this.isValid)
      {
        try {
          const response = await axios.post(`${SERVER}/api/sales`)
          const sale      = response.data.data
          this.$router.push({ name: "show", params: { id: sale.id } })
        } catch(error) {
          alert(`Unable to save this sale at this time: ${error}`)
        }
      } else {
        this.$store.dispatch("setShowModal")
      }*/
		}
  },
})

// Sale Box
const SaleBox = Vue.component("sale-box", {
  template: "#sale-box",
  props   : ["sale"],
  computed: {
    paid() {
      let paid = this.sale.payments.reduce((total, current) => total + parseFloat(current.tendered), 0)
      let change_due = this.sale.payments.reduce((total, current) => total + parseFloat(current.change_due), 0)
      return (paid - change_due).toLocaleString("en-US", store.getters.currencySettings)
    },
    balance() {
      let balance = parseFloat(this.sale.total) - parseFloat(this.paid)
      return balance.toLocaleString("en-US", store.getters.currencySettings)
    }
  }
})

// Index Page
const Index = Vue.component("index", { 
  template: "#index",
  props: ["type"],
  components: { SaleBox },
  data: () => ({
    open     : false,
    isLoading: true,
    sales    : [],
  }),
  computed: {
    event_types() { return this.$store.getters.event_types },
  },
  methods: {
    toggle() { this.open = !this.open },
    fetchSales() {
      let errors = {}
      errors.fetchSales = ["Unable to fetch sales"]
      axios
        .get(`${SERVER}/api/sales?sort=desc&orderBy=id`)
        .then(response => this.sales = response.data.data)
        .catch(error => store.dispatch("setErrors", errors))
        .finally(() => this.isLoading = !this.isLoading)
    },
  },
  created() { 
    this.$store.dispatch("fetchEventTypes")
    this.fetchSales() 
  }
})

// Create Page
const Create = Vue.component("create", { 
  template: "#create",
})

// Show Page
const Show = Vue.component("show", { 
  template: "#show",
  data: () => ({
    sale: {},
    isLoading: true,
  }),
  created() {
    this.fetchSale()
  },
  computed: {
    tax() {
      return this.sale.tax.toLocaleString("en-US", store.getters.currencySettings)
    },
    paid() {
      let paid = this.sale.payments.reduce((total, current) => total + parseFloat(current.paid), 0)
      return paid.toLocaleString("en-US", store.getters.currencySettings)
    },
    balance() {
      let balance = parseFloat(this.sale.total) - parseFloat(this.paid)
      return balance.toLocaleString("en-US", store.getters.currencySettings)
    }
  },
  methods : {
    fetchSale() {
      axios
        .get(`${SERVER}/api/sale/${this.$route.params.id}`)
        .then(response => this.sale = response.data)
        .catch(error => alert(error.response.message))
        .finally(() => this.isLoading = !this.isLoading)
    },
  }
})

// Update Page
const Edit = Vue.component("update", { 
  template: "#edit",
})

// Defining routes
const routes = [
  { path: "/",          name:"index",  component: Index  },
  { path: "/create",    name:"create", component: Create },
  { path: "/:id",       name:"show",   component: Show,  },
  { path: "/:id/edit",  name:"edit",   component: Edit,  },
]

// Defining Router
const router = new VueRouter({ routes })

// App
const app = new Vue({
  store, // inject store into all child components
  router,
}).$mount("#app")
