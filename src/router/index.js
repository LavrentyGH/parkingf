import { createRouter, createWebHistory } from 'vue-router'
import ManagementPage from '../views/ManagementPage.vue'
import ReservationPage from '../views/ReservationPage.vue'

const routes = [
    {
        path: '/',
        name: 'management',
        component: ManagementPage
    },
    {
        path: '/reservations',
        name: 'reservations',
        component: ReservationPage
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router