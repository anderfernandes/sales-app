Vue.config.devtools = true // DISABLE THIS IN PRODUCTION
Vue.use(SemanticUIVue)
Vue.component("flatpickr", VueFlatpickr)

const store = new Vuex.Store({
	// alias to data in vue
	state: {

	},
	// alias to methods in vue
	actions: {

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
		fetchTickets() {
			axios
			.get(`http://10.51.136.173:8000/api/allowedTickets?event_type=${this.type}`)
			.then(response => {
				this.ticketOptions = response.data.data.map(ticket => ({
					key            : ticket.id,
					text           : `${ticket.name}`,
					value          : ticket.id,
					icon					 : "ticket", 
					id             : ticket.id,
					name           : ticket.name,
					description    : ticket.description,
					price					 : ticket.price,
					active         : ticket.active,
					in_cashier     : ticket.in_cashier,
					public				 : ticket.public,
					quantity       : 0,
					type_id        : ticket.id,
					event_id       : this.event,
					//customer_id    : this.customer.id,
					cashier_id     : this.cashier.id,
					//organization_id: this.customer.organization.id,
				}))
				
			})
			.catch(error => console.log(error.message))
		},
	},
	computed: {
		formattedDate() {
			let date = new Date(this.date)
			let day = date.toLocaleDateString("en-us", { weekday: "long" })
			let month = date.toLocaleDateString("en-us", { month: "long" })
			let formattedDate = `${day}, ${month} ${date.getDate()}, ${date.getFullYear()}`
			return formattedDate
		},
		/*total() {
			return this.ticketOptions
							.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0)
		}*/
	},
	created() {
		this.fetchTickets()
		this.fetchEvents()
	},
	updated() {
		
	}
})

// App
let app = new Vue({
	el: "#sales-form",
  data() {
  	return {
      // Sale Data
      saleStatus: "open",
      sellTo: null,
      customer: null,
      grades: null,
			taxable: false,
			tendered: 0,
			settings: { tax: 0 },
			paymentMethod: 1,
			numberOfEvents: 1,
			reference: "",
      // Component Data
      sellToOptions: [
      	{ key: "organization", text: "Organization", value: 1 },
        { key: "customer", text: "Customer", value: 0 },
      ],
      customerOptions : [],
      saleStatuses: [
      	{ key: "open"     ,  text: "Open"     , value: "open"     , icon: "unlock"},
				{ key: "confirmed",  text: "Confirmed", value: "confirmed", icon: "thumbs up"},
				{ key: "complete" ,  text: "Completed", value: "complete" , icon: "check"},
				{ key: "tentative",  text: "Tentative", value: "tentative", icon: "help"},
				{ key: "no show"  ,  text: "No Show"  , value: "no show"  , icon: "thumbs down"},
      ],
      gradeOptions: [],
			productOptions: [],
			selectedProducts: [],
      taxableOptions: [
      	{ key: "No",  text: "No",  value: false },
        { key: "Yes", text: "Yes", value: true },
      ],
      paymentOptions: [],
    }
  },
  created() {
		this.fetchSettings()
  	this.fetchCustomers()
		this.fetchGrades()
		this.fetchProducts()
		this.fetchPaymentMethods()
		
		//console.log(this.$vnode.key)
	},
	updated() {
		//console.log(this.total)
	},
	computed: {
		subtotal() {
			if (this.selectedProducts.length > 0)
				// ticket quantity's data comes from product options array
				return this.productOptions.reduce((total, product) => 
					(total + (product.quantity * product.price)), 0
				).toLocaleString("en-US", {minimumFractionDigits: 2})
			else 
				return (0).toLocaleString("en-US", {minimumFractionDigits: 2})
		},
		tax() {
			if (this.taxable)
				return (parseFloat(this.subtotal) * this.settings.tax)
					.toLocaleString("en-US", {minimumFractionDigits: 2})
			else
				return (0).toLocaleString("en-US", {minimumFractionDigits: 2})
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
					value: { id: product.id, price: product.price, quantity: 0 },
					icon : "box",
					// Non-dropdown properties
					id				 : product.id,
					name			 : product.name,
					quantity   : 0,
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
			axios
				.get("http://10.51.136.173:8000/api/settings")
				.then(response => this.settings.tax = parseFloat(response.data.tax) / 100)
		},
		// Add a new event form for another event
		addEvent(event) {
			event.preventDefault()
			this.numberOfEvents++
		},
  },
})
