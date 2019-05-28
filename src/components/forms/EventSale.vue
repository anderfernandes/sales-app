<template>
  <sui-segment inverted :loading="isLoading">
    
    <div class="ui inverted horizontal divider header">
      <i class="calendar check icon"></i> Event # {{ $vnode.key + 1 }}
    </div>
    
    <div class="required field">
      <label for="date">Date</label>
      <div class="ui left icon input">
        <i class="calendar alternate outline icon"></i>
        <flatpickr placeholder="Date" v-model="date" :config="flatpickrConfig" />
      </div>
    </div>

    <div class="required field" v-if="eventOptions">
      <label for="event">Event</label>
      <sui-dropdown fluid selection direction="upward"
                    v-model="event" 
                    :options="eventOptions" 
                    :placeholder="placeholder" />
    </div>

    <transition appear mode="out-in" name="fade">
      <div class="ui inverted segment" v-if="!isLoading && event != null">
        <div class="ui items">
          <div class="item">
            <div class="image">
              <img :src="event.show.cover" :alt="event.show.name">
            </div>
            <div class="content">
              <div class="header" style="color:white">
                {{ event.show.name }}
              </div>
              <div class="meta">
                <p style="color:white">
                  <i class="calendar alternate icon"></i>
                  {{ format(new Date(event.start), $dateFormat.long) }}
                  {{ distanceInWordsToNow(new Date(event.start), { addSuffix: true }) }}
                </p>
              </div>
              <div class="meta">
                <div class="ui inverted header">
                  <div class="ui basic label" style="margin-left:0">
                    {{ event.show.type }}
                  </div>
                  <div class="ui basic label">
                    {{ event.type }}
                  </div>
                  <div class="ui basic label">
                    {{ event.show.duration }} minutes
                  </div>
                  <div class="ui basic label">
                    {{ event.seats }} {{ event.seats == 1 ? 'seat' : 'seats' }} available
                  </div>
                </div>
              </div>
              <div class="description">
                <p style="color:white">{{ event.show.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition appear mode="out-in" name="fade">
      <div class="required field" v-if="event">
        <label>Tickets</label>
        <sui-dropdown fluid selection direction="upward"
                      multiple 
                      placeholder="Select tickets"
                      :options="ticketOptions"
                      v-model="tickets"
        />
      </div>
    </transition>

    <transition appear mode="out-in" name="fade">
      <table class="ui selectable single line very compact fixed table" v-if="tickets && tickets.length > 0">
        <thead>
          <tr class="header">
            <th>Ticket</th>
            <th>Amount / Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody name="fade" is="transition-group" appear mode="out-in">
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>
              <div class="ui small header">
                <i class="ticket icon"></i>
                <div class="content">
                  {{ ticket.name }} 
                  <div class="sub header">{{ ticket.description }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="ui black basic icon button" @click="ticket.amount >= 1 ? ticket.amount++ : null">
                <i class="plus icon"></i>
              </div>
              <div class="ui black basic icon button" @click="ticket.amount = 1">
                <i class="refresh icon"></i>
              </div>
              <div class="ui black basic icon button" @click="ticket.amount >= 1 ? ticket.amount-- : null">
                <i class="minus icon"></i>
              </div>
              &nbsp;
              <div class="ui right labeled input">
                <input type="text" 
                        style="width:auto"
                        size="1"
                        min="1"
                        :max="event.seats"
                        v-model.number="ticket.amount"
                        @input="$store.commit('CALCULATE_TOTALS')" 
                        placeholder="Amount">
                <div class="ui basic label">
                  $ {{ ticket.price.toFixed(2) }} each
                </div>
              </div>
              &nbsp;
              <div class="ui red basic icon button" @click="removeTicket(ticket.id)">
                <i class="trash icon"></i>
              </div>
            </td>
            <td>
              1
              
                <input type="range" v-model.number="ticket.amount" min="1" :max="event.seats" style="width:75%">
              
              {{ event.seats }}
            </td>
          </tr>
        </tbody>
      </table>
    </transition>

  </sui-segment>
</template>

<script>

  import { format, distanceInWordsToNow } from 'date-fns'
  import axios     from 'axios'
  import flatpickr from 'vue-flatpickr-component'
  import 'flatpickr/dist/flatpickr.css'

  const SERVER = "http://10.51.158.161:8000"

  export default {
    data: () => ({
      flatpickrConfig: {
        dateFormat: "l, F j, Y",
        defaultDate: "today",
      },
      date          : null,
      eventOptions  : [],
      ticketOptions : [],
      isLoading     : true,
    }),
    components: { flatpickr },
    watch : {
      async date() { 
        this.isLoading = true
        await this.fetchEventOptions()
        this.isLoading = false
      },
      tickets: {
        handler : function() { this.$store.commit('CALCULATE_TOTALS') },
        deep    : true,
      }
    },
    methods: {
      format,
      distanceInWordsToNow,
      // Fetch Events
      async fetchEventOptions() {
        let date = format(new Date(this.date), "YYYY-MM-DD")
        try {
          const response = await axios.get(`${SERVER}/api/events?start=${date}&type=${this.$route.query.type}`)
          // Array with all event objects to show in box below event selection dropdown
          this.eventOptions = response.data.map(event => {
            let time = format(new Date(event.start), "h:mm aa")
            return {
              key  : event.id,
              text : `#${event.id} - ${event.show.id == 1 ? event.memo : event.show.name} at ${time} (${event.type}, ${event.seats} ${event.seats == 1 ? "seat" : "seats"} left)`,
              value: event,
            }
          })
          // await this.$store.dispatch("setEventOptions", { index: this.$vnode.key - 1, eventOptions: eventOptions})
        } catch (error) {
          alert(`fetchEventOptions in EventForm failed: ${ error.message }`)
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
          const response = await axios.get(`${SERVER}/api/allowedTickets?event_type=${this.$route.query.type}`)
          this.ticketOptions = response.data.data.map(ticket => {
            Object.assign(ticket, { amount: 1 })
            return {
              key   : ticket.id,
              text  : ticket.name,
              icon  : 'ticket',
              value : ticket,
            }
          })
        } catch (error) {
          alert(`fetchTicketTypes in EventForm failed: ${error.message}`)
        }
      },
      // Remove ticket from state
      removeTicket(id) {
        this.$store.commit('REMOVE_TICKET', { index: this.$vnode.key, id })
      }
    },
    async created() {
      this.isLoading = true
      await this.fetchEventOptions()
      await this.fetchTicketsTypes()
      this.isLoading = false
    },
    computed: {
      placeholder() {
        return (this.eventOptions) && (this.eventOptions.length == 0) 
              ? 'No events found' 
              : `${ this.eventOptions.length } ${ this.eventOptions.length == 1 ? 'event' : 'events'} found` 
      },
      event: {
        set(value) { this.$store.commit('SET_EVENT', { index: this.$vnode.key, event: value }) },
        get()      { return this.$store.getters.sale.events[this.$vnode.key] }
      },
      tickets: {
        set(value) { this.$store.commit('SET_TICKETS', { index: this.$vnode.key, tickets: value }) },
        get()      { return this.$store.getters.sale.tickets[this.$vnode.key] },
      },
    },
  }
</script>
