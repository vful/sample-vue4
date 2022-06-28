<template>
  <div class="signup">
    <h1 v-if="flag" >新規登録画面</h1>
    <h1 v-else>ログイン画面</h1>
    <table>
        <tr v-if="flag">
          <th style="vertical-align: middle">ユーザー名</th><td><input class="input" type="text" v-model="name" placeholder="userName"></td>
        </tr>
        <tr>
          <th style="vertical-align: middle">メールアドレス</th><td><input class="input" type="email" v-model="mailaddress" placeholder="E-Mail"></td>
        </tr>
        <tr>
          <th style="vertical-align: middle">パスワード</th><td><input class="input" type="password" v-model="password" placeholder="Password"></td>
        </tr>
      </table>
      <template v-if="!flag">
        <ul style="list-style:none;">
          <li><button class="button is-info is-outlined" @click="login">ログイン</button></li>
          <li><button class="button is-ghost" @click="toggleFlag">新規登録はこちらから</button></li>
        </ul>
      </template>
      <template v-else>
        <ul style="list-style:none;">
          <li><button class="button is-info is-outlined" @click="signs">新規登録</button></li>
          <li><button class="button is-ghost" @click="toggleFlag">ログインはこちらから</button></li>
        </ul>
      </template>
      <!-- <router-link to="/">ログインはこちらから</router-link> -->
  </div>
</template>

<script>
  export default {
    data(){
      return {
        name: '',
        mailaddress: '',
        password: '',
        flag: false
      }
    },
    methods: {
      signs: function () {
        if(this.name && this.mailaddress && this.password){
          this.$store.dispatch('sendAuth', { userName: this.name, userMailaddress: this.mailaddress, userPassword: this.password });
        }
      },
      toggleFlag: function () {
        this.flag = !this.flag;
      },
      login: function () {
        this.$store.dispatch('signIn', { userMailaddress: this.mailaddress, userPassword: this.password });
      }
    }
  }
</script>