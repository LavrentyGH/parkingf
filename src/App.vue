<template>
  <div id="app">
    <h1>🚗 Система управления автостоянкой</h1>
    <nav>
      <router-link to="/">Учет данных</router-link> |
      <router-link to="/reservations">Бронирование и оплата</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

nav {
  margin: 20px 0;
  padding: 10px;
  background: white;
  border-radius: 5px;
}

nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #2c3e50;
}

nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}

main {
  background: white;
  padding: 20px;
  border-radius: 5px;
  min-height: 400px;
}
</style>