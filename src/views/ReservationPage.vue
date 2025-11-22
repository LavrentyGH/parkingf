<template>
  <div class="reservation-page">
    <h2>Бронирование и оплата мест</h2>

    <!-- Сообщения об ошибках -->
    <div v-if="store.error" class="error-message">
      {{ store.error }}
    </div>

    <!-- Поиск -->
    <div class="search-section">
      <div class="search-input">
        <input
            v-model="searchQuery"
            placeholder="Поиск по номеру авто или ФИО владельца..."
            @keyup.enter="searchReservations"
            class="input"
        />
        <button @click="searchReservations" class="btn-primary">Поиск</button>
        <button @click="resetSearch" class="btn-secondary">Сбросить</button>
      </div>
    </div>

    <!-- Активные бронирования -->
    <div class="section">
      <div class="section-header">
        <h3>Активные бронирования</h3>
        <button @click="openReservationDialog" class="add-btn">+ Новое бронирование</button>
      </div>

      <div v-if="store.loading" class="loading">Загрузка...</div>
      <div v-else class="reservations-list">
        <div v-for="reservation in displayedReservations" :key="reservation.id" class="reservation-item">
          <div class="reservation-info">
            <div class="reservation-header">
<!--              <span class="license-plate">{{ reservation.car?.licensePlate }}</span>-->
              <span class="license-plate">ТС №: {{ reservation.carLicensePlate }}</span>
<!--              <span class="spot-number">Место: {{ reservation.parkingSpot?.spotNumber }}</span>-->
              <span class="spot-number">Место: {{ reservation.spotNumber }}</span>
<!--              <span class="spot-number">Место: {{ reservation.parkingSpot?.spotNumber }}</span>-->
            </div>
            <div class="reservation-details">
