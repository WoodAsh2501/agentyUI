<template>
  <button @click="action" class="button">
    <div class="origin-top-left rotate-[15deg] pb-3 pl-2 text-white/40 text-xl font-black pointer-events-none">{{ text || 'Button' }}</div>
</button>

  <!-- <button @click="action" class="button">
    {{ text || 'Button' }}
  </button> -->
</template>

<script>
import { Actions } from '@/utils/actions';
import { useContentStore } from '@/stores/contentStore';

export default {
  data() {
    return {
      content: useContentStore(),
    }
  },
  props: {
    action: {
      type: Function,
      default: Actions.executePrompt
    },
    text: {
      type: String,
      default: 'Button'
    },
    status: {
      type: String
    }
  },
  methods: {
  }
}
</script>

<style scoped>
@import 'tailwindcss';

.button {
  @apply w-[133px] h-16 
  origin-top-left rotate-[-15deg]
  bg-gradient-to-b from-[#242424] to-[#3d3d3d] rounded-[32px] shadow-[1px_1px_1px_0px_rgba(0,0,0,0.30)] border border-[#494949] justify-center items-center inline-flex;
}

.button:hover {
  @apply border-amber-500 border-2
}
</style>