import React, { useState } from 'react';
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase";
import { setUserInfo } from "../utils/auth"

const LoginAnonymous = () => {
  const [isName, setName] = useState<string>("")

  const signIn = async() => {
    try {
      if(isName && isName.length < 13){
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        setUserInfo(user.uid, isName);
      }else {
        alert("ニックネームは12文字以下で必須です");
      }
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <div className="flex justify-center items-center max-w-[1920px] min-h-screen">
      <div>
        <h1 className="flex justify-center mb-10 text-xl max-lg:text-lg max-md:text-base max-sm:text-sm">うぇぶじゃんけん</h1>
        <input 
            type="text" 
            value={ isName } 
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setName(e.target.value)} 
            placeholder="ニックネーム" 
            className="flex justify-center max-w-[1920px] mx-auto mb-4 border-2 border-font-color p-2"
          />
        <div className="flex flex-col justify-center gap-[10px]">
            <button type="submit" onClick={ signIn } className="w-[100%] border-2 border-font-color p-2">Let'sじゃんけん</button>
        </div>
      </div>
    </div>
  )
}

export default LoginAnonymous