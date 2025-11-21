import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './views/App.vue'
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
// import 'primevue/resources/themes/aura-light-green/theme.css'
// import 'primevue/resources/primevue.min.css'
// import 'primeicons/primeicons.css'

// PrimeVue Components
// import DataTable from 'primevue/datatable'
// import Column from 'primevue/column'
// import Button from 'primevue/button'
// import Dialog from 'primevue/dialog'
// import InputText from 'primevue/inputtext'
// import Dropdown from 'primevue/dropdown'
// import Card from 'primevue/card'
// import TabView from 'primevue/tabview'
// import TabPanel from 'primevue/tabpanel'
// import Toast from 'primevue/toast'
// import ToastService from 'primevue/toastservice'
// import Tag from 'primevue/tag'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
// app.use(PrimeVue)
// app.use(ToastService)

// Register PrimeVue components
// app.component('DataTable', DataTable)
// app.component('Column', Column)
// app.component('Button', Button)
// app.component('Dialog', Dialog)
// app.component('InputText', InputText)
// app.component('Dropdown', Dropdown)
// app.component('Card', Card)
// app.component('TabView', TabView)
// app.component('TabPanel', TabPanel)
// app.component('Toast', Toast)
// app.component('Tag', Tag)

app.mount('#app')