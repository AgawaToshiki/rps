import React from 'react'
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase'

const GroupList = () => {

    const q = query(collection(db, "users"), where("username", "==", "agawa"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users: Array<[]> = [];
      querySnapshot.forEach((doc) => {
          users.push(doc.data().name);
      });
      console.log("Current cities in CA: ", users.join(", "));
    });
  return (
    <div>GroupList</div>
  )
}

export default GroupList