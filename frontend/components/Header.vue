<template>
<div>
    <el-menu 
  :default-active="activeIndex2"
  class="el-menu-demo"
  mode="horizontal"
  @select="handleSelect"
  background-color="#F5F5F5"
  text-color="#000000"
  active-text-color="#8000ff">
  <el-menu-item index="1" @click="isCollapse=!isCollapse"><i class="el-icon-s-fold"></i></el-menu-item>
  <span style="top:50%;position:absolute;right:50%">Career Test Live</span>
  <el-menu-item index="2" style="margin-left:82%"><i class="el-icon-message-solid"><el-badge :value="3" class="item" style="margin-top:0px;padding-bottom:20px"></el-badge></i></el-menu-item>
  <el-submenu index="3">
    <template slot="title" ><i class="el-icon-user-solid"></i></template>
    <el-menu-item index="3-1" class="profilemenu">Profile</el-menu-item>
    <el-menu-item index="3-2" class="profilemenu">Settings</el-menu-item>
    <el-menu-item index="3-3" class="profilemenu">Logout</el-menu-item>
  </el-submenu>
</el-menu> 
 <el-menu v-bind:default-active="defaultval" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
  <el-menu-item index="1" @click="$router.push('/')">
    <i class="el-icon-odometer"></i>
    <span slot="title">Dashboard</span>
  </el-menu-item>
  <el-menu-item index="2" @click="$router.push('/adddomain')">
    <i class="el-icon-circle-plus-outline"></i>
    <span slot="title">Domains</span>
  </el-menu-item>
  <el-menu-item index="3" @click="$router.push('/questions')">
    <i class="el-icon-s-order"></i>
    <span slot="title">Questions</span>
  </el-menu-item>
  <el-menu-item index="4"  @click="$router.push('/createtest')">
    <i class="el-icon-document"></i>
    <span slot="title">Create Test</span>
  </el-menu-item>
  <el-menu-item index="5"  @click="$router.push('/createexam')">
    <i class="el-icon-s-claim"></i>
    <span slot="title">Create Exam</span>
  </el-menu-item>
  <el-menu-item index="6"  @click="$router.push('/notification')">
    <i class="el-icon-message-solid"></i>
    <span slot="title">Notifications</span>
  </el-menu-item>
  <el-menu-item index="7" @click="$router.push('/generalinstructions')">
    <i class="el-icon-document-copy"></i>
    <span slot="title">General Instructions</span>
  </el-menu-item>
  <el-menu-item index="8" @click="$router.push('/requests')">
    <i class="el-icon-thumb"></i>
    <span slot="title">Requests</span>
  </el-menu-item>
  <el-menu-item index="9" @click="$router.push('/results')">
    <i class="el-icon-trophy"></i>
    <span slot="title">Results</span>
  </el-menu-item>
  <el-menu-item index="10" >
    <i class="el-icon-switch-button"></i>
    <span slot="title">Logout</span>
  </el-menu-item>
  <br>
</el-menu>
</div>
</template>

<script>
import Header from './Header'
  export default {
    data() {
      return {
        activeIndex: '1',
        activeIndex2: '1',
         isCollapse: true,
         defaultval:'1',
         hdcolor:'blue'
      };
    },
   props:["defaultval"],
    components:{
      'Header':Header,
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>
<style>
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }
  .profilemenu{
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  }

</style>