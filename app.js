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
		settings: [],
		tickets: [], // Each item represents and event and every event containts tickets for that event
		// id
		products: [], // array, user defined
		subtotal : 0,
		taxable  : 0,
		tax      : 0,
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
		}
	},
	// alias to computed properties in vue
	getters: {
		settings(state) {
			return state.settings
		},
		taxable(state) {
			return state.taxable
		},
		ticket(state, getters) {
			return state.tickets
		},
		products(state, getters) {
			return state.products
		},
		subtotal(state, getters) {
			return state.subtotal
		},
		tax(state, getters) {
			return state.tax
		},
		total(state, getters) {
			return state.total
		}
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
		fetchSettings(context) {
			axios
				.get("http://10.51.136.173:8000/api/settings")
				.then(response => {
					let tax = parseFloat(response.data.tax) / 100
					context.commit('SET_SETTINGS', { tax: tax })
				})
		},
	},
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
	saleStatus: "open",
	sellTo        : null,
	customer      : null,
	grades        : null,
	tendered      : 0,
	paymentMethod : 1,
	numberOfEvents: 1,
	reference     : "",
	tickets       : [],
	// Component Data
	sellToOptions   : [
		{ key: "organization", text: "Organization", value: 1 },
		{ key: "customer", text: "Customer", value: 0 },
	],
	customerOptions : [],
	saleStatuses    : [
		{ key: "open"     ,  text: "Open"     , value: "open"     , icon: "unlock"},
		{ key: "confirmed",  text: "Confirmed", value: "confirmed", icon: "thumbs up"},
		{ key: "complete" ,  text: "Completed", value: "complete" , icon: "check"},
		{ key: "tentative",  text: "Tentative", value: "tentative", icon: "help"},
		{ key: "no show"  ,  text: "No Show"  , value: "no show"  , icon: "thumbs down"},
	],
	gradeOptions    : [],
	productOptions  : [],
	taxableOptions  : [
		{ key: "No",  text: "No",  value: 0 },
		{ key: "Yes", text: "Yes", value: 1 },
	],
	paymentOptions  : [],
	selectedProducts: [],
}

// App
let app = new Vue({
	el: "#sales-form",
	store, // inject store into all child components
	components: { EventForm },
  data: data,
  created() {
		this.$store.dispatch('fetchSettings')
  	this.fetchCustomers()
		this.fetchGrades()
		this.fetchProducts()
		this.fetchPaymentMethods()
		
		//console.log(this.$vnode.key)
	},
	updated() {
		this.$store.dispatch('calculateTotals')
	},
	computed: {
		products: {
			set(newProduct) { this.$store.dispatch('setProducts', newProduct) },
			get() { return this.$store.getters.products },
		},
		taxable: {
			set(taxable) { this.$store.dispatch('setTaxable', taxable) },
			get() { return this.$store.getters.taxable }
		},
		subtotal() {
			return this.$store.getters.subtotal.toLocaleString("en-US", {minimumFractionDigits: 2})
		},
		tax() {
			return this.$store.getters.tax.toLocaleString("en-US", {minimumFractionDigits: 2})
		},
		total() {
			if (this.taxable)
				return (parseFloat(this.subtotal) + (parseFloat(this.tax)))
					.toLocaleString("en-US", {minimumFractionDigits: 2})
			else
				return this.subtotal
		},
		paid() {
			// Check if sale data and tendered exists, if not, return 0
			if (parseFloat(this.tendered) > 0)
				return parseFloat(this.tendered).toLocaleString("en-US", {minimumFractionDigits: 2})
			else
				return (0).toLocaleString("en-US", {minimumFractionDigits: 2})
		},
		balance() {
			// Check if sale data exists and payments exist, if not, return 0
			let result = parseFloat(this.total) - parseFloat(this.tendered)
			if (result >= 0)
				return result.toLocaleString("en-US", {minimumFractionDigits: 2})
			else 
				return (0).toLocaleString("en-US", {minimumFractionDigits: 2})
		},
		change_due() {
			return (parseFloat(this.total) - parseFloat(this.tendered))
							.toLocaleString("en-US", {minimumFractionDigits: 2})
		},
		settings() {
			return this.$store.getters.settings
		}
	},
  methods: {
		// Fetch Customers
  	fetchCustomers() {
    	axios
      	.get("http://10.51.136.173:8000/api/customers")
        .then(response => this.customerOptions = response.data.map(customer => {
					let organization = (customer.organization.id != 1)
														 ? `, ${customer.organization.name}` : ``
					return {
	        	key : customer.id,
	          text: `${customer.name} (${customer.role}${organization})`,
						value: customer.id,
						icon: "user circle",
						organization: { id: customer.organization.id },
					}
        }))
        .catch(error => alert("Unable to load customers."))
    },
		// Fetch Grades
		fetchGrades() {
			axios
				.get("http://10.51.136.173:8000/api/grades")
				.then(response => this.gradeOptions = response.data.data.map(grade => ({
					key  : grade.id,
					text : grade.name,
					value: grade.id,
				})))
				.catch(error => alert("Unable to load grades."))
		},
		// Fetch Products
		fetchProducts() {
			axios
				.get("http://10.51.136.173:8000/api/products")
				.then(response => this.productOptions = response.data.data.map(product => ({
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
				})))
				.catch(error => alert("Unable to load products."))
		},
		// Fetch Payment Methods
		fetchPaymentMethods() {
			axios
				.get("http://10.51.136.173:8000/api/payment-methods")
				.then(response => this.paymentOptions = response.data.data.map(payment_method => ({
					key  : payment_method.id, 
					text : payment_method.name,
					value: payment_method.id,
					icon : payment_method.icon
				})))
				.catch(error => alert("Unable to load payment methods."))
		},
		// Fetch Settings
		fetchSettings() {
			
		},
		// Add a new event form for another event
		addEvent(event) {
			event.preventDefault()
			this.numberOfEvents++
		},
  },
})
