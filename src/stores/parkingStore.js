import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_BASE = 'http://localhost:8081/api'

export const useParkingStore = defineStore('parking', () => {
    // State
    const owners = ref([])
    const cars = ref([])
    const parkingSpots = ref([])
    const reservations = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Пагинация
    const pagination = ref({
        owners: { currentPage: 0, totalPages: 0, totalItems: 0, pageSize: 5 },
        cars: { currentPage: 0, totalPages: 0, totalItems: 0, pageSize: 5 },
        parkingSpots: { currentPage: 0, totalPages: 0, totalItems: 0, pageSize: 10 },
        reservations: { currentPage: 0, totalPages: 0, totalItems: 0, pageSize: 10 }
    })

    // Owners Actions
    const fetchOwners = async (page = 0, size = 5) => {
        try {
            loading.value = true
            error.value = null
            const response = await axios.get(`${API_BASE}/owners/paged?page=${page}&size=${size}`)
            if (response.data && response.data.data) {
                owners.value = response.data.data.content || []
                pagination.value.owners = {
                    currentPage: response.data.data.currentPage || 0,
                    totalPages: response.data.data.totalPages || 0,
                    totalItems: response.data.data.totalItems || 0,
                    pageSize: response.data.data.pageSize || size
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке владельцев'
            console.error('Error fetching owners:', err)
        } finally {
            loading.value = false
        }
    }

    const createOwner = async (ownerData) => {
        try {
            const response = await axios.post(`${API_BASE}/owners`, ownerData)
            await fetchOwners(pagination.value.owners.currentPage, pagination.value.owners.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при создании владельца'
            throw err
        }
    }

    const updateOwner = async (id, ownerData) => {
        try {
            const response = await axios.put(`${API_BASE}/owners/${id}`, ownerData)
            await fetchOwners(pagination.value.owners.currentPage, pagination.value.owners.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при обновлении владельца'
            throw err
        }
    }

    const deleteOwner = async (id) => {
        try {
            await axios.delete(`${API_BASE}/owners/${id}`)
            await fetchOwners(pagination.value.owners.currentPage, pagination.value.owners.pageSize)
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при удалении владельца'
            throw err
        }
    }

    // Cars Actions
    const fetchCars = async (page = 0, size = 5) => {
        try {
            loading.value = true
            const response = await axios.get(`${API_BASE}/cars/paged?page=${page}&size=${size}`)
            if (response.data && response.data.data) {
                cars.value = response.data.data.content || []
                pagination.value.cars = {
                    currentPage: response.data.data.currentPage || 0,
                    totalPages: response.data.data.totalPages || 0,
                    totalItems: response.data.data.totalItems || 0,
                    pageSize: response.data.data.pageSize || size
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке автомобилей'
        } finally {
            loading.value = false
        }
    }

    const createCar = async (carData) => {
        try {
            console.log('createCar called with:', carData)
            const requestData = {
                licensePlate: carData.licensePlate,
                ownerId: carData.ownerId
            }
            console.log('Sending to backend:', requestData)
            const response = await axios.post(`${API_BASE}/cars`, requestData)
            await fetchCars(pagination.value.cars.currentPage, pagination.value.cars.pageSize)
            return response.data
        } catch (err) {
            console.error('❌ Error creating car:', err.response?.data)
            error.value = err.response?.data?.message || 'Ошибка при создании автомобиля'
            throw err
        }
    }

    const updateCar = async (id, carData) => {
        try {
            const requestData = {
                licensePlate: carData.licensePlate,
                ownerId: carData.ownerId
            }
            const response = await axios.put(`${API_BASE}/cars/${id}`, requestData)
            await fetchCars(pagination.value.cars.currentPage, pagination.value.cars.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при обновлении автомобиля'
            throw err
        }
    }

    const deleteCar = async (id) => {
        try {
            await axios.delete(`${API_BASE}/cars/${id}`)
            await fetchCars(pagination.value.cars.currentPage, pagination.value.cars.pageSize)
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при удалении автомобиля'
            throw err
        }
    }

    // Parking Spots Actions
    const fetchParkingSpots = async (page = 0, size = 10) => {
        try {
            const response = await axios.get(`${API_BASE}/parking-spots/paged?page=${page}&size=${size}`)
            if (response.data && response.data.data) {
                parkingSpots.value = response.data.data.content || []
                pagination.value.parkingSpots = {
                    currentPage: response.data.data.currentPage || 0,
                    totalPages: response.data.data.totalPages || 0,
                    totalItems: response.data.data.totalItems || 0,
                    pageSize: response.data.data.pageSize || size
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке парковочных мест'
        }
    }

    const fetchAvailableSpots = async () => {
        try {
            const response = await axios.get(`${API_BASE}/parking-spots/available`)
            return response.data.data || []
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке доступных мест'
            return []
        }
    }

    const createParkingSpot = async (spotData) => {
        try {
            const response = await axios.post(`${API_BASE}/parking-spots`, spotData)
            await fetchParkingSpots(pagination.value.parkingSpots.currentPage, pagination.value.parkingSpots.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при создании парковочного места'
            throw err
        }
    }

    const updateParkingSpot = async (id, spotData) => {
        try {
            const response = await axios.put(`${API_BASE}/parking-spots/${id}`, spotData)
            await fetchParkingSpots(pagination.value.parkingSpots.currentPage, pagination.value.parkingSpots.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при обновлении парковочного места'
            throw err
        }
    }

    const deleteParkingSpot = async (id) => {
        try {
            await axios.delete(`${API_BASE}/parking-spots/${id}`)
            await fetchParkingSpots(pagination.value.parkingSpots.currentPage, pagination.value.parkingSpots.pageSize)
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при удалении парковочного места'
            throw err
        }
    }

    const updateSpotAvailability = async (id, isAvailable) => {
        try {
            const response = await axios.put(`${API_BASE}/parking-spots/${id}/availability`, isAvailable)
            await fetchParkingSpots(pagination.value.parkingSpots.currentPage, pagination.value.parkingSpots.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при обновлении доступности места'
            throw err
        }
    }

    // Reservations Actions
    const fetchReservations = async (page = 0, size = 10) => {
        try {
            const response = await axios.get(`${API_BASE}/reservations/paged?page=${page}&size=${size}`)
            if (response.data && response.data.data) {
                reservations.value = response.data.data.content || []
                pagination.value.reservations = {
                    currentPage: response.data.data.currentPage || 0,
                    totalPages: response.data.data.totalPages || 0,
                    totalItems: response.data.data.totalItems || 0,
                    pageSize: response.data.data.pageSize || size
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке бронирований'
        }
    }

    const createReservation = async () => {
        // Проверка что все поля заполнены
        if (!newReservation.value.carId || !newReservation.value.spotId) {
            alert('Пожалуйста, выберите автомобиль и парковочное место')
            return
        }

        try {
            // Преобразуем в числа и создаем объект
            const reservationData = {
                carId: Number(newReservation.value.carId),
                spotId: Number(newReservation.value.spotId)
            }

            console.log('📤 Отправляемые данные:', reservationData)

            await store.createReservation(reservationData)
            showReservationDialog.value = false
            alert('Место успешно забронировано!')
        } catch (error) {
            console.error('❌ Ошибка создания бронирования:', error)
            console.error('📄 Ответ сервера:', error.response?.data)
            alert('Ошибка: ' + (error.response?.data?.message || 'Не удалось создать бронирование'))
        }
    }

    const markAsPaid = async (id) => {
        try {
            const response = await axios.put(`${API_BASE}/reservations/${id}/pay`)
            await fetchReservations(pagination.value.reservations.currentPage, pagination.value.reservations.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при оплате бронирования'
            throw err
        }
    }

    const freeSpot = async (id) => {
        try {
            const response = await axios.put(`${API_BASE}/reservations/${id}/free`)
            await fetchReservations(pagination.value.reservations.currentPage, pagination.value.reservations.pageSize)
            await fetchParkingSpots(pagination.value.parkingSpots.currentPage, pagination.value.parkingSpots.pageSize)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при освобождении места'
            throw err
        }
    }

    return {
        // State
        owners,
        cars,
        parkingSpots,
        reservations,
        loading,
        error,
        pagination,

        // Owners Actions
        fetchOwners,
        createOwner,
        updateOwner,
        deleteOwner,

        // Cars Actions
        fetchCars,
        createCar,
        updateCar,
        deleteCar,

        // Parking Spots Actions
        fetchParkingSpots,
        fetchAvailableSpots,
        createParkingSpot,
        updateParkingSpot,
        deleteParkingSpot,
        updateSpotAvailability,

        // Reservations Actions
        fetchReservations,
        createReservation,
        markAsPaid,
        freeSpot,
        // searchReservations // УБЕРИ ЭТО ИЗ RETURN
    }
})
