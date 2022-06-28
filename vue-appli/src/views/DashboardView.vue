<template>
    <div>
        <div class="columns is-vcentered">
            <div class="column has-text-left">
                {{$store.getters.user.name}}さんようこそ！！！
            </div>
            <div class="column">
                <div class="columns is-vcentered is-mobile">
                    <div class="column has-text-right">
                        残高：{{$store.getters.user.wallet}}
                    </div>
                    <div class="column is-4">
                        <button class="button is-link" @click="logout">ログアウト</button>
                    </div>
                </div>
            </div>
        </div>

        <h1>ユーザー一覧</h1>
        <table>
            <thead>
            <tr>
                <th>ユーザー</th>
                <th></th>
                <th></th>
            </tr>
            </thead>
            <template v-for="u in users">
            <tr :key="u.index">
                <td>{{u.name}}</td>
                <td><button type="button" class="button is-info" @click="showWallet(u.uid, u.name)">walletを見る</button></td>
                <td><button type="button" class="button is-info" @click="showSend(u.uid)">送る</button></td>
            </tr>
            </template>
        </table>
        <transition>
            <div class="modal is-active" v-if="isShowWallet">
                <div class="modal-background"></div>
                <div class="modal-content" style="width:320px;">
                    <div class="box">
                        <p>{{ modal.name }}さんの残高</p>
                        {{ modal.wallet }}
                        <div class="has-text-centerd mt-5"><button class="button is-light" @click="isShowWallet = false">閉じる</button></div>
                    </div>
                </div>
            </div>
        </transition>
        <transition>
            <div class="modal is-active" v-if="isShowSend">
                <div class="modal-background"></div>
                <div class="modal-content" style="width:320px;">
                    <div class="box">
                        <p>あなたの残高：{{ $store.getters.user.wallet }}<br>
                        送る金額</p>
                        <input type="number" v-model="sendWalletValue" style="width:180px" v-bind:class="{'input':true, 'is-danger' :(errorMessage != null)}">
                        <div class="has-text-danger">&nbsp;<small v-if="errorMessage">{{ errorMessage }}</small></div>
                        <div class="has-text-centerd mt-5">
                            <button class="button is-light ml-5 mr-5" @click="isShowSend = false">キャンセル</button>
                            <button class="button is-danger ml-5 mr-5" @click="sendWallet()" v-bind:disabled="((this.errorMessage != null || sendWalletValue == '') ? true : false)">送る</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter,
.v-leave-to {
  opacity: 0;
}
</style>
<script>
import { db } from "../main";
import { doc, collection, getDoc, getDocs } from "firebase/firestore";
  export default {
    data(){
        return  {
            users : [], // 他のユーザ一覧
            modal: [], // モーダル表示用の値
            isShowWallet: false, // walletモーダル表示フラグ
            isShowSend: false, // 送るモーダル表示フラグ
            sendWalletValue: null, // 送るwallet値
            sendWalletUid: null, // 送る相手のuid
            errorMessage: null
        }
    },
    mounted: async function(){
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            if(this.$store.getters.uid != doc.id){
                const user = {
                    uid: doc.id,
                    name: doc.data().name,
                };
                this.users.push(user);
            }
        });
    },
    watch: {
        sendWalletValue: function(newVal){
            newVal = Number(newVal);
            if(!(Number.isInteger(newVal))){
                this.errorMessage = '整数で設定してください。'
                return;
            }
            else if(this.$store.getters.user.wallet < newVal){
                this.errorMessage = '自分の残高を超えない値を設定してください。'
                return;
            }
            else if(newVal < 0){
                this.errorMessage = '1以上の値を入力してください。'
                return;
            }
            this.errorMessage = null;
            return;
        }
    },
    methods: {
        showWallet: async function(uid, name){
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                this.modal = {
                    name : name,
                    wallet : docSnap.data().wallet
                };
                this.isShowWallet = true;
            } else {
                console.log("No such document!");
            }
        },
        showSend: function(uid){
            this.sendWalletValue = null;
            this.sendWalletUid = uid;
            this.isShowSend = true;
            this.errorMessage = null;
        },
        sendWallet: async function(){
            if(this.$store.getters.user.wallet < this.sendWalletValue ){
                console.log('自身の残高を超えているため送ることはできません');
                return;
            }

            // 自身のウォレットを更新
            this.$store.dispatch('sendWallet', { toUid: this.sendWalletUid, wallet: this.sendWalletValue });

            this.sendWalletUid = null;
            this.sendWalletValue = null;
            this.isShowSend = false;
        },
        // ログアウト処理
        logout: function () {
            this.$store.dispatch('logout');
        }
    }

  }
</script>