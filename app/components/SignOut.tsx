import React from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from "../../firebase";
import { deleteDoc, doc, collection, where, query, getDocs } from 'firebase/firestore';



const SignOut = () => {

  const signOutUser = async() => {
    const user = auth.currentUser
    if(user){
      const userQuery = query(collection(db, "users"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await deleteDoc(userDoc.ref);
      }
      await deleteDoc((doc(db, "users", user.uid)));
      await signOut(auth)
      .then(() => {
        console.log("logout success")
      })
      .catch((error) => {
        alert('サインアウトが正常にできませんでした（' + error.message + '）')
      });
    }
  }

  
  return (
    <button onClick={ signOutUser } className="border-2 border-font-color p-2">ログアウト</button>
  )
}

export default SignOut