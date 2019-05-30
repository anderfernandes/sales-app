<template>
  <sale-form></sale-form>
</template>

<script>

  export default {
    components: {
      SaleForm : () => import('../components/forms/Sale')
    },
    async beforeDestroy() {
      await this.$store.commit("RESET_CREATE")
    }
  }
</script>

