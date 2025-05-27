<template>
  <div>
    <el-menu 
      :default-active="activeIndex" 
      class="el-menu-demo" 
      mode="horizontal" 
      @select="handleSelect" 
      style="width: 100%;"
    > 
      <el-menu-item index="1">系统管理</el-menu-item> 
      <el-menu-item index="2">包管理</el-menu-item> 
      <el-menu-item index="3">服务管理</el-menu-item> 
    </el-menu> 
    <div class="h-6" style="margin-bottom: 20px;"></div>
    <div class="h-6">
      <SystemManagement v-if="activeIndex === '1'" />
      <PackageManagement v-if="activeIndex === '2'" />
      <ServiceManagement v-if="activeIndex === '3'" />
    </div>
  </div>
</template>

<script>
import SystemManagement from './SystemManagement.vue'
import PackageManagement from './PackageManagement.vue'
import ServiceManagement from './ServiceManagement.vue'
import { ref } from 'vue'

export default {
  name: 'BrewView',
  components: {
    SystemManagement,
    PackageManagement,
    ServiceManagement
  },
  setup() {
    const activeIndex = ref('1') 

    const handleSelect = (key, keyPath) => {
      console.log(key, keyPath)
      activeIndex.value = key
    }

    return {
      activeIndex,
      handleSelect
    }
  }
}
</script>