<template>
  <div class="ui tiny five statistics">
    <div class="statistic">
      <div class="label">Subtotal</div>
      <div class="value">
        <i class="dollar sign icon"></i> 
        {{ sale.subtotal }}
      </div>
    </div>
    <div class="statistic">
      <div class="label">Tax</div>
      <div class="value" v-if="tax != undefined">
        <i class="dollar sign icon"></i> 
        {{ tax }}
      </div>
    </div>
    <div class="statistic">
      <div class="label">Total</div>
      <div class="value">
        <i class="dollar sign icon"></i> 
        {{ sale.total }}
      </div>
    </div>
    <div v-if="paid && paid < 0" class="ui red statistic">
      <div class="label">Paid</div>
      <div class="value"><i class="dollar sign icon"></i> {{ paid }}</div>
    </div>
    <div v-if="paid && paid == 0" class="ui yellow statistic">
      <div class="label">Paid</div>
      <div class="value"><i class="dollar sign icon"></i> {{ paid }}</div>
    </div>
    <div v-if="paid && paid > 0" class="ui green statistic">
      <div class="label">Paid</div>
      <div class="value"><i class="dollar sign icon"></i> {{ paid }}</div>
    </div>
    <div :class="balance && balance > 0 ? 'red statistic' : 'green statistic'">
      <div class="label">Balance</div>
      <div class="value">
        <i class="dollar sign icon"></i> {{ balance }}
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from "vuex"
  
  export default {
    props: ["sale"],
    computed: {
      tax() {
        if (this.sale.tax != undefined)
          return this.sale.tax.toLocaleString("en-US", this.currencySettings)
        else return 0
      },
      paid() {
        if (this.sale.payments != undefined)
          return this.sale.payments.reduce((total, current) => total + parseFloat(current.paid), 0)
                     .toLocaleString("en-US", this.currencySettings)
        else return 0
      },
      balance() {
        return (parseFloat(this.sale.total) - parseFloat(this.paid)).toLocaleString("en-US", this.currencySettings)
      },
      ...mapGetters(['currencySettings']),
    },
  }
</script>

