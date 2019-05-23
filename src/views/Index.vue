<template>
  <div class="ui container">
    <div class="ui basic segment">
      
      <div class="ui form">
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

      <sui-dimmer :active="isLoading" inverted>
        <sui-loader content="Loading sales, please wait..." />
      </sui-dimmer>

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
    },
    methods: {
      ...mapActions(['fetchSales', 'fetchCustomers', 'fetchOrganizations', 'fetchCashiers'])
    },
    computed: {
      ...mapGetters(['sales', 'customers', 'organizations', 'cashiers', 'statuses', 'page']),
      
      // Loading spinner
      isLoading: {
        set(value) { this.$store.dispatch("setIsLoading", value) },
        get()      { return this.$store.getters.isLoading }
      },
    

    },
    async created() {
      this.isLoading = await true
      await this.fetchCustomers()
      await this.fetchOrganizations()
      await this.fetchCashiers()
      this.isLoading = await false
    },
  }
</script>
