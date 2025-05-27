<template>
  <div class="common-layout">
    <el-container>
      <el-header class="main-header">
        <HeaderView />
      </el-header>
      <el-container>
        <el-aside width="200px" class="full-height-aside">
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo full-height-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="1">
              <span>Brew</span>
            </el-menu-item>
            <el-menu-item index="2">
              <span>Python</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main>
            <router-view></router-view>
          </el-main>
          <el-footer></el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import HeaderView from './components/HeaderView.vue'

export default {
  name: 'App',
  components: {
    HeaderView
  },
  methods: {
    handleMenuSelect(index) {
      if(index === '1') {
        this.$router.push('/brew')
      } else if(index === '2') {
        this.$router.push('/python')
      }
    }
  }
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #f5f7fa;
}

.common-layout {
  height: 100vh;
}

.main-header {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  display: flex;
  align-items: center;
  box-shadow: var(--el-box-shadow-light);
  height: 60px;
}

.full-height-aside {
  height: calc(100vh - 60px); /* 减去header高度 */
}

.full-height-menu {
  height: 100%;
}
</style>
