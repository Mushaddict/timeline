<template>
  <div v-if="zodiacInfo" class="zodiac-badge" :class="zodiacInfo.element">
    <span class="symbol">{{ zodiacInfo.symbol }}</span>
    <span class="name">{{ zodiacInfo.name }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useZodiac } from '../composables/useZodiac'

interface Props {
  birthday: string
}

const props = defineProps<Props>()

const { getZodiac } = useZodiac()

const zodiacInfo = computed(() => {
  return getZodiac(props.birthday)
})
</script>

<style scoped>
.zodiac-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.symbol {
  font-size: 1rem;
}

/* Fire signs: Aries, Leo, Sagittarius */
.zodiac-badge.fire {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: white;
}

/* Earth signs: Taurus, Virgo, Capricorn */
.zodiac-badge.earth {
  background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
  color: white;
}

/* Air signs: Gemini, Libra, Aquarius */
.zodiac-badge.air {
  background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
  color: white;
}

/* Water signs: Cancer, Scorpio, Pisces */
.zodiac-badge.water {
  background: linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%);
  color: white;
}
</style>