<!--              <span class="owner">Владелец: {{ reservation.car?.owner?.fullName }}</span>-->
              <span class="owner">Владелец: {{ reservation.ownerFullName }}</span>
              <span class="start-time">Начало: {{ formatDateTime(reservation.startTime) }}</span>
              <span class="status" :class="{ 'paid': reservation.isPaid, 'unpaid': !reservation.isPaid }">
                {{ reservation.isPaid ? 'Оплачено' : 'Не оплачено' }}
              </span>
            </div>
          </div>
          <div class="reservation-actions">
            <button
                v-if="!reservation.isPaid"
                @click="markAsPaid(reservation.id)"
                class="btn-pay"
            >
              💳 Оплатить
            </button>
            <button
                @click="freeSpot(reservation.id)"
                class="btn-free"
            >
              🚗 Освободить
            </button>
          </div>
        </div>
        <div v-if="displayedReservations.length === 0" class="empty-state">
          Активных бронирований нет
        </div>
      </div>
    </div>

    <!-- Диалог нового бронирования -->
    <div v-if="showReservationDialog" class="dialog-overlay" @click="showReservationDialog = false">
      <div class="dialog" @click.stop>
        <h4>Новое бронирование</h4>

        <div class="form-group">
          <label>Автомобиль *</label>
          <select v-model="newReservation.carId" class="input">
            <option value="">Выберите автомобиль</option>
            <option v-for="car in store.cars" :key="car.id" :value="car.id">
              {{ car.licensePlate }} ({{ car.owner?.fullName }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Парковочное место *</label>
          <select v-model="newReservation.spotId" class="input">
            <option value="">Выберите место</option>
            <option v-for="spot in availableSpots" :key="spot.id" :value="spot.id">
              {{ spot.spotNumber }} {{ spot.isAvailable ? '✅' : '❌' }}
            </option>
          </select>
          <small v-if="availableSpots.length === 0" class="warning-text">
            Нет доступных парковочных мест
          </small>
        </div>

        <div class="dialog-actions">
          <button @click="showReservationDialog = false" class="btn-cancel">Отмена</button>
          <button
              @click="createReservation"
              class="btn-primary"
              :disabled="!newReservation.carId || !newReservation.spotId"
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useParkingStore } from '../stores/parkingStore'

const store = useParkingStore()

const searchQuery = ref('')
const showReservationDialog = ref(false)
const newReservation = ref({
  carId: '',
  spotId: ''
})
const availableSpots = ref([])

// Computed properties
// const displayedReservations = computed(() => {
//   if (searchQuery.value) {
//     return store.reservations.filter(res =>
//             res.status === 'ACTIVE' && (
//                 res.car?.licensePlate?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//                 res.car?.owner?.fullName?.toLowerCase().includes(searchQuery.value.toLowerCase())
//             )
//     )
//   }
//   return store.reservations.filter(res => res.status === 'ACTIVE')
// })

const displayedReservations = computed(() => {
  if (!searchQuery.value.trim()) {
    return store.reservations.filter(res => res.status === 'ACTIVE')
  }

  const query = searchQuery.value.toLowerCase().trim()
  return store.reservations.filter(res =>
          res.status === 'ACTIVE' && (
              (res.carLicensePlate && res.carLicensePlate.toLowerCase().includes(query)) ||
              (res.ownerFullName && res.ownerFullName.toLowerCase().includes(query))
          )
  )
})

// Methods
// const searchReservations = () => {
//   // Поиск уже реализован в computed свойстве
//   // В реальном приложении здесь можно сделать API запрос
//   console.log('Поиск:', searchQuery.value)
// }

//todo
const searchReservations = async () => {
  if (searchQuery.value.trim()) {
    try {
      const results = await store.searchReservations({
        licensePlate: searchQuery.value,
        ownerName: searchQuery.value
      })
      // Временное решение - используем локальную фильтрацию
      console.log('Результаты поиска:', results)
    } catch (error) {
      console.error('Ошибка поиска:', error)
    }
  }
}

const resetSearch = () => {
  searchQuery.value = ''
  store.fetchReservations()
}

const openReservationDialog = async () => {
  newReservation.value = { carId: '', spotId: '' }
  try {
    availableSpots.value = await store.fetchAvailableSpots()
    if (availableSpots.value.length === 0) {
      alert('Нет доступных парковочных мест')
      return
    }
    showReservationDialog.value = true
  } catch (error) {
    console.error('Ошибка загрузки доступных мест:', error)
  }
}

const createReservation = async () => {
  try {
    const reservationData = {
      car: { id: newReservation.value.carId },
      parkingSpot: { id: newReservation.value.spotId }
    }

    await store.createReservation(reservationData)
    showReservationDialog.value = false
    alert('Место успешно забронировано!')
  } catch (error) {
    console.error('Ошибка создания бронирования:', error)
  }
}

const markAsPaid = async (reservationId) => {
  if (confirm('Отметить бронирование как оплаченное?')) {
    try {
      await store.markAsPaid(reservationId)
      alert('Бронирование отмечено как оплаченное!')
    } catch (error) {
      console.error('Ошибка оплаты:', error)
    }
  }
}

const freeSpot = async (reservationId) => {
  if (confirm('Освободить парковочное место?')) {
    try {
      await store.freeSpot(reservationId)
      alert('Место освобождено!')
    } catch (error) {
      console.error('Ошибка освобождения места:', error)
    }
  }
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

onMounted(() => {
  store.fetchReservations()
  store.fetchCars()
  store.fetchParkingSpots()
})
</script>

<style scoped>
.reservation-page {
  padding: 20px;
}

.search-section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input .input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.add-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background: #3aa876;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reservation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #2196F3;
}

.reservation-info {
  flex: 1;
}

.reservation-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
}

.license-plate {
  font-weight: bold;
  font-family: monospace;
  font-size: 1.2em;
  background: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
}

.spot-number {
  font-weight: 600;
  color: #1976D2;
}

.reservation-details {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.owner, .start-time {
  color: #666;
  font-size: 0.9em;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.status.paid {
  background: #E8F5E8;
  color: #2E7D32;
}

.status.unpaid {
  background: #FFEBEE;
  color: #C62828;
}

.reservation-actions {
  display: flex;
  gap: 10px;
}

.btn-pay, .btn-free {
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.btn-pay {
  background: #4CAF50;
  color: white;
}

.btn-pay:hover {
  background: #45a049;
}

.btn-free {
  background: #FF9800;
  color: white;
}

.btn-free:hover {
  background: #f57c00;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #c62828;
}

/* Диалоги */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 500px;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.dialog h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #42b983;
}

.warning-text {
  color: #f44336;
  font-size: 0.8em;
  margin-top: 5px;
}

.dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>