import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export const deleteToken = async(id: string) => {
  const usersRef = doc(db, "users", id);
  await updateDoc(usersRef, {
    groupToken: null
  })
}