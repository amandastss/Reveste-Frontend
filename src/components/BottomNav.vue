<template>
  <nav class="bottom">
    <span>🏠</span>
    <span>⬜</span>
    <span>👤</span>
  </nav>
</template>

<style scoped>
.bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-around;
  align-items: center;

  height: 60px;
  background: white;
  border-top: 1px solid #eee;
}
</style>