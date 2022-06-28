import Vue from 'vue'
import Vuex from 'vuex'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut } from "firebase/auth";
import { db } from "../main";
import { doc, setDoc, getDoc, increment, runTransaction } from "firebase/firestore";
import router from '@/router';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        uid: null,
        user: [],
    },
    getters: {
        uid: function(state){
            return state.uid;
        },
        user: function(state){
            return state.user;
        },
    },
    mutations: {
        // ログインしているユーザ情報
        setUid: function(state, uid){
            state.uid = uid;
        },
        setUser: function(state, user){
            state.user = user;
        },
        updateUserWallet: function(state, wallet){
            state.user.wallet = wallet;
        }
    },
    actions: {
        /* ======================================================== */
        /* 新規登録
        /* ======================================================== */
        sendAuth: function({commit},{userName, userMailaddress, userPassword}){
            // firebaseの新規登録処理を実行
            const auth = getAuth();
            createUserWithEmailAndPassword(auth, userMailaddress, userPassword)
            .then((userCredential) => {// ログイン成功時
                // UIDを元にユーザ情報（メールアドレス、パスワード以外の情報）を保存
                const uid = userCredential.user.uid;
                const user = {
                    name: userName,
                    wallet: 0
                };
                setDoc(doc(db, "users", uid), user);
                // mutationのsetUidを呼び出し、uid保存しておく
                commit('setUid', uid)
                // mutationのsetUserを呼び出し、現在のログインしているユーザ情報を保存しておく
                commit('setUser', user)
                // 参考：https://zenn.dev/aono/articles/af05f7baba7d24
                // 参考：https://chico-shikaku.com/2020/08/vuex-using-router-in-store/
                // ログイン後画面へ移動
                // router.push('/dashboard');
                router.push({ 'name': 'dashboard'});
            })
            .catch((error) => {// 登録失敗時
                console.log("登録失敗")
                console.log(error);
            });
        },
        /* ======================================================== */
        /* ログイン処理
        /* ======================================================== */
        signIn: function({commit}, {userMailaddress, userPassword}){
            // firebaseのログイン処理を実行
            const auth = getAuth();
            signInWithEmailAndPassword(auth, userMailaddress, userPassword)
            .then((userCredential) => {
                // ログイン成功ユーザのuidを取得
                const uid = userCredential.user.uid;
                const getDataByFireStore = async () => {
                    // Firestore Databaseのusersテーブルからuidを元に個人情報を取得する
                    const docRef = doc(db, "users", uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        // データが存在している場合はユーザ情報をセット
                        const docData = docSnap.data();
                        const user = {
                            name: docData.name,
                            wallet: docData.wallet
                        };
                        // mutationのsetUidを呼び出し、uid保存しておく
                        commit('setUid', uid)
                        // mutationのsetUserを呼び出し、現在のログインしているユーザ情報を保存しておく
                        commit('setUser', user)
                        // ログイン後画面へ移動
                        router.push({ 'name': 'dashboard'});
                      } else {
                        // データが取得出来ない場合はエラー
                        console.log("No such document!");
                      }
                }
                getDataByFireStore(); 
            })
            .catch((error) => {
                console.log(error);
            });
        },
        /* ======================================================== */
        /* ログアウト処理
        /* ======================================================== */
        logout: function({commit}){
            const auth = getAuth();
            signOut(auth).then(() => {
              // ログアウト成功、stateを初期化
              commit('setUid', null)
              commit('setUser', []);
              // ログイン画面へ移動
            router.push({ 'name': 'home'});
            }).catch((error) => {
                console.log(error);
            });
        },
        /* ======================================================== */
        /* ウォレット送信処理
        /* ======================================================== */
        sendWallet: async function({commit}, {toUid, wallet}){
            // 送り先
            const toDocRef = doc(db, "users", toUid);
            // 送り元（自分）
            const fromDocRef = doc(db, "users", this.getters.uid);
            try {
                // トランザクションの開始
                await runTransaction(db, async (transaction) => {
                    // 送り先のwalletを加算
                    transaction.update(toDocRef, { wallet: increment(wallet) });
                    // 送り元のwalletを減額
                    transaction.update(fromDocRef, { wallet: increment(-wallet) });
                });
                // 更新後の自身のウォレットを取得
                const fromDocSnap = await getDoc(fromDocRef);
                if (fromDocSnap.exists()) {
                    commit('updateUserWallet', fromDocSnap.data().wallet);
                    console.log("Transaction successfully committed!");
                } else {
                    console.log("No such document!");
                }
              } catch (e) {
                console.log("Transaction failed: ", e);
              }
        }
    }
})
