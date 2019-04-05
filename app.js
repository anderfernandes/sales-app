Vue.config.devtools = true // DISABLE THIS IN PRODUCTION
Vue.use(SemanticUIVue)
Vue.component("flatpickr", VueFlatpickr)

const store = new Vuex.Store({
	// alias to data in vue
	state: {
		/*sale: {
			id                  : null,
			creator_id          : null,
			status              : "open", // comes from dropdown
			source              : "admin", 
			taxable             : false, // comes from dropdown
			subtotal            : 0,
			tax                 : 0,
			total               : 0,
			refund              : false,
			customer_id         : null,
			// organization_id  : null, // do it in server?
			sell_to_organization: false, // from dropdown
		},
		// id, start, end, memo, show_id, tickets : { id, amount }
		events  : [], // array of objects, user defined
		// id, cashier_id, payment_method_id, total, tendered, change_due, reference, source(admin), sale_id, refunded
		payments: [], // array of objects, user defined
		// id, name, message, author_id, sale_id
		memos   : [], // array of objects
		// id
		grades  : [], // array
		// ticket data */
		settings          : [],
		tickets           : [], // Each item represents and event and every event containts tickets for that event
		payments          : [],
		productOptions    : [],
		products          : [], // array, user defined
		subtotal          : 0,
		taxableOptions    : [
			{ key: "No",  text: "No",  value: 0 },
			{ key: "Yes", text: "Yes", value: 1 },
		],
		taxable           : 0,
		tax               : 0,
		tendered          : 0,
		paymentMethod     : 1, // Payment method chosen by user
		paymentMethods    : [], // Available payment methods
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
	},
	// ??
	mutations: {
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
					ticketTotals = ticketEventArray.reduce((total, ticket) => total + (ticket.price * ticket.amount), 0))
			
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
		settings        : state => state.settings,
		taxableOptions  : state => state.taxableOptions,
		taxable         : state => state.taxable,
		ticket          : state => state.tickets,
		productOptions  : state => state.productOptions,
		products        : state => state.products,
		subtotal        : state => state.subtotal,
		tax             : state => state.tax,
		total           : state => state.total,
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
	},
	// alias to methods in vue
	actions: {
		setProducts(context, products) {
			context.commit('SET_PRODUCTS', products)
		},
		calculateTotals(context) {
			context.commit('SET_TAX')
			context.commit('SET_SUBTOTAL')
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
	props: ["isLoading", "hasSettings", "hasPaymentMethods", "hasCustomers", "hasGrades", "hasProducts"],
	data: () => ({
		open: true,
	}),
})

const EventForm = Vue.component("event-form", {
	template: "#event-form",
	props: ["type", "customer", "cashier"],
	data: () => ({
		eventOptions: [],
		event: null,
		date: "",
		ticketOptions: [],
		selectedTickets: [],
		flatpickrConfig: {
			dateFormat: "l, F j, Y",
			defaultDate: "today",
		}
	}),
	methods: {
		// Fetch Events
		fetchEvents() {
			//let date = new Date(this.date)
			// Formats date in format YYYY-MM-DD
			//let start = date.toISOString().slice(0, 10)
			// Fetch data from server
			axios
				.get(`http://10.51.136.173:8000/api/events?start=${this.date}&type=${this.type}`)
				.then(response => {
					this.eventOptions = response.data.map(event => {
						let d    = new Date(event.start)
						// Format date and time
						let a    = d.getHours()   >= 12 ? "PM" : "AM"
						let m    = d.getMinutes() < 10  ? `0${d.getMinutes()}` : d.getMinutes()
						let h    = d.getHours()   > 12  ? d.getHours() - 12    : d.getHours()
						let time = `${h}:${m} ${a}`
						return {
							key  : event.id,
							text : `${event.show.name} at ${time}`,
							value: event.id,
						}
					})
				})
				.catch(error => alert("Unable to query available events."))
		},
		// Fetch Tickets
		fetchTickets() {
			axios
			.get(`http://10.51.136.173:8000/api/allowedTickets?event_type=${this.type}`)
			.then(response => {
				this.ticketOptions = response.data.data.map(ticket => ({
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
				
			})
			.catch(error => console.log(error.message))
		},
		// Update Tickets in Store
		updateTickets() {
			let data = {
				index: this.$vnode.key - 1,
				tickets: this.selectedTickets
			}
			this.$store.commit('SET_TICKETS', data)
		}
	},
	computed: {
		// Formats Date
		formattedDate() {
			let date = new Date(this.date)
			let day = date.toLocaleDateString("en-us", { weekday: "long" })
			let month = date.toLocaleDateString("en-us", { month: "long" })
			let formattedDate = `${day}, ${month} ${date.getDate()}, ${date.getFullYear()}`
			return formattedDate
		},
		// Gets total of tickets for this sale
		total() {
			return this.ticketOptions
							.reduce((total, ticket) => total + (ticket.price * ticket.amount), 0)
		}
	},
	created() {
		this.fetchEvents()
		this.fetchTickets()
	},
	updated() {
		this.$store.dispatch('calculateTotals')
	}
})

// Form Data
let data = {
	// Sale Data
	
}

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
			if (this.taxable)
				return (parseFloat(this.subtotal) + (parseFloat(this.tax)))
					.toLocaleString("en-US", this.currencySettings)
			else
				return this.subtotal.toLocaleString("en-US", this.currencySettings)
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
			return (parseFloat(this.total) - parseFloat(this.tendered))
							.toLocaleString("en-US", this.currencySettings)
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
		}
	},
  methods: {
		// Add a new event form for another event
		addEvent(event) {
			event.preventDefault()
			this.numberOfEvents++
		},
  },
})
