<template>
  <div>
    <el-button type="primary" @click="getBrewVersion" :loading="systemLoading">Brew版本</el-button>
    <el-button type="primary" @click="updateBrew" :loading="systemLoading">升级Brew</el-button>
    <el-button type="primary" @click="upgradeAllBrewPackages" :loading="systemLoading">升级所有包</el-button>
    <el-button type="primary" @click="cleanupBrew" :loading="systemLoading">清理缓存</el-button>
    <el-button type="primary" @click="runBrewDoctor" :loading="systemLoading">运行诊断</el-button>
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
import { ref } from 'vue'
const { exec } = require('child_process')

// 定义代理设置前缀
const proxyCommands = `export no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com"; export http_proxy="http://127.0.0.1:7897"; export https_proxy="$http_proxy"; export all_proxy="socks5://127.0.0.1:7897";`;

export default {
  name: 'SystemManagement',
  setup() {
    const systemInfo = ref('')
    const commandInfo = ref('')
    const systemLoading = ref(false)
    const alertType = ref('info')

    const getBrewVersion = () => {
      alertType.value = 'info'
      systemLoading.value = true
      commandInfo.value = '正在执行命令: brew --version'
      systemInfo.value = ''
      exec('brew --version', (error, stdout, stderr) => {
        systemLoading.value = false
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        alertType.value = 'success'
        systemInfo.value += stdout
      })
    }

    const updateBrew = () => {
      systemLoading.value = true
      const command = `${proxyCommands} brew update`
      commandInfo.value = `正在执行命令: ${command}`
      systemInfo.value = ''
      exec(command, (error, stdout, stderr) => {
        systemLoading.value = false
        console.log('标准输出:', stdout);
        console.log('标准错误输出:', stderr);
        if (error) {
          alertType.value = 'error'
          systemInfo.value += `错误: ${error.message}\n标准错误输出: ${stderr}\n标准输出: ${stdout}`
          return
        }
        if (stderr) {
          console.warn('可能存在警告信息:', stderr);
          alertType.value = 'primary'
          systemInfo.value += `${stderr}\n标准输出: ${stdout}`
        } else {
          alertType.value = 'success'
          systemInfo.value += stdout
        }
      })
    }

    const cleanupBrew = () => {
      systemLoading.value = true
      commandInfo.value = '正在执行命令: brew cleanup'
      systemInfo.value = ''
      exec('brew cleanup', (error, stdout, stderr) => {
        systemLoading.value = false
        console.log('标准输出:', stdout);
        console.log('标准错误输出:', stderr);
        if (error) {
          alertType.value = 'error'
          systemInfo.value += `错误: ${error.message}\n标准错误输出: ${stderr}\n标准输出: ${stdout}`
          return
        }
        if (stderr) {
          console.warn('可能存在警告信息:', stderr);
          alertType.value = 'primary'
          systemInfo.value += `${stderr}\n标准输出: ${stdout}`
        } else {
          alertType.value = 'success'
          systemInfo.value += stdout
        }
      })
    }

    const runBrewDoctor = () => {
      systemLoading.value = true
      commandInfo.value = '正在执行命令: brew doctor'
      systemInfo.value = ''
      exec('brew doctor', (error, stdout, stderr) => {
        systemLoading.value = false
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        alertType.value = 'success'
        systemInfo.value += stdout
      })
    }

    const upgradeAllBrewPackages = () => {
      systemLoading.value = true
      const command = `${proxyCommands} brew upgrade`
      commandInfo.value = `正在执行命令: ${command}`
      systemInfo.value = ''
      exec(command, (error, stdout, stderr) => {
        systemLoading.value = false
        if (error || stderr) {
          alertType.value = 'error'
          systemInfo.value += error ? `错误: ${error.message}` : `错误: ${stderr}`
          return
        }
        if (stdout.trim() === '') {
          alertType.value = 'success'
          systemInfo.value = '所有包已经是最新版本'
        } else {
          alertType.value = 'success'
          systemInfo.value += stdout
        }
      })
    }

    return {
      systemInfo,
      commandInfo,
      systemLoading,
      alertType,
      getBrewVersion,
      updateBrew,
      cleanupBrew,
      runBrewDoctor,
      upgradeAllBrewPackages
    }
  }
}
</script>