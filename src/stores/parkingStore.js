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

    // Owners Actions
    const fetchOwners = async () => {
        try {
            loading.value = true
            error.value = null
            const response = await axios.get(`${API_BASE}/owners`)
            owners.value = response.data
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
            await fetchOwners() // Обновляем список
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при создании владельца'
            throw err
        }
    }

    const updateOwner = async (id, ownerData) => {
        try {
            const response = await axios.put(`${API_BASE}/owners/${id}`, ownerData)
            await fetchOwners()
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при обновлении владельца'
            throw err
        }
    }

    const deleteOwner = async (id) => {
        try {
            await axios.delete(`${API_BASE}/owners/${id}`)
            await fetchOwners()
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при удалении владельца'
            throw err
        }
    }

    // Cars Actions
    const fetchCars = async () => {
        try {
            loading.value = true
            const response = await axios.get(`${API_BASE}/cars`)
            cars.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке автомобилей'
        } finally {
            loading.value = false
        }
    }

    const createCar = async (carData) => {
        try {
            const response = await axios.post(`${API_BASE}/cars`, carData)
            await fetchCars()
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при создании автомобиля'
            throw err
        }
    }

    const updateCar = async (id, carData) => {
        try {
            const response = await axios.put(`${API_BASE}/cars/${id}`, carData)
            await fetchCars()
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при обновлении автомобиля'
            throw err
        }
    }

    const deleteCar = async (id) => {
        try {
            await axios.delete(`${API_BASE}/cars/${id}`)
            await fetchCars()
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при удалении автомобиля'
            throw err
        }
    }

    // Parking Spots Actions
    const fetchParkingSpots = async () => {
        try {
            const response = await axios.get(`${API_BASE}/parking-spots`)
            parkingSpots.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке парковочных мест'
        }
    }

    const fetchAvailableSpots = async () => {
        try {
            const response = await axios.get(`${API_BASE}/parking-spots/available`)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке доступных мест'
            return []
        }
    }

    // Reservations Actions
    const fetchReservations = async () => {
        try {
            const response = await axios.get(`${API_BASE}/reservations`)
           // console.log('Reservations data:', response.data) //todo отладка
            reservations.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при загрузке бронирований'
           // console.error('Error fetching reservations:', err)
        }
    }

    const createReservation = async (reservationData) => {
        try {
            const response = await axios.post(`${API_BASE}/reservations`, reservationData)
            await fetchReservations()
            await fetchParkingSpots()
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при создании бронирования'
            throw err
        }
    }

    const markAsPaid = async (id) => {
        try {
            const response = await axios.put(`${API_BASE}/reservations/${id}/pay`)
            await fetchReservations()
            await fetchParkingSpots()
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Ошибка при оплате бронирования'
            throw err
        }
    }

    const freeSpot = async (id) => {
        try {
            const response = await axios.put(`${API_BASE}/reservations/${id}/free`)
            await fetchReservations()
            await fetchParkingSpots()
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

        // Reservations Actions
        fetchReservations,
        createReservation,
        markAsPaid,
        freeSpot
    }
})