<template>
  <sui-modal v-model="open" basic>
    <sui-header icon="thumbs up" >Alright!</sui-header>
    <sui-modal-content>
      <sui-modal-description>
        <slot></slot>
      </sui-modal-description>
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button color="green" inverted @click="open = !open" icon="check">
        Gotcha!
      </sui-button>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
  export default {
    computed: {
      open: {
        set(value) { this.$store.dispatch("setShowModal", value) },
        get()      { return this.$store.getters.showModal        }
      },
    },
  }
</script>
