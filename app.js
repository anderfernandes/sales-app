Vue.config.devtools = true // DISABLE THIS IN PRODUCTION
Vue.use(SemanticUIVue)
Vue.component("flatpickr", VueFlatpickr)

const store = new Vuex.Store({
	// alias to data in vue
	state: {
		creator_id        : 3,
		settings          : [],
		tickets           : [], // Each item represents and event and every event containts tickets for that event
    events            : [],
    dates             : [], // Array for dates of each event, index + 1 is event number
    eventOptions      : [], // Array of objects with event options, index + 1 is event number
    ticketOptions     : [], // Array of objects with tickets options, index + 1 is event number
		payments          : [],
		productOptions    : [],
		products          : [], // array, user defined
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
    showModal         : false
	},
	// ??
	mutations: {
    SET_DATES(state, payload) {
      Vue.set(state.dates, payload.index, payload.date)
    },
    SET_EVENT_OPTIONS(state, payload) {
      Vue.set(state.eventOptions, payload.index, payload.eventOptions)
    },
    SET_TICKET_OPTIONS(state, payload) {
      Vue.set(state.ticketOptions, payload.index, payload.ticketOptions)
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
		SET_EVENTS(state, payload)
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
		SET_TICKETS(state, payload) {
			state.tickets.splice(payload.index, 1, payload.tickets)
		},
		SET_PRODUCTS(state, products) {
			Vue.set(state, 'products', products)
		},
		SET_SETTINGS(state, settings) {
			state.settings = settings
		},
		SET_SUBTOTAL(state) {
			let productTotals = 0
			let ticketTotals  = 0
			
			// Calculating product totals
			if (state.products.length > 0)
				productTotals = state.products.reduce((total, product) => 
					(total + (product.amount * product.price)), 0
				)

			// Calculating ticket totals
			if (state.tickets.length > 0)
				state.tickets.forEach(ticketEventArray => 
					ticketTotals += ticketEventArray.reduce((total, ticket) => total + (ticket.price * ticket.amount), 0))

			state.subtotal = productTotals + ticketTotals
		},
		SET_TENDERED(state, tendered) {
			state.tendered = tendered
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
		SET_PRODUCT_OPTIONS(state, productOptions) {
			Vue.set(state, 'productOptions', productOptions)
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
		IS_LOADING(state) {
			state.isLoading = !(state.hasCustomerOptions && 
													state.hasGradeOptions    && 
													state.hasPaymentMethods  && 
													state.hasProductOptions  && 
													state.hasSettings)
		}
	},
	// alias to computed properties in vue
	getters: {
		creator_id      : state => state.creator_id,
		settings        : state => state.settings,
		taxableOptions  : state => state.taxableOptions,
		taxable         : state => state.taxable,
		ticket          : state => state.tickets,
		tickets         : state => state.tickets,
		productOptions  : state => state.productOptions,
		products        : state => state.products,
		subtotal        : state => state.subtotal,
		tax             : state => state.tax,
		total           : state => parseFloat(state.subtotal) + parseFloat(state.tax),
		tendered        : state => state.tendered,
		paymentMethods  : state => state.paymentMethods,
		paymentMethod   : state => state.paymentMethod,
		payments        : state => state.payments,
		sellToOptions   : state => state.sellToOptions,
		sellTo          : state => state.sellTo,
		saleStatuses    : state => state.saleStatuses,
		saleStatus      : state => state.saleStatus,
		customerOptions : state => state.customerOptions,
		customer        : state => state.customer,
		gradeOptions    : state => state.gradeOptions,
		grades          : state => state.grades,
		numberOfEvents  : state => state.numberOfEvents,
		reference       : state => state.reference,
		isLoading       : state => state.isLoading,
		events          : state => state.events,
		memo            : state => state.memo,
    change_due      : state => state.change_due,
    errors          : state => state.errors,
    hasErrors       : state => Object.keys(state.errors).length > 0,
    showModal       : state => state.showModal,
    dates           : state => state.dates,
    eventOptions    : state => state.eventOptions,
    ticketOptions   : state => state.ticketOptions,
	},
	// alias to methods in vue
	actions: {
    setDate(context, payload) {
      context.commit("SET_DATES", payload)
    },
    setEventOptions(context, payload) {
      context.commit("SET_EVENT_OPTIONS", payload)
    },
    setTicketOptions(context, payload) {
      context.commit("SET_TICKET_OPTIONS", payload)
    },
    setShowModal(context) {
      context.commit("SET_SHOW_MODAL")
    },
    setErrors(context, error) {
      context.commit("SET_ERRORS", error)
    },
		setMemo(context, memo) {
			context.commit('SET_MEMO', memo)
		},
		setProducts(context, products) {
			context.commit('SET_PRODUCTS', products)
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
			context.commit('SET_TENDERED')
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
			context.commit('SET_REFERENCE', reference)
		},
		fetchSettings(context) {
			axios
				.get("http://10.51.136.173:8000/api/settings")
				.then(response => {
					let tax = parseFloat(response.data.tax) / 100
					context.commit('SET_SETTINGS', { tax: tax })
					context.commit('HAS_SETTINGS', true)
					context.commit('IS_LOADING')
				})
		},
		fetchPaymentMethods(context) {
			axios
			.get("http://10.51.136.173:8000/api/payment-methods")
			.then(response => {
				let paymentMethods = response.data.data.map(payment_method => ({
					key  : payment_method.id, 
					text : payment_method.name,
					value: payment_method.id,
					icon : payment_method.icon
				}))
				context.commit('SET_PAYMENT_METHODS', paymentMethods)
				context.commit('HAS_PAYMENT_METHODS', true)
				context.commit('IS_LOADING')
			})
			.catch(error => alert("Unable to load payment methods."))
		},
		fetchCustomers(context) {
			axios
      	.get("http://10.51.136.173:8000/api/customers")
        .then(response => {
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
					context.commit('SET_CUSTOMER_OPTIONS', customerOptions)
					context.commit('HAS_CUSTOMER_OPTIONS', true)
					context.commit('IS_LOADING')
				})
        .catch(error => alert("Unable to load customers."))
		},
		fetchGrades(context) {
			axios
				.get("http://10.51.136.173:8000/api/grades")
				.then(response => {
					let gradeOptions = response.data.data.map(grade => ({
						key  : grade.id,
						text : grade.name,
						value: grade.id,
					}))
					context.commit('SET_GRADE_OPTIONS', gradeOptions)
					context.commit('HAS_GRADE_OPTIONS', true)
					context.commit('IS_LOADING')
				})
				.catch(error => alert("Unable to load grades."))
		},
		fetchProducts(context) {
			axios
				.get("http://10.51.136.173:8000/api/products")
				.then(response => { 
					let productOptions = response.data.data.map(product => ({
						key  : product.id,
						text : `${product.name} (${product.type.name})`,
						value: { 
							id         : product.id, 
							price      : product.price, 
							amount     : 0, 
							icon       : "box",
							type       : product.type,
							name       : product.name,
							description: product.description,
							cover      : product.cover,
						},
						icon : "box",
						// Non-dropdown properties
						id				 : product.id,
						name			 : product.name,
						amount   : 0,
						type       : product.type,
						description: product.description,
						price      : product.price,
						cover      : product.cover,
					}))
					context.commit('SET_PRODUCT_OPTIONS', productOptions)
					context.commit('HAS_PRODUCT_OPTIONS', true)
					context.commit('IS_LOADING')
				})
				.catch(error => alert("Unable to load products."))
		}
	},
})

const Modal = Vue.component("modal", {
  template: "#modal",
  computed: {
    open: {
      set() { store.dispatch('SET_SHOW_MODAL') },
      get() { return store.getters.showModal }
    }
  },
})

const EventForm = Vue.component("event-form", {
	template: "#event-form",
	props: ["type", "cashier"],
	data: () => ({
		//eventOptions: [],
		//date: dateFns.format(new Date(), "dddd, MMMM DD, YYYY"),
		//ticketOptions: [],
		selectedTickets: [],
		flatpickrConfig: {
			dateFormat: "l, F j, Y",
			defaultDate: "today",
		}
	}),
	methods: {
		// Fetch Events
		fetchEvents() {
			let date = dateFns.format(new Date(this.date), "YYYY-MM-DD")
			axios
				.get(`http://10.51.136.173:8000/api/events?start=${date}&type=${this.type}`)
				.then(response => {
					let eventOptions = response.data.map(event => {
						let time = dateFns.format(new Date(event.start), "h:mm aa")
						return {
							key  : event.id,
							text : `${event.show.id == 1 ? event.memo : event.show.name} at ${time}`,
							value: event.id,
						}
          })
          store.dispatch("setEventOptions", { index: this.$vnode.key - 1, eventOptions: eventOptions})
				})
				.catch(error => alert("Unable to query available events."))
		},
		// Fetch Tickets
		fetchTickets() {
			axios
			.get(`http://10.51.136.173:8000/api/allowedTickets?event_type=${this.type}`)
			.then(response => {
				let ticketOptions = response.data.data.map(ticket => ({
					key              : ticket.id,
					text             : `${ticket.name}`,
					value            : { 
						id             : ticket.id, 
						type           : { id: ticket.id },
						amount         : 0, 
						price          : ticket.price,
						event          : { id: this.event },
						icon					 : "ticket", 
						name           : ticket.name,
						description    : ticket.description,
					},
					icon					 : "ticket", 
					id             : ticket.id,
					name           : ticket.name,
					description    : ticket.description,
					price					 : ticket.price,
					active         : ticket.active,
					amount         : 0,
					type_id        : ticket.id,
					event_id       : this.event,
				}))
				store.dispatch("setTicketOptions", { index: this.$vnode.key - 1, ticketOptions: ticketOptions })
			})
			.catch(error => console.log(error.message))
		},
		// Update Tickets in Store
		updateTickets() {
			this.selectedTickets.forEach(ticket => Vue.set(ticket, 'event', { id: this.event }))
			let tickets = {
				index: this.$vnode.key - 1,
				tickets: this.selectedTickets
			}
			this.$store.commit('SET_TICKETS', tickets)
		},
	},
	computed: {
    date: {
      set(date) { store.dispatch("setDate", { index: this.$vnode.key - 1, date: date }) },
      get() { return store.getters.dates[this.$vnode.key -1] }
    },
    eventOptions: {
      set(eventOptions) { store.dispatch("setEventOptions", { index: this.$vnode.key - 1, eventOptions }) },
      get() { return store.getters.eventOptions[this.$vnode.key - 1] }
    },
    ticketOptions: {
      set(ticketOptions) { store.dispatch("setTicketOptions", { index: this.$vnode.key, ticketOptions }) },
      get() { return store.getters.ticketOptions[this.$vnode.key - 1] }
    },
		event: {
			set(event_id) { 
				let event = {
					index: this.$vnode.key - 1,
					event_id: event_id,
				}
				this.$store.commit('SET_EVENTS', event) 
			},
			get() { return this.$store.getters.events[this.$vnode.key - 1] }
		}
  },
  created() {
    // If this event has been defined in store, dispatch and get what's stored in state
    if (store.getters.dates[this.$vnode.key -1]) {
      this.fetchEvents()
      this.fetchTickets()
    } else { // If not, set defaults
      this.date = dateFns.format(new Date(), "dddd, MMMM DD, YYYY")
      this.eventOptions = []
      this.ticketOptions = []
    }
	},
	mounted() {
    
    //this.fetchEvents()
    //this.fetchTickets()
	},
	
	updated() {
    
		this.$store.dispatch('calculateTotals')
	}
})

// App
let app = new Vue({
	el: "#sales-form",
	store, // inject store into all child components
	components: { EventForm },
  data: () => ({
		currencySettings: {
			minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
	}),
  created() {
		this.$store.dispatch('fetchSettings')
		this.$store.dispatch('fetchCustomers')
		this.$store.dispatch('fetchGrades')
		this.$store.dispatch('fetchProducts')
		this.$store.dispatch('fetchPaymentMethods')
		// Fetch payments if a sale exists?
		//console.log(this.$vnode.key)
	},
	updated() {
    this.$store.dispatch('calculateTotals')
	},
	computed: {
		memo: {
			set(memo) { this.$store.dispatch('setMemo', memo) },
			get()     { return this.$store.getters.memo }
		},
		payments() {
			return this.$store.getters.payments
		},
		productOptions() {
			return this.$store.getters.productOptions
		},
		products: {
			set(newProduct) { this.$store.dispatch('setProducts', newProduct) },
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
			return this.$store.getters.subtotal.toLocaleString("en-US", this.currencySettings)
		},
		tax() {
			return this.$store.getters.tax.toLocaleString("en-US", this.currencySettings)
		},
		total() {
			return this.$store.getters.total.toLocaleString("en-US", this.currencySettings)
		},
		tendered: {
			get() { 
				return this.$store.getters.tendered.toLocaleString("en-US", this.currencySettings)
			},
			set(tendered) { 
				this.$store.commit('SET_TENDERED', tendered) 
			}
		},
		paid() {
			// Check if sale data and tendered exists, if not, return 0
			/*if (parseFloat(this.tendered) > 0)
				return parseFloat(this.tendered).toLocaleString("en-US", {maximumFractionDigits: 2})
			else*/
				return (0).toLocaleString("en-US", this.currencySettings)
		},
		balance() {
			// Check if sale data exists and payments exist, if not, return 0
			let result = parseFloat(this.total) - parseFloat(this.tendered)
			if (result >= 0)
				return result.toLocaleString("en-US", this.currencySettings)
			else 
				return (0).toLocaleString("en-US", this.currencySettings)
		},
		change_due() {
			return this.$store.getters.change_due.toLocaleString("en-US", this.currencySettings)
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
		isLoading() {
			return this.$store.getters.isLoading
    },
    isValid() {
      let errors = {}
      if (parseFloat(this.change_due) < 0)
        errors.change_due = ["Change due must be greater or equal to zero."]
      if (parseFloat(this.tendered) < 0)
        errors.tendered = ["Tendered must be a positive number."]
      if ((this.paymentMethod != 1) && (this.reference.length == 0))
        errors.reference = ["You must leave a reference if the customer not paying with cash."]
      this.$store.dispatch("setErrors", errors)
      return !this.$store.getters.hasErrors
    },
	},
  methods: {
		// Add a new event form for another event
		addEvent(event) {
			event.preventDefault()
			this.numberOfEvents++
    },
		submit(event) {
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
      if (this.isValid)
      {
        axios({
          method: "POST",
          data  : request,
          headers: { "content-type": "application/json" },
          url    : "http://10.51.136.173:8000/api/sales", 
        })
        //.then(response => alert(response.message))
        .catch(error => { alert("Unable to save this sale at this time.") })
      } else {
        this.$store.dispatch("setShowModal")
      }
		}
  },
})
