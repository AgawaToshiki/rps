import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';


export const groupMemberDelete = async(paramsId: string, id: string) => {
    const groupMemberDocRef = doc(db, "groups", paramsId, "members", id)
      const docSnapshot = await getDoc(groupMemberDocRef);
      if(docSnapshot.exists()) {
        await deleteDoc(groupMemberDocRef);
      }
}