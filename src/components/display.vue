<template>
    <div id="displayBox">
        <div id="display" v-html="html">
        </div>
    </div>
    
</template>

<script>
export default {
    props: {
        html: String
    }
}
</script>

<style scoped>
@import 'tailwindcss';

#displayBox {
    @apply h-[435px] w-full py-4 pl-4 pr-2 bg-[#2a2a2a] rounded-[24px] text-[16px]
}

#display {
    scrollbar-width: thin;
    scrollbar-color: grey #2a2a2a;
    @apply overflow-y-scroll h-full 
}

</style>