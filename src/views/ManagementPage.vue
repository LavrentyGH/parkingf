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
        <button @click="showOwnerDialog = true" class="add-btn">+ Добавить владельца</button>
      </div>

      <div v-if="store.loading" class="loading">Загрузка...</div>
      <div v-else class="owners-list">
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
    </div>

    <!-- Автомобили -->
    <div class="section">
      <div class="section-header">
        <h3>Автомобили</h3>
        <button @click="showCarDialog = true" class="add-btn">+ Добавить автомобиль</button>
      </div>

      <div class="cars-list">
        <div v-for="car in store.cars" :key="car.id" class="car-item">
          <div class="car-info">
            <span class="license-plate">{{ car.licensePlate }}</span>
<!--            <span class="owner">Владелец: {{ car.owner?.fullName }}</span>-->
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useParkingStore } from '../stores/parkingStore'

const store = useParkingStore()

const showOwnerDialog = ref(false)
const showCarDialog = ref(false)
const isEditingOwner = ref(false)
const isEditingCar = ref(false)

const currentOwner = reactive({
  id: null,
  fullName: ''
})

const currentCar = reactive({
  id: null,
  licensePlate: '',
  ownerId: ''
})

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
      await store.updateOwner(currentOwner.id, { fullName: currentOwner.fullName })
    } else {
      await store.createOwner({ fullName: currentOwner.fullName })
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
  currentCar.ownerId = car.owner?.id || car.ownerId
  isEditingCar.value = true
  showCarDialog.value = true
}

const saveCar = async () => {
  try {
    const carData = {
      licensePlate: currentCar.licensePlate,
      owner: { id: currentCar.ownerId }
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

onMounted(() => {
  store.fetchOwners()
  store.fetchCars()
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
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