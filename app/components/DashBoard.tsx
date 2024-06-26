import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal';
import GroupList from './GroupList';
import Group from './Group';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from "../../firebase";
import SignOut from './SignOut';


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}

type Props = {
  data: {
    displayName: string;
    id: string;
  },
  groupData: {
    groupName: string;
    groupId: string;
    password: string | null;
  }[],
}

const DashBoard = ({ data, groupData }: Props) => {
  const [newGroup, setNewGroup] = useState<{ id: string, name: string }[]>([]);
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");

  const ref = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(!auth.currentUser){
      throw new Error("ログインしていません");
    }
  },[])
  
  const handleNewGroup = async() => {
    if(ref.current && auth.currentUser){
      if(ref.current.value.trim() === "" || ref.current.value.length > 12){
        alert("グループ名は12文字以下で必須です");
        return
      }
      const groupId = uuidv4();
      const password = usePassword && passwordRef.current !== null && passwordRef.current.value !== "" ? passwordRef.current.value : null;
      setNewGroup([...newGroup, { id: groupId, name: ref.current.value }]);
      await setDoc(doc(db, "groups", groupId), {
        groupId: groupId,
        groupName: ref.current.value,
        status: "waiting",
        winnerHand: "no Hand",
        userId: auth.currentUser.uid,
        password: password
      })
      ref.current.value = "";
      if(passwordRef.current)
      passwordRef.current.value = "";
    }
  }

  const handleJoinGroup = async(groupId: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if(!groupDoc.exists()){
      alert("グループが存在しません");
      return
    }
    const groupPassword: string = groupDoc.data().password;
    if(groupPassword && groupPassword !== null){
      setOpenModal(true);
      setGroupId(groupId);
    }else{
      await addUserGroup(groupId);
    }
  }

  const handleSubmit = async() => {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if(!groupDoc.exists()){
      handleCancel();
      alert("グループが存在しません");
      return
    }
    const groupPassword: string = groupDoc.data().password;
    if(groupPassword === password){
      await addUserGroup(groupId);
      handleCancel();
    }else{
      alert("パスワードが違います");
      handleCancel();
    }
  }

  const handleCancel = () => {
    setOpenModal(false);
    setPassword("");
    setGroupId("");
  }

  const handleUsePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsePassword(e.target.checked);
  }


  const addUserGroup = async(id: string) => {
    const memberCollectionRef = collection(db, "groups", id, "members");
    const memberDocRef = doc(memberCollectionRef, data.id);
    const userRef = doc(db, "users", data.id);

    await setDoc(memberDocRef, {
      userId: data.id,
      displayName: data.displayName,
      choice: ""
    })

    await updateDoc(userRef, {
      groupToken: password ? password : null
    })

    window.location.href = `/group?id=${id}`;
  }

  return (
    <div className="flex flex-col max-w-[1920px] w-[90%] mx-auto max-sm:w-[95%]">
      <p className="flex justify-center w-full my-14 text-2xl max-md:my-10 max-md:text-lg">ようこそ{ data.displayName }さん</p>
      <div className="mb-14 max-md:mb-10">
        <div className="flex gap-[1px] mb-4 max-md:flex-col max-md:gap-[10px]">
            <input 
              type="text" 
              ref={ ref } 
              className="border-2 border-font-color p-2" 
            />
            <button onClick={ handleNewGroup } className="border-2 border-font-color p-2">新規グループ作成</button>
        </div>
        <div className="flex gap-2 items-center">
          <div>
            <input type="checkbox" id="password" onChange={ (e) => handleUsePassword(e)} />
            <label htmlFor="password">パスワードを設定</label>
          </div>
          {usePassword 
            ? 
            ( 
            <div>
              <input type="password" ref={ passwordRef } className="border-2 border-font-color p-2" placeholder="パスワード"/>
            </div>
            ) 
            : 
            ( <div></div> )
            }
        </div>
      </div>
      <div>
        <p className="text-xl border-b-2 pb-2">グループ一覧</p>
      </div>
      <GroupList>
        <div className="grid grid-cols-4 my-10 max-lg:grid-cols-3 max-sm:grid-cols-2 gap-2">
          {groupData.map((group) => {
            return (
              <Link
                onClick={ (e) => { handleJoinGroup(group.groupId, e) } }
                href="#"
                key={ group.groupId }>
                  <Group groupName={ group.groupName } password = { group.password }/>
              </Link>
            )
          })}
        </div>
      </GroupList>
      <div className="flex justify-start">
        <SignOut />
      </div>
      <Modal 
        isOpen={ isOpenModal }
        contentLabel="Modal"
        ariaHideApp={false}
        onRequestClose={ handleCancel }
        style={customStyles}
      >
        <p className="mb-4">パスワードを入力してください</p>
        <div className="flex max-sm:flex-col gap-[1px]">
          <input type="password" value={ password } onChange={ (e) => setPassword(e.target.value) } className="border-2 border-font-color p-2" autoFocus/>
          <div className="flex gap-[1px]">
            <button onClick={ handleSubmit } className="border-2 border-font-color p-2 bg-green-300 max-sm:w-[50%]">送信</button>
            <button onClick={ handleCancel } className="border-2 border-font-color p-2 bg-red-300 max-sm:w-[50%]">キャンセル</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DashBoard