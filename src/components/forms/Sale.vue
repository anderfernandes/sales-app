<template>
  <div class="ui container">
    
    <sui-dimmer :active="isLoading" inverted>
      <sui-loader content="Loading..."></sui-loader>
    </sui-dimmer>
    
    <div class="ui basic segment">
    
      <modal></modal>
    
      <transition name="fade" mode="out-in">
        <div id="form" v-if="!isLoading">
          <!--- Buttons --->
          <div class="ui form">
            <div class="four inline fields" style="margin-bottom: 0">
              <div class="field">
              <sui-button basic color="black" icon="left chevron" 
                          @click="$router.push({ name: 'index' })">
                Back
              </sui-button>
              <sui-button @click="submit" label-position="left" color="green" icon="save"
                          :disabled="!enableSubmit">
                Save
              </sui-button>
            </div>
              <div class="field"></div>
              <div class="required field" style="text-align: right">
                <label>Status</label>
              </div>
              <div class="required field" style="padding: 0">
                <sui-dropdown fluid selection direction="downward"
                              v-model="sale.status"
                              :options="statuses"
                              placeholder="Sale Status"
                />
              </div>
            </div>
          </div>
          <!-- Form -->
          <div class="ui container">
            
            <br>

            <!--- Sale --->
            <div class="ui segment">
              <div class="ui horizontal divider header">
                <i class="dollar icon"></i> Sale
              </div>
              <sui-form>
                <sui-form-field required>
                  <label>Sell to</label>
                  <sui-dropdown fluid selection direction="upward"
                                v-model="sale.sell_to"
                                :options="sell_to"
                                placeholder="Sell To"
                                :error="errors.hasOwnProperty('sell_to')"></sui-dropdown>
                  <transition mode="out-in" name="fade">
                    <sui-label basic color="red" pointing 
                                v-if="errors.hasOwnProperty('sell_to')">
                      {{ errors.sell_to[0] }}
                    </sui-label>
                  </transition>
                </sui-form-field>
                <sui-form-field required>
                  <label>Customer</label>
                  <sui-dropdown fluid direction="upward"
                                v-model="sale.customer"
                                :options="customers"
                                placeholder="Customer"
                                search selection></sui-dropdown>
                  <transition mode="out-in" name="fade">
                    <sui-label basic color="red" pointing 
                                v-if="errors.hasOwnProperty('customer')">
                      {{ errors.customer[0] }}
                    </sui-label>
                  </transition>
                </sui-form-field>
                <sui-form-field>
                  <label>Grades</label>
                  <sui-dropdown fluid multiple direction="upward"
                                v-model="sale.grades"
                                :options="grades"
                                placeholder="Grades"
                                selection 
                  />
                </sui-form-field>
  
                <!-- Event Form -->
                <div id="events">
                  <transition-group mode="out-in" name="fade">    
                    <event-form v-if="sale.customer != null" 
                                v-for="(n, i) in numberOfEvents"
                                :key="i"
                    />
                  </transition-group>
                </div>
  
                <br />

                <!-- Add Another Event -->
                <transition appear mode="out-in" name="fade">
                  <sui-button v-if="(sale.customer != null)"
                              label-position="left" 
                              color="black" 
                              icon="calendar plus alternate"
                              @click.prevent="addEvent"
                              >
                    Add Another Event
                  </sui-button>
                </transition>
                
                <!-- Products -->
                <div class="ui segment" v-if="products.length > 0">
                  <div class="ui horizontal divider header">
                    <i class="box icon"></i> Products
                  </div>
                  <div class="ui form">
                      <div class="field">
                        <sui-dropdown fluid selection multiple search
                                      placeholder="Select products"
                                      :options="products"
                                      v-model="sale.products" v-if="products[0].icon != undefined"
                        />
                    </div>
                  </div>
                  <transition mode="out-in" name="fade">
                    <div id="products" v-if="sale.products.length > 0">
                      <br>
                      <table class="ui selectable single line very compact table">
                      <thead>
                        <tr class="header">
                          <th>Product</th>
                          <th>Amount / Price</th>
                        </tr>
                      </thead>
                        <tbody name="fade" is="transition-group" mode="out-in">
                          <tr v-for="product in sale.products"
                              :key="product.id">
                            <td>
                              <div class="ui small header">
                              <img :src="product.cover">
                                <div class="content">
                                  {{ product.name }}
                                  <div class="ui tiny black label">
                                    {{ product.type.name }}
                                  </div>
                                  <div class="sub header">
                                    {{ product.description }}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <sui-button icon="plus" color="black" basic
                                          @click.prevent="product.amount++" />
                              <sui-button icon="refresh" color="black" basic :disabled="product.amount == 1"
                                          @click.prevent="product.amount = 1" />
                              <sui-button icon="minus" color="black" basic :disabled="product.amount == 1"
                                          @click.prevent="product.amount--" />
                              &nbsp;
                              <div class="ui right labeled input">
                                <input type="text" 
                                        style="width:auto"
                                        size="1"
                                        min="0" 
                                        v-model.number="product.amount"
                                        @input="$store.commit('CALCULATE_TOTALS')" 
                                        placeholder="Amount">
                                <div class="ui basic label">
                                  $ {{ product.price.toFixed(2) }} each
                                </div>
                              </div>
                              &nbsp;
                              <div class="ui red basic icon button" @click="$store.commit('REMOVE_PRODUCT', product)">
                                <i class="trash icon"></i>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </transition>
                </div>
              </sui-form>
            </div>

            <br>

            <!--- Payments --->
            <div class="ui segment">
              <div class="ui horizontal divider header">
                <i class="money icon"></i> Payments
              </div>
              <sui-form>
                <div class="four fields">
                  <div class="required field">
                    <label>Taxable</label>
                    <sui-dropdown v-model="sale.taxable" direction="upward"
                                  :options="taxable"
                                  placeholder="Taxable"
                                  selection />
                  </div>
                </div>
                <div class="four fields">
                  <div class="field">
                    <label>Payment Method</label>
                    <sui-dropdown fluid direction="upward"
                                  v-model="sale.payment_method"
                                  :options="payment_methods"
                                  placeholder="Payment Method"
                                  selection />
                  </div>
                  <div class="field">
                    <label>Tendered</label>
                    <div class="ui labeled input">
                      <div class="ui basic label">$</div>
                      <input type="text" placeholder="Tendered" 
                        v-model.number="sale.tendered">
                    </div>
                  </div>
                  <sui-form-field :error="parseFloat(change_due) < 0">
                    <label>Change Due</label>
                    <div class="ui labeled input">
                      <div class="ui basic label">$</div>
                      <input placeholder="Change Due" v-model="change_due" readonly>
                    </div>
                  </sui-form-field>
                  <sui-form-field :error="errors.hasOwnProperty('reference')">
                    <label>Reference</label>
                    <input type="tel" placeholder="Reference" v-model.number="sale.reference">
                    <transition mode="in-out" name="fade">
                        <sui-label basic color="red" pointing 
                        v-if="errors.hasOwnProperty('reference')">
                          {{ errors.reference[0] }}
                        </sui-label>
                    </transition>
                  </sui-form-field>
                </div>
                <div class="ui small horizontal divider header" v-if="sale.payments.length > 0">
                  <i class="money icon"></i>
                  Payments
                </div>
                <table class="ui selectable single table" v-if="sale.payments.length > 0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Method</th>
                      <th>Amount Paid</th>
                      <th>Date</th>
                      <th>Cashier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in sale.payments" :key="payment.id">
                      <td>
                        <div class="ui header">
                          {{ payment.id }}
                        </div>
                      </td>
                      <td><i class="cc visa icon"></i>
                        {{ payment.method }}
                      </td>
                      <td>$ {{ payment.total }}</td>
                      <td>
                          {{ format(new Date(payment.created_at), $dateFormat.long) }}
                          ({{ distanceInWords(new Date(), new Date(payment.created_at)) }})
                      </td>
                      <td>
                        <i class="user circle icon"></i>
                        {{ payment.cashier.name }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </sui-form>
            </div>

            <!--- Memos --->
            <div class="ui small horizontal divider header" v-if="sale.memos.length > 0">
              <i class="comments outline icon"></i>
              Memos
            </div>
            <div class="ui comments">
              <div class="comment" v-for="memo in sale.memos" :key="memo.id">
                <div class="avatar">
                  <i class="user circle big icon"></i>
                </div>
                <div class="content">
                  <div class="author">
                    {{ memo.author.name }}
                    <div class="ui black label">{{ memo.author.role }}</div>
                    <div class="metadata">
                      {{ format(new Date(memo.created_at), $dateFormat.long) }}
                      ({{ distanceInWords(new Date(), new Date(memo.created_at)) }})
                    </div>
                  </div>
                  <div class="text">{{ memo.message }}</div>
                </div>
              </div>
            </div>
            <div class="ui form">
              <div class="field">
                <label>Write a memo:</label>
                <textarea v-model="sale.memo" 
                          cols="8" 
                          rows="2" 
                          placeholder="Write a memo" 
                          style="margin-bottom:10em"></textarea>
              </div>
              <transition mode="out-in" name="fade">
                  <sui-label basic color="red" pointing 
                              v-if="errors.hasOwnProperty('memo')">
                    {{ errors.memo[0] }}
                  </sui-label>
                </transition>
            </div>
            
          </div>
          <!--- Totals --->
          <div class="ui grid">
            <div class="sixteen wide column" style="padding: 0 0 0 0 !important">
              <div class="ui bottom fixed sticky" style="width:100%; right:0">
                <div class="ui inverted segment" style="border-radius: 0 !important">
                  <div class="ui container">
                    <div class="ui inverted form">
                      <div class="five fields" v-if="sale">
                        <!--- Subtotal --->
                        <div class="field">
                          <label>Subtotal</label>
                          <div class="ui inverted transparent left icon input">
                            <i class="dollar icon"></i>
                            <input style="color:white; font-weight:bold" type="text" 
                                   :value="subtotal" v-if="subtotal != undefined">
                          </div>
                        </div>
                        <!--- Tax --->
                        <div class="field">
                          <label>Tax ({{ settings.tax * 100 }}%)</label>
                          <div class="ui inverted transparent left icon input">
                            <i class="dollar icon"></i>
                            <input style="color:white; font-weight:bold" type="text" 
                                   :value="tax" v-if="tax != undefined">
                          </div>
                        </div>
                        <!--- Total --->
                        <div class="field">
                          <label>Total</label>
                          <div class="ui inverted transparent left icon input">
                            <i class="dollar icon"></i>
                            <input style="color:white; font-weight:bold" 
                                  type="text" readonly
                                  :value="total" v-if="total != undefined">
                          </div>
                        </div>
                        <!--- Paid --->
                        <div class="field">
                          <label>Paid</label>
                          <div class="ui inverted transparent left icon input">
                            <i class="dollar icon"></i>
                            <input style="color:white; font-weight:bold" type="text" 
                                   :value="sale.paid.toLocaleString('en-US', currencySettings)">
                          </div>
                        </div>
                        <!--- Paid --->
                        <div class="field">
                          <label>Tendered</label>
                          <div class="ui inverted transparent left icon input">
                            <i class="dollar icon"></i>
                            <input style="color:white; font-weight:bold" type="text" 
                                   :value="sale.tendered.toLocaleString('en-US', currencySettings)">
                          </div>
                        </div>
                        <!-- Balance -->
                        <div class="field">
                          <label>Balance</label>
                          <div class="ui inverted transparent left icon input">
                            <i class="dollar icon"></i>
                            <input style="color:white; font-weight:bold" type="text" 
                                   :value="sale.balance.toLocaleString('en-US', currencySettings)">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    
    </div>

  </div>
</template>

<script>

  import { mapActions, mapGetters, mapMutations } from 'vuex'
  import axios from "axios"

  const SERVER = "http://10.51.158.161:8000"

  export default {
    data: () => ({
      active_tab: 0,
    }),
    watch: {
      "sale.products": {
        handler: function() { this.$store.commit('CALCULATE_TOTALS') },
        deep   : true,
      },
      "sale.taxable": function() { this.$store.commit('CALCULATE_TOTALS') },
      "sale.tendered": function() { this.$store.commit('CALCULATE_TOTALS') },
    },
    components: {
      Modal     : () => import('../Modal'),
      EventForm : () => import('./EventSale'),
    },
    async created() {
      document.title = "Astral -  Create New Sale"
      this.isLoading = await true
      await this.fetchSettings()
      await this.fetchCustomers()
      await this.fetchOrganizations()
      await this.fetchGrades()
      await this.fetchProducts()
      await this.fetchPaymentMethods()
      this.isLoading = await false
    },
    methods: {
      
      ...mapActions(['fetchCustomers', 'fetchOrganizations', 'fetchGrades', 'fetchProducts', 
        'fetchPaymentMethods', 'fetchSettings']),
      
      ...mapMutations({ addEvent: 'SET_NUMBER_OF_EVENTS' }),
      
      async submit(event) {
        event.preventDefault()
        // Getting currency values with two decimal points
        this.sale.subtotal   = this.subtotal
        this.sale.tax        = this.tax
        this.sale.total      = this.total
        this.sale.change_due = this.change_due

        try {
          let response = {}
          
          if (this.$route.name == "create")
            response = await axios.post(`${SERVER}/api/sales`, this.sale)

          const sale = response.data.data
          this.$router.push({ name: "show", params: { id: sale.id } })
          alert(`Sale #${sale.id} created sucessfully!`)

        } catch (error) {
          alert(`Error trying to save sale: ${error.message}`)
        }
      }
    },
    computed : {
      enableSubmit() {
        return (this.sale.sell_to != null && this.sale.status && (this.sale.tickets.length > 0 || this.sale.products.length > 0))
      },
      ...mapGetters(['sale', 'customers', 'organizations', 'statuses', 'sell_to', 'taxable', 
        'grades', 'products', 'payment_methods', 'errors', 'settings', 'currencySettings',
        'numberOfEvents']),
      // Loading spinner
      isLoading: {
        set(value) { this.$store.commit("SET_IS_LOADING", value) },
        get()      { return this.$store.getters.isLoading }
      },
      subtotal() { 
        return this.sale.subtotal.toLocaleString("en-US", this.currencySettings) 
      },
      tax()      { 
        return this.sale.tax.toLocaleString("en-US", this.currencySettings)      
      },
      total() { 
        return this.sale.total.toLocaleString("en-US", this.currencySettings)    
      },
      change_due() {
        return this.sale.change_due.toLocaleString("en-US", this.currencySettings)    
      }
    },
  }
</script>

<style scoped>
  textarea { font: inherit }
</style>

