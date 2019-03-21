Vue.config.devtools = true // DISABLE THIS IN PRODUCTION
Vue.use(SemanticUIVue)
Vue.component("flatpickr", VueFlatpickr)

const EventForm = Vue.component("event-form", {
	template: "#event-form",
	props: ["type"],
	data: () => ({
		eventOptions: [],
		event: null,
		date: "",
		ticketOptions: [],
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
					this.eventOptions = response.data.map((event) => {
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
			.then(response => this.ticketOptions = response.data.data)
			.catch(error => alert("Unable to fetch tickets."))
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
	},
	created() {
		this.fetchTickets()
		this.fetchEvents()
	},
})

// App
new Vue({
	el: "#sales-form",
  data() {
  	return {
      // Sale Data
      saleStatus: "open",
      sellTo: null,
      customer: null,
      grades: null,
      taxable: 0,
			paymentMethod: 1,
			numberOfEvents: 1,
      // Component Data
      sellToOptions: [
      	{ key: "organization", text: "Organization", value: 1 },
        { key: "customer", text: "Customer", value: 0 },
      ],
      customerOptions : [],
      saleStatuses: [
      	{ key: "open",  text: "Open", value: "open"},
        { key: "confirmed",  text: "Confirmed", value: "confirmed"},
      ],
      gradeOptions: [],
			productOptions: [],
      taxableOptions: [
      	{ key: "No",  text: "No",  value: 0 },
        { key: "Yes", text: "Yes", value: 1 },
      ],
      paymentOptions: [],
    }
  },
  created() {
  	this.fetchCustomers()
		this.fetchGrades()
		this.fetchProducts()
		this.fetchPaymentMethods()
		//console.log(this.$vnode.key)
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
						icon: "user circle"
					}
        }))
        .catch(error => alert("Unable to load customers."))
    },
		// Fetch Grades
		fetchGrades() {
			axios
				.get("http://10.51.136.173:8000/api/grades")
				.then(response => this.gradeOptions = response.data.data.map((grade) => ({
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
				.then(response => this.productOptions = response.data.data)
				.catch(error => alert("Unable to load products."))
		},
		// Fetch Payment Methods
		fetchPaymentMethods() {
			axios
				.get("http://10.51.136.173:8000/api/payment-methods")
				.then(response => this.paymentOptions = response.data.data.map(payment_method => ({
					key: payment_method.id, 
					text: payment_method.name,
					value: payment_method.id,
					icon: payment_method.icon
				})))
				.catch(error => alert("Unable to load payment methods."))
		},
		// Add a new event form for another event
		addEvent(event) {
			event.preventDefault()
			this.numberOfEvents++
		}
  },
})
