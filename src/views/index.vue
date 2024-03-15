<template>
  <div class="app-container">
    <div class="home">
      <div class="home-content">
        <p>您好，欢迎使用天九后台管理模板！</p>
        <div class="default-img">
          <img src="~@/assets/images/home.png" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="Index" lang="ts"></script>

<style scoped lang="scss">
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  &-content {
    p {
      text-align: center;
      font-size: 26px;
      font-weight: 500;
      color: #222222;
      margin-bottom: 18px;
    }
    .default-img {
      width: 100%;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
