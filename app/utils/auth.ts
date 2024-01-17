import { db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';


export const setUserInfo = async(id: string, displayName: string) => {
    setDoc(doc(db, "users", id), {
        displayName: displayName,
        userId: id
      })
}