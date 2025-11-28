<template>
  <div class="management-page">
    <h2>Учет данных автостоянки</h2>

    <!-- Сообщения об ошибках -->
    <div v-if="store.error" class="error-message">
      {{ store.error }}
    </div>

    <!-- Владельцы -->
    <div class="section">
      <div class="section-header">
        <h3>Владельцы</h3>
        <button @click="addOwner" class="add-btn">+ Добавить владельца</button>
      </div>

      <div v-if="store.loading" class="loading">Загрузка...</div>
      <div v-else>
        <div class="owners-list">
          <div v-for="owner in store.owners" :key="owner.id" class="owner-item">
            <div class="owner-info">
              <span class="owner-name">{{ owner.fullName }}</span>
              <small class="owner-date">{{ formatDate(owner.createdAt) }}</small>
            </div>
            <div class="owner-actions">
              <button @click="editOwner(owner)" class="btn-edit">✏️</button>
              <button @click="deleteOwner(owner.id)" class="btn-delete">🗑️</button>
            </div>
          </div>
          <div v-if="store.owners.length === 0" class="empty-state">
            Нет владельцев
          </div>
        </div>

        <!-- Пагинация владельцев -->
        <div class="pagination">
          <button
              @click="changeOwnerPage(pagination.owners.currentPage - 1)"
              :disabled="pagination.owners.currentPage === 0"
              class="pagination-btn"
          >
            Назад
          </button>
          <span class="pagination-info">
            Страница {{ pagination.owners.currentPage + 1 }} из {{ pagination.owners.totalPages }}
          </span>
          <button
              @click="changeOwnerPage(pagination.owners.currentPage + 1)"
              :disabled="pagination.owners.currentPage >= pagination.owners.totalPages - 1"
              class="pagination-btn"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>

    <!-- Автомобили -->
    <div class="section">
      <div class="section-header">
        <h3>Автомобили</h3>
        <button @click="addCar" class="add-btn">+ Добавить автомобиль</button>
      </div>

      <div class="cars-list">
        <div v-for="car in store.cars" :key="car.id" class="car-item">
          <div class="car-info">
            <span class="license-plate">{{ car.licensePlate }}</span>
            <span class="owner">Владелец: {{ car.ownerFullName || 'Не указан' }}</span>
            <small class="car-date">{{ formatDate(car.createdAt) }}</small>
          </div>
          <div class="car-actions">
            <button @click="editCar(car)" class="btn-edit">✏️</button>
            <button @click="deleteCar(car.id)" class="btn-delete">🗑️</button>
          </div>
        </div>
        <div v-if="store.cars.length === 0" class="empty-state">
          Нет автомобилей
        </div>

        <!-- Пагинация автомобилей -->
        <div class="pagination">
          <button
              @click="changeCarPage(pagination.cars.currentPage - 1)"
              :disabled="pagination.cars.currentPage === 0"
              class="pagination-btn"
          >
            Назад
          </button>
          <span class="pagination-info">
            Страница {{ pagination.cars.currentPage + 1 }} из {{ pagination.cars.totalPages }}
          </span>
          <button
              @click="changeCarPage(pagination.cars.currentPage + 1)"
              :disabled="pagination.cars.currentPage >= pagination.cars.totalPages - 1"
              class="pagination-btn"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>

    <!-- Парковочные места -->
    <div class="section">
      <div class="section-header">
        <h3>Парковочные места</h3>
        <button @click="addSpot" class="add-btn">+ Добавить место</button>
      </div>

      <div class="spots-grid">
        <div
            v-for="spot in store.parkingSpots"
            :key="spot.id"
            :class="['spot-card', { available: spot.isAvailable, occupied: !spot.isAvailable }]"
        >
          <div class="spot-header">
            <span class="spot-number">{{ spot.spotNumber }}</span>
            <span :class="['spot-status', { available: spot.isAvailable, occupied: !spot.isAvailable }]">
              {{ spot.isAvailable ? 'Свободно' : 'Занято' }}
            </span>
          </div>
          <div class="spot-actions">
            <button @click="editSpot(spot)" class="btn-edit">✏️</button>
            <button @click="deleteSpot(spot.id)" class="btn-delete">🗑️</button>
          </div>
        </div>
        <div v-if="store.parkingSpots.length === 0" class="empty-state">
          Нет парковочных мест
        </div>
      </div>

      <!-- Пагинация парковочных мест -->
      <div class="pagination">
        <button
            @click="changeSpotPage(pagination.parkingSpots.currentPage - 1)"
            :disabled="pagination.parkingSpots.currentPage === 0"
            class="pagination-btn"
        >
          Назад
        </button>
        <span class="pagination-info">
          Страница {{ pagination.parkingSpots.currentPage + 1 }} из {{ pagination.parkingSpots.totalPages }}
        </span>
        <button
            @click="changeSpotPage(pagination.parkingSpots.currentPage + 1)"
            :disabled="pagination.parkingSpots.currentPage >= pagination.parkingSpots.totalPages - 1"
            class="pagination-btn"
        >
          Вперед
        </button>
      </div>
    </div>

    <!-- Диалог владельца -->
    <div v-if="showOwnerDialog" class="dialog-overlay" @click="showOwnerDialog = false">
      <div class="dialog" @click.stop>
        <h4>{{ isEditingOwner ? 'Редактировать' : 'Добавить' }} владельца</h4>
        <input
            v-model="currentOwner.fullName"
            placeholder="ФИО владельца"
            class="input"
            @keyup.enter="saveOwner"
        />
        <div class="dialog-actions">
          <button @click="showOwnerDialog = false" class="btn-cancel">Отмена</button>
          <button @click="saveOwner" class="btn-primary" :disabled="!currentOwner.fullName">
            {{ isEditingOwner ? 'Обновить' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Диалог автомобиля -->
    <div v-if="showCarDialog" class="dialog-overlay" @click="showCarDialog = false">
      <div class="dialog" @click.stop>
        <h4>{{ isEditingCar ? 'Редактировать' : 'Добавить' }} автомобиль</h4>
        <input
            v-model="currentCar.licensePlate"
            placeholder="Номерной знак"
            class="input"
            @keyup.enter="saveCar"
        />
        <select v-model="currentCar.ownerId" class="input">
          <option value="">Выберите владельца</option>
          <option v-for="owner in store.owners" :key="owner.id" :value="owner.id">
            {{ owner.fullName }}
          </option>
        </select>
        <div class="dialog-actions">
          <button @click="showCarDialog = false" class="btn-cancel">Отмена</button>
          <button
              @click="saveCar"
              class="btn-primary"
              :disabled="!currentCar.licensePlate || !currentCar.ownerId"
          >
            {{ isEditingCar ? 'Обновить' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Диалог парковочного места -->
    <div v-if="showSpotDialog" class="dialog-overlay" @click="showSpotDialog = false">
      <div class="dialog" @click.stop>
        <h4>{{ isEditingSpot ? 'Редактировать' : 'Добавить' }} парковочное место</h4>
        <input
            v-model="currentSpot.spotNumber"
            placeholder="Номер места *"
            class="input"
        />
        <div class="dialog-actions">
          <button @click="showSpotDialog = false" class="btn-cancel">Отмена</button>
          <button
              @click="saveSpot"
              class="btn-primary"
              :disabled="!currentSpot.spotNumber"
          >
            {{ isEditingSpot ? 'Обновить' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import {useParkingStore} from '../stores/parkingStore'

const store = useParkingStore()

const showOwnerDialog = ref(false)
const showCarDialog = ref(false)
const showSpotDialog = ref(false)
const isEditingOwner = ref(false)
const isEditingCar = ref(false)
const isEditingSpot = ref(false)

const currentOwner = reactive({
  id: null,
  fullName: ''
})

const currentCar = reactive({
  id: null,
  licensePlate: '',
  ownerId: ''
})

const currentSpot = reactive({
  id: null,
  spotNumber: '',
  isAvailable: true
})

// Computed properties для пагинации
const pagination = computed(() => store.pagination)

// Owners methods
const addOwner = () => {
  currentOwner.id = null
  currentOwner.fullName = ''
  isEditingOwner.value = false
  showOwnerDialog.value = true
}

const editOwner = (owner) => {
  currentOwner.id = owner.id
  currentOwner.fullName = owner.fullName
  isEditingOwner.value = true
  showOwnerDialog.value = true
}

const saveOwner = async () => {
  try {
    if (isEditingOwner.value) {
      await store.updateOwner(currentOwner.id, {fullName: currentOwner.fullName})
    } else {
      await store.createOwner({fullName: currentOwner.fullName})
    }
    showOwnerDialog.value = false
  } catch (error) {
    // Ошибка уже в store.error
  }
}

const deleteOwner = async (id) => {
  if (confirm('Вы уверены, что хотите удалить владельца?')) {
    try {
      await store.deleteOwner(id)
    } catch (error) {
      // Ошибка уже в store.error
    }
  }
}

const changeOwnerPage = (page) => {
  if (page >= 0 && page < pagination.value.owners.totalPages) {
    store.fetchOwners(page, pagination.value.owners.pageSize)
  }
}

// Cars methods
const addCar = () => {
  currentCar.id = null
  currentCar.licensePlate = ''
  currentCar.ownerId = ''
  isEditingCar.value = false
  showCarDialog.value = true
}

const editCar = (car) => {
  currentCar.id = car.id
  currentCar.licensePlate = car.licensePlate
  currentCar.ownerId = car.ownerId
  isEditingCar.value = true
  showCarDialog.value = true
}

const saveCar = async () => {
  try {
    const carData = {
      licensePlate: currentCar.licensePlate,
      ownerId: currentCar.ownerId
    }

    if (isEditingCar.value) {
      await store.updateCar(currentCar.id, carData)
    } else {
      await store.createCar(carData)
    }
    showCarDialog.value = false
  } catch (error) {
    // Ошибка уже в store.error
  }
}

const deleteCar = async (id) => {
  if (confirm('Вы уверены, что хотите удалить автомобиль?')) {
    try {
      await store.deleteCar(id)
    } catch (error) {
      // Ошибка уже в store.error
    }
  }
}

const changeCarPage = (page) => {
  if (page >= 0 && page < pagination.value.cars.totalPages) {
    store.fetchCars(page, pagination.value.cars.pageSize)
  }
}

// Parking spots methods
const addSpot = () => {
  currentSpot.id = null
  currentSpot.spotNumber = ''
  currentSpot.isAvailable = true
  isEditingSpot.value = false
  showSpotDialog.value = true
}

const editSpot = (spot) => {
  currentSpot.id = spot.id
  currentSpot.spotNumber = spot.spotNumber
  currentSpot.isAvailable = spot.isAvailable
  isEditingSpot.value = true
  showSpotDialog.value = true
}

const saveSpot = async () => {
  try {
    const spotData = {
      spotNumber: currentSpot.spotNumber,
      isAvailable: currentSpot.isAvailable
    }

    if (isEditingSpot.value) {
      await store.updateParkingSpot(currentSpot.id, spotData)
    } else {
      await store.createParkingSpot(spotData)
    }
    showSpotDialog.value = false
  } catch (error) {
    // Ошибка уже в store.error
  }
}

const deleteSpot = async (id) => {
  if (confirm('Вы уверены, что хотите удалить парковочное место?')) {
    try {
      await store.deleteParkingSpot(id)
    } catch (error) {
      // Ошибка уже в store.error
    }
  }
}

const changeSpotPage = (page) => {
  if (page >= 0 && page < pagination.value.parkingSpots.totalPages) {
    store.fetchParkingSpots(page, pagination.value.parkingSpots.pageSize)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

onMounted(() => {
  store.fetchOwners(0, 5)
  store.fetchCars(0, 5)
  store.fetchParkingSpots(0, 10)
})
</script>

<style scoped>
.management-page {
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.add-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background: #3aa876;
}

.owners-list, .cars-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.owner-item, .car-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #42b983;
}

.owner-info, .car-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.owner-name {
  font-weight: 600;
}

.license-plate {
  font-weight: bold;
  font-family: monospace;
  font-size: 1.1em;
}

.owner, .owner-date, .car-date {
  color: #666;
  font-size: 0.9em;
}

.owner-actions, .car-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1.1em;
}

.btn-edit:hover {
  background: #e3f2fd;
}

.btn-delete:hover {
  background: #ffebee;
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

/* Стили для парковочных мест */
.spots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.spot-card {
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.spot-card.available {
  border-color: #4CAF50;
  background: #f1f8e9;
}

.spot-card.occupied {
  border-color: #f44336;
  background: #ffebee;
}

.spot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.spot-number {
  font-weight: bold;
  font-size: 1.2em;
}

.spot-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.spot-status.available {
  background: #4CAF50;
  color: white;
}

.spot-status.occupied {
  background: #f44336;
  color: white;
}

.spot-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.pagination-info {
  font-size: 0.9em;
  color: #666;
}

/* Диалоги */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dialog h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 12px;
  box-sizing: border-box;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #42b983;
}

.dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
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
</style>