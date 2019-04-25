let dateFormat = { long: "dddd, MMMM D, YYYY [at] h:mm a" }

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

// Vuex global store
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
		payments          : [], // Sale payments
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
    }
	},
	// ??
	mutations: {
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
		SET_TICKETS(state, payload) {
			state.tickets.splice(payload.index, 1, payload.tickets)
		},
		SET_PRODUCTS(state, products) {
      state.products = products
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
    SET_PAYMENTS(state, payments) {
      state.payments = payments
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
	},
	// alias to methods in vue
	actions: {
    fetchSales(context) {
      let errors = {}
      errors.fetchSales = ["Unable to fetch sales"]
      axios
        .get("http://10.51.136.173:8000/api/sales?sort=desc&orderBy=id")
        .then(response => context.commit("SET_SALES", response.data.data))
        .catch(error => context.commit("SET_ERRORS", errors))
    },
    fetchEventTypes(context) {
      let errors = {}
      errors.fetchEventTypes = ["Unable to fetch event types"]
      axios
        .get("http://10.51.136.173:8000/api/event-types")
        .then(response => context.commit("SET_EVENT_TYPES", response.data))
        .catch(error => context.commit("SET_ERRORS", errors))
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
    setTicketOptions(context, payload) {
      context.commit("SET_TICKET_OPTIONS", payload)
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
			context.commit("SET_TENDERED")
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
		fetchSettings(context) {
			axios
				.get("http://10.51.136.173:8000/api/settings")
				.then(response => {
					let tax = parseFloat(response.data.tax) / 100
					context.commit('SET_SETTINGS', { tax: tax })
					context.commit('HAS_SETTINGS', true)
					//context.commit('SET_IS_LOADING')
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
				context.commit("SET_PAYMENT_METHODS", paymentMethods)
				context.commit("HAS_PAYMENT_METHODS", true)
				//context.commit("SET_IS_LOADING")
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
					context.commit("SET_CUSTOMER_OPTIONS", customerOptions)
					context.commit("HAS_CUSTOMER_OPTIONS", true)
					//context.commit("SET_IS_LOADING")
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
					context.commit("SET_GRADE_OPTIONS", gradeOptions)
					context.commit("HAS_GRADE_OPTIONS", true)
					//context.commit("SET_IS_LOADING")
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
						amount     : 0,
						type       : product.type,
						description: product.description,
						price      : product.price,
						cover      : product.cover,
					}))
					context.commit("SET_PRODUCT_OPTIONS", productOptions)
					context.commit("HAS_PRODUCT_OPTIONS", true)
					//context.commit('SET_IS_LOADING')
				})
        .catch(error => alert("Unable to load products."))
		}
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
	props: ["type", "cashier"],
	data: () => ({
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
			store.dispatch("setTickets", tickets)
		},
	},
	computed: {
    eventOptions: {
      set(eventOptions) { store.dispatch("setEventOptions", { index: this.$vnode.key - 1, eventOptions }) },
      get() { return store.getters.eventOptions[this.$vnode.key - 1] }
    },
    ticketOptions: {
      set(ticketOptions) { store.dispatch("setTicketOptions", { index: this.$vnode.key, ticketOptions }) },
      get() { return store.getters.ticketOptions[this.$vnode.key - 1] }
    },
    selectedTickets: {
      set(selectedTickets) {
        selectedTickets.forEach(ticket => Vue.set(ticket, 'event', { id: this.event }))
        store.dispatch("setTickets", { index: this.$vnode.key, tickets: selectedTickets })
      },
      get() { return store.getters.tickets[this.$vnode.key - 1] }
    },
    date: {
      set(date) { store.dispatch("setDate", { index: this.$vnode.key - 1, date: date }) },
      get() { return store.getters.dates[this.$vnode.key -1] }
    },
		event: {
			set(event_id) { 
				let event = {
					index: this.$vnode.key - 1,
					event_id: event_id,
				}
				this.$store.dispatch("setEvent", event) 
			},
			get() { return this.$store.getters.events[this.$vnode.key - 1] }
		}
  },
  created() {
    // If this event has been defined in store, dispatch and get what's stored in state
    if (store.getters.dates[this.$vnode.key -1]) {
      this.fetchEvents()
    } else { // If not, set defaults
      this.date = dateFns.format(new Date(), "dddd, MMMM DD, YYYY")
      this.eventOptions  = []
      this.ticketOptions = []
      this.fetchTickets()
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

// Sales Form
const SalesForm = Vue.component("sales-form", {
  props: ["type"],
  template: "#sales-form",
  components: { EventForm },
  created() {
		this.$store.dispatch('fetchSettings')
		this.$store.dispatch('fetchCustomers')
		this.$store.dispatch('fetchGrades')
		this.$store.dispatch('fetchProducts')
		this.$store.dispatch('fetchPaymentMethods')
    //console.log(this.$vnode.key)
    // Fetch payments if a sale exists?
    if (this.$route.params.id)
      this.fetchSale()
  },
  beforeMount() {

  },
	updated() {
    this.$store.dispatch("calculateTotals")
	},
	computed: {
    payments() {
      return this.$store.getters.payments
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
		payments() {
			return this.$store.getters.payments
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
    fetchSale() {
      let errors = {}
      errors.fetchSale = ["Unable to fetch sale"]
      axios
        .get(`http://10.51.136.173:8000/api/sale/${this.$route.params.id}`)
        .then(response => {
          let sale = response.data
          // Set sell to
          this.sellTo = sale.sell_to_organization ? 1 : 0
          // Set grades
          this.grades = sale.grades.map(grade => grade.id) // only id of grades
          // Set customer
          this.customer = sale.customer.id
          // Set product
          let products = sale.products.map(product => ({
            icon        : "box",
            amount      : product.quantity,
            cover       : `http://10.51.136.173:8000${product.cover}`,
            description : product.description,
            id          : product.id,
            name        : product.name,
            price       : parseFloat(product.price),
            type        : product.type
          }))
          this.products = products
          // Setting sale status
          this.saleStatus = sale.status
          // Setting memos
          this.memos = sale.memos
          // Setting subtotal
          //this.subtotal = sale.subtotal
          this.taxable = parseInt(sale.taxable)
          // Setting tendered
          this.paid = sale.payments.reduce((total, payment) => total + parseFloat(payment.total), 0)
          // Setting number of events
          // response.data.events.forEach(event => context.commit("SET_NUMBER_OF_EVENTS"))
          
          // Setting payments
          //context.commit("SET_PAYMENTS", response.data.payments)
          // Set products
          //context.commit("SET_PRODUCTS", response.data.products)
          
          
          // Set creator
          //context.commit("SET_CREATOR_ID", response.data.creator.id)
          // Set events
          /*response.data.events.forEach((event, index) => context.commit("SET_EVENTS", {
            index: index, event_id: event.id
          }))*/
        })
        .catch(error => alert(error.message))
    },
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
        .get("http://10.51.136.173:8000/api/sales?sort=desc&orderBy=id")
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
        .get(`http://10.51.136.173:8000/api/sale/${this.$route.params.id}`)
        .then(response => this.sale = response.data)
        .catch(error => alert(error.response.message))
        .finally(() => this.isLoading = !this.isLoading)
    },
  }
})

// Update Page
const Edit = Vue.component("update", { template: "#edit" })

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
