<template>
  <header class="header">

    <!-- TOP BAR -->
    <div class="top-bar">

      <!-- MENU -->
      <router-link to="/menu">
        <span class="material-symbols-outlined icon">
          menu
        </span>
      </router-link>

      <!-- LOGO (volta pra home) -->
      <router-link to="/">
        <h1>ReVeste</h1>
      </router-link>

      <!-- AÇÕES -->
      <div class="actions">
        <router-link to="/notifications">
          <span class="material-symbols-outlined icon">
            notifications
          </span>
        </router-link>

        <router-link to="/cart">
          <span class="material-symbols-outlined icon">
            shopping_cart
          </span>
        </router-link>
      </div>

    </div>

    <!-- SEARCH -->
    <div class="search">
      <input placeholder="Pesquisar itens" />
    </div>

  </header>
</template>

<style scoped>
.header {
  padding: 10px 12px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
h1 {
  font-size: 18px;
  font-weight: 600;
}
.icon {
  font-size: 24px;
  cursor: pointer;
  color: black;
}
.actions {
  display: flex;
  gap: 12px;
}
.search {
  margin-top: 10px;
}
.search input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 14px;
}
</style>