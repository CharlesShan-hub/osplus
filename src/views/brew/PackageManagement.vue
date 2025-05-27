<template>
  <div>
    <el-input v-model="packageName" placeholder="请输入包名" style="width: 200px; margin-right: 10px;"></el-input>
    <el-button type="primary" @click="getBrewList">刷新</el-button>
    <el-button type="primary" @click="getBrewInfo">查看包信息</el-button>
    <el-button type="primary" @click="installBrewPackage">安装包</el-button>
    <el-button type="primary" @click="uninstallBrewPackage">删除包</el-button>
    <div class="h-6" style="margin-bottom: 20px;"></div>
    <el-row :gutter="20">
      <el-col :span="12">
        <div v-if="loading" style="margin-top: 20px;">
          <el-icon class="is-loading"><Loading /></el-icon>
          正在获取Brew列表...
        </div>
        <el-table v-if="filteredBrewList.length" :data="listTableData" style="width: 100%">
          <el-table-column 
            v-for="column in listTableColumns" 
            :key="column.prop" 
            :prop="column.prop" 
            :label="column.label" 
            :width="column.width"
          />
        </el-table>
      </el-col>
      <el-col :span="12">
        <el-table v-if="infoTableData.length" :data="infoTableData" style="width: 100%">
          <el-table-column 
            v-for="column in infoTableColumns" 
            :key="column.prop" 
            :prop="column.prop" 
            :label="column.label" 
            :width="column.width"
          />
        </el-table>
      </el-col>
    </el-row>
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
  </div>
</template>

<script>
import { Loading } from '@element-plus/icons-vue'
import { ref, computed, onMounted } from 'vue'
const { exec } = require('child_process')

export default {
  name: 'PackageManagement',
  components: { Loading },
  setup() {
    const brewListArray = ref([])
    const loading = ref(false)
    const systemInfo = ref('')
    const commandInfo = ref('')
    const systemLoading = ref(false)
    const packageName = ref('')
    const alertType = ref('info')

    // 计算属性，用于筛选数据
    const filteredBrewList = computed(() => {
      if (!packageName.value) {
        return brewListArray.value
      }
      return brewListArray.value.filter(item => {
        if (item.name) {
          return item.name.toLowerCase().includes(packageName.value.toLowerCase())
        }
        return false
      })
    })

    const listTableColumns = ref([
      { prop: 'name', label: '包名', width: '180' },
      { prop: 'version', label: '版本' }
    ])
    const listTableData = computed(() => {
      return filteredBrewList.value
    })
    const infoTableColumns = ref([
      { prop: 'name', label: '包名', width: '180' },
      { prop: 'version', label: '版本' }
    ])
    const infoTableData = ref([])

    const getBrewList = () => {
      loading.value = true
      commandInfo.value = '正在执行命令: brew list --versions\n'
      exec('brew list --versions', (error, stdout, stderr) => {
        loading.value = false
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          brewListArray.value = [{ name: systemInfo.value, version: '' }]
          return
        }
        alertType.value = 'success'
        brewListArray.value = stdout.split('\n').filter(item => item.trim() !== '').map(line => {
          const [name, ...versionParts] = line.split(/\s+/)
          const version = versionParts.join(' ')
          return { name, version }
        })
        systemInfo.value += stdout
        listTableColumns.value = [
          { prop: 'name', label: '包名', width: '180' },
          { prop: 'version', label: '版本' }
        ]
      })
    }

    const getBrewInfo = () => {
      if (!packageName.value) {
        alertType.value = 'error'
        systemInfo.value = '请输入要查看信息的包名'
        return
      }
      alertType.value = 'info'
      systemLoading.value = true
      commandInfo.value = `正在执行命令: brew info ${packageName.value}`
      systemInfo.value = ''
      exec(`brew info ${packageName.value}`, (error, infoStdout, infoStderr) => {
        if (error || infoStderr) {
          systemLoading.value = false
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${infoStderr}`
          return
        }
        systemInfo.value += infoStdout
        commandInfo.value = `正在执行命令: brew info ${packageName.value}; brew deps ${packageName.value}; brew uses ${packageName.value} --installed`
        exec(`brew deps ${packageName.value}`, (depsError, depsStdout, depsStderr) => {
          if (depsError || depsStderr) {
            systemLoading.value = false
            alertType.value = 'error'
            systemInfo.value += depsError ? `错误: ${depsError.message}` : `错误: ${depsStderr}`
            return
          }
          systemInfo.value += `\nbrew deps 输出:\n${depsStdout}`
          exec(`brew uses ${packageName.value} --installed`, (usesError, usesStdout, usesStderr) => {
            systemLoading.value = false
            if (usesError || usesStderr) {
              alertType.value = 'error'
              systemInfo.value += usesError ? `错误: ${usesError.message}` : `错误: ${usesStderr}`
              return
            }
            alertType.value = 'success'
            systemInfo.value += `\nbrew uses 输出:\n${usesStdout}`
            const depsList = depsStdout.split('\n').filter(item => item.trim() !== '');
            const usesList = usesStdout.split('\n').filter(item => item.trim() !== '');
            const maxLength = Math.max(depsList.length, usesList.length);
            while (depsList.length < maxLength) {
              depsList.push('');
            }
            while (usesList.length < maxLength) {
              usesList.push('');
            }
            const combinedData = [];
            for (let i = 0; i < maxLength; i++) {
              if (depsList[i]) {
                combinedData.push({
                  deps: depsList[i],
                  uses: usesList[i],
                });
              }
            }
            infoTableColumns.value = [
              { prop: 'deps', label: '前置模块', width: '180' },
              { prop: 'uses', label: '后置模块' }
            ];
            infoTableData.value = combinedData;
          })
        })
      })
    }

    const proxyCommands = `export no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com"; export http_proxy="http://127.0.0.1:7897"; export https_proxy="$http_proxy"; export all_proxy="socks5://127.0.0.1:7897";`;

    const installBrewPackage = () => {
      if (!packageName.value) {
        alertType.value = 'error'
        systemInfo.value = '请输入要安装的包名'
        return
      }
      alertType.value = 'info'
      systemLoading.value = true
      const command = `${proxyCommands} brew install ${packageName.value}`
      commandInfo.value = `正在执行命令: ${command}`
      systemInfo.value = ''
      exec(command, (error, stdout, stderr) => {
        systemLoading.value = false
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        alertType.value = 'success'
        systemInfo.value += stdout
        getBrewList()
      })
    }

    const uninstallBrewPackage = () => {
      if (!packageName.value) {
        alertType.value = 'error'
        systemInfo.value = '请输入要删除的包名'
        return
      }
      alertType.value = 'info'
      systemLoading.value = true
      commandInfo.value = `正在执行命令: brew uninstall ${packageName.value}`
      systemInfo.value = ''
      exec(`brew uninstall ${packageName.value}`, (error, stdout, stderr) => {
        systemLoading.value = false
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        alertType.value = 'success'
        systemInfo.value += stdout
        getBrewList()
      })
    }

    // 修改 onMounted 钩子
    onMounted(() => {
      if (brewListArray.value.length === 0) {
        getBrewList()
      }
    })

    return {
      brewListArray,
      loading,
      getBrewList,
      systemInfo,
      commandInfo,
      systemLoading,
      packageName,
      alertType,
      getBrewInfo,
      installBrewPackage,
      uninstallBrewPackage,
      filteredBrewList,
      listTableColumns,
      listTableData,
      infoTableColumns,
      infoTableData
    }
  }
}
</script>