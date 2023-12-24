import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from "../../firebase"

const Login = () => {
  const [isName, setName] = useState<string>("")
  const [isEmail, setEmail] = useState<string>("")
  const [isPassword, setPassword] = useState<string>("")

  const signUp = () => {
    createUserWithEmailAndPassword(auth, isEmail, isPassword)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      addDoc(collection(db, "users"), {
        displayName: isName,
        userId: user.uid
      })
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode + ":" + errorMessage)
    });
  }

  const signIn = () => {
      signInWithEmailAndPassword(auth, isEmail, isPassword)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        addDoc(collection(db, "users"), {
          displayName: isName,
          userId: user.uid
        })
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode + ":" + errorMessage)
    });
  }

  return (
    <div className="flex justify-center items-center max-w-[1920px] min-h-screen">
      <div className="">
        <h1 className="flex justify-center my-10">うぇぶじゃんけん</h1>
        <input 
            type="text" 
            value={ isName } 
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setName(e.target.value)} 
            placeholder="ニックネーム" 
            className="flex justify-center max-w-[1920px] mx-auto mb-10 border-2 border-font-color p-2"
          />
        <div className="flex justify-center gap-[1px]">
          <input 
            type="text" 
            value={ isEmail } 
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setEmail(e.target.value)} 
            placeholder="Email" 
            className="border-2 border-font-color p-2"
          />
          <input 
            type="text" 
            value={ isPassword } 
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setPassword(e.target.value)} 
            placeholder="パスワード" 
            className="border-2 border-font-color p-2"
          />
          <button type="submit" onClick={ signIn } className="border-2 border-font-color p-2">ログイン</button>
          <button type="submit" onClick={ signUp } className="border-2 border-font-color p-2">登録</button>
        </div>
      </div>
    </div>
  )
}

export default Login