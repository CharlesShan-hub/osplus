<template>
  <div>
    <el-input v-model="packageName" placeholder="请输入服务名" style="width: 200px; margin-right: 10px;"></el-input>
    <el-button type="primary" @click="getServicesList">刷新</el-button>
    <el-button type="primary" @click="startServices">开启服务</el-button>
    <el-button type="primary" @click="restartServices">重启服务</el-button>
    <el-button type="primary" @click="stopServices">关闭服务</el-button>
    <div class="h-6" style="margin-bottom: 20px;"></div>
    <div v-if="loading" style="margin-top: 20px;">
      <el-icon class="is-loading"><Loading /></el-icon>
      正在获取Brew服务列表...
    </div>
    <el-table v-if="servicesTableData.length" :data="servicesTableData" style="width: 100%">
      <el-table-column 
        v-for="column in servicesTableColumns" 
        :key="column.prop" 
        :prop="column.prop" 
        :label="column.label" 
        :width="column.width"
      />
    </el-table>
  </div>
  <el-alert
    v-if="commandInfo"
    :title="commandInfo"
    type="info"
    show-icon
    style="margin-top: 20px;"
  >
  </el-alert>
  <el-alert
    v-if="systemInfo"
    :title="systemInfo"
    :type="alertType"
    show-icon
    style="margin-top: 20px;"
  >
  </el-alert>
</template>

<script>
import { Loading } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
const { exec } = require('child_process')

export default {
  name: 'ServiceManagement',
  components: { Loading },
  setup() {
    const servicesListArray = ref([])
    const loading = ref(false)
    const systemInfo = ref('')
    const commandInfo = ref('')
    const packageName = ref('')
    const alertType = ref('info')

    const servicesTableColumns = ref([
      { prop: 'name', label: '服务', width: '180' },
      { prop: 'status', label: '状态' },
      { prop:'user', label: '用户' },
      { prop:'file', label: '文件' }
    ])
    const servicesTableData = ref([])

    const getServicesList = () => {
      loading.value = true
      commandInfo.value = '正在执行命令: brew services list'
      exec('brew services list', (error, stdout, stderr) => {
        loading.value = false
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          servicesListArray.value = [{ name: systemInfo.value, status: '', user: '', file: '' }]
          return
        }
        alertType.value = 'success'
        const lines = stdout.split('\n').filter(item => item.trim() !== '').slice(1) 
        servicesListArray.value = lines.map(line => {
          const parts = line.trim().split(/\s+/)
          if (parts.length === 2) {
            parts.push('', '')
          }
          return {
            name: parts[0],
            status: parts[1],
            user: parts[2],
            file: parts[3]
          }
        })
        servicesTableData.value = servicesListArray.value
        systemInfo.value += stdout
      })
    }

    const startServices = () => {
      if (!packageName.value) {
        alertType.value = 'error'
        systemInfo.value = '请输入要开启的服务名'
        return
      }
      alertType.value = 'info'
      systemInfo.value = ''
      commandInfo.value = `正在执行命令: brew services start ${packageName.value}`
      exec(`brew services start ${packageName.value}`, (error, stdout, stderr) => {
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        alertType.value = 'success'
        systemInfo.value += stdout
        // 刷新服务列表
        getServicesList()
      })
    }

    const restartServices = () => {
      if (!packageName.value) {
        alertType.value = 'error'
        systemInfo.value = '请输入要重启的服务名'
        return
      }
      alertType.value = 'info'
      systemInfo.value = ''
      commandInfo.value = `正在执行命令: brew services restart ${packageName.value}`
      exec(`brew services restart ${packageName.value}`, (error, stdout, stderr) => {
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        alertType.value = 'success'
        systemInfo.value += stdout
        // 刷新服务列表
        getServicesList()
      })
    }

    const stopServices = () => {
      if (!packageName.value) {
        alertType.value = 'error'
        systemInfo.value = '请输入要关闭的服务名'
        return
      }
      alertType.value = 'info'
      systemInfo.value = ''
      commandInfo.value = `正在执行命令: brew services stop ${packageName.value}`
      exec(`brew services stop ${packageName.value}`, (error, stdout, stderr) => {
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        alertType.value = 'success'
        systemInfo.value += stdout
        // 刷新服务列表
        getServicesList()
      })
    }

    // 修改 onMounted 钩子
    onMounted(() => {
      if (servicesListArray.value.length === 0) {
        getServicesList()
      }
    })

    return {
      servicesListArray,
      loading,
      getServicesList,
      systemInfo,
      commandInfo,
      packageName,
      alertType,
      servicesTableColumns,
      servicesTableData,
      startServices,
      restartServices,
      stopServices
    }
  }
}
</script>