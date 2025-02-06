<template>
  <div id='terminal'>
    <div id="textBox">
      {{ content.log }}
    </div>

  </div>
</template>

<script>
import { useContentStore } from '../stores/contentStore';
import { useComponentsStatusStore } from '../stores/componentsStatusStore';

export default {
  data() {
    return {

    }
  },
  setup() {
    const content = useContentStore();
    const components = useComponentsStatusStore();
    return { content, components };
  },
}
</script>

<style scoped>
@import 'tailwindcss';

#terminal {
  @apply h-[142px] p-2.5 pr-0.5 bg-[#2a2a2a] rounded-lg w-full
}

#textBox {
  scrollbar-width: thin;
  scrollbar-color: grey #2a2a2a;
  @apply overflow-y-scroll h-full text-sm whitespace-pre-line text-justify
}
</style>