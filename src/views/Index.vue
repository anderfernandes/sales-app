<template>
  <div class="ui container">

    <sui-dimmer :active="isLoading" inverted>
      <sui-loader content="Loading sales, please wait..." />
    </sui-dimmer>

    <div class="ui basic segment">

      <modal id="event-type">
        <sui-header icon="info circle">Select the event type</sui-header>
        <sui-segment :style="{ backgroundColor: event_type.color, color: 'white' }" id="event-type"
                      @click="$router.push({ name: 'create', query: { type: event_type.id } }); $store.commit('TOGGLE_MODAL', false)"
                      v-for="event_type in event_types" :key="event_type.id">
          <div class="ui inverted small header">
            {{ event_type.name }}
            <div class="sub header">{{ event_type.description }}</div>
            <div class="ui divider"></div>
            <div class="sub header">
              Available tickets:
              <div class="ui label" v-for="ticket in event_type.allowed_tickets" :key="ticket.id"
                  style="background-color: transparent; border-width: 1px; border-color:white">
                  <i class="ticket icon"></i> {{ ticket.name }}
                  <div class="detail">$ {{ parseFloat(ticket.price).toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </sui-segment>
        <sui-modal-actions>
            <sui-button inverted @click="$store.commit('TOGGLE_MODAL', false)" icon="close">
              Close
            </sui-button>
        </sui-modal-actions>
      </modal>
      
      <div class="ui form" v-if="!isLoading">
        <div class="five inline fields">
          <div class="field">
            <div class="ui fluid icon input">
              <input type="number" min="1" placeholder="Sale #">
              <i class="search icon"></i>
            </div>
          </div>
          <div class="field">
            <sui-dropdown placeholder="All Customers"
                          v-model="query.customer_id" 
                          :options="customers" 
                          search fluid selection />
          </div>
          <div class="field">
            <sui-dropdown placeholder="All Organizations"
                          v-model="query.organization_id" 
                          :options="organizations" 
                          search fluid selection />
          </div>
          <div class="field">
            <sui-dropdown placeholder="All Sales Statuses" 
                          v-model="query.status" 
                          :options="statuses" 
                          search fluid selection />
          </div>
          <div class="field">
            <sui-dropdown placeholder="All Cashiers" 
                          v-model="query.cashier_id" 
                          :options="cashiers" 
                          search fluid selection />
          </div>
        </div>
      </div>

      <div v-if="sales.length > 0">  
        <transition-group name="list" tag="div" appear>
          <div :class="`ui ${sale.status} sale segment`" v-for="sale in sales" :key="sale.id" 
              :style="getSaleColor(sale.status)" 
              @click="$router.push({name: 'show', params: { id: sale.id }})">
            <div class="ui items">
              <sale-box :sale="sale" :key="sale.id"></sale-box>
            </div>
          </div>
        </transition-group>
      </div>
      
      <observer @intersect="fetchSales"></observer>

      <sui-button icon="pencil" circular color="black" @click="$store.commit('TOGGLE_MODAL', true)"
                  labelPosition="left"
                  style="position:fixed; z-index: 999; right: 11rem; bottom: 3rem">
        Create Sale
      </sui-button>

    </div>
  </div>
</template>

<script>

  import { mapActions, mapGetters } from 'vuex'
  
  export default {
    data: () => ({
      query: {
        id              : null,
        customer_id     : null,
        organization_id : null,
        status          : null,
        cashier_id      : null,
      },
    }),
    components: { 
      SaleBox  : () => import('../components/SaleBox'), 
      Observer : () => import('../components/Observer'),
      Modal    : () => import('../components/Modal'),
    },
    methods: {
      ...mapActions(['fetchSales', 'fetchCustomers', 'fetchOrganizations', 'fetchCashiers', 'fetchEventTypes'])
    },
    computed: {
      ...mapGetters(['sales', 'customers', 'organizations', 'cashiers', 'event_types', 'statuses', 'page']),
      
      // Loading spinner
      isLoading: {
        set(value) { this.$store.commit("SET_IS_LOADING", value) },
        get()      { return this.$store.getters.isLoading }
      },
    

    },
    async created() {
      document.title = `Astral - Sales`
      this.isLoading = await true
      await this.fetchEventTypes()
      await this.fetchCustomers()
      await this.fetchOrganizations()
      await this.fetchCashiers()
      this.isLoading = await false
    },
  }
</script>
