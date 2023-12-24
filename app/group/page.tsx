"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const page = () => {
  const nextQuery = useSearchParams()
  const params = { 
      id: nextQuery.get('id'), 
  }

  const [getMember, setMember] = useState<{
    userId: string,
    displayName: string,
    choice: string
  }[]>([]);
  const [isGameStart, setGameStart] = useState<string>("waiting");
  const [isAllReady, setAllReady] = useState<boolean>(false);
  const [selectedHand, setSelectedHand] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [selectedAllHand, setSelectedAllHand] = useState<[]>([])

  useEffect(() => {

      if(params.id){
          //グループメンバー取得
        const memberDocRef = query(collection(db, "groups", params.id, "members"))
        onSnapshot(memberDocRef, (querySnapshot) => {
          const membersArray: { userId: string, displayName: string, choice: string }[] = [];
          querySnapshot.docs.forEach((doc) => {
            membersArray.push({
              userId: doc.data().userId,
              displayName: doc.data().displayName,
              choice: doc.data().choice,
            })
          })
          setMember(membersArray)
        })
        //グループ名とゲームの状態を取得
        const groupCollectionDocRef = collection(db, "groups")
        const statusDocRef = query(groupCollectionDocRef, where("groupId", "==", params.id))
        onSnapshot(statusDocRef, (querySnapshot) => {
          querySnapshot.docs.forEach((doc) => {
            const gameStatus: string = doc.data().status
            const groupName: string = doc.data().groupName
            setGroupName(groupName)
            setGameStart(gameStatus)
          })
        })
      }
  }, [])

  useEffect(() => {
    //Ready状態か監視
    const isReady = getMember.every((member) => member.choice !== "");
    if(isReady) {
      setAllReady(true);
    } else {
      setAllReady(false)
    }
  }, [getMember])

  useEffect(() => {
    //手のリセットはゲームが終わったタイミング
    if(isGameStart === "waiting")
      setSelectedHand("")
  }, [isGameStart])

  const handleLeaveGroup = () => {

  }

  const handleChooseHand = async(choice: string) => {
    //手の選択をリアルタイムでfirestoreに反映
    if(params.id && auth.currentUser){
      const memberQuery = query(collection(db, "groups", params.id, "members"), where("userId", "==", auth.currentUser.uid))
      const memberQuerySnapshot = await getDocs(memberQuery);
      if(memberQuerySnapshot.size > 0) {
        const memberDoc = memberQuerySnapshot.docs[0];
        const memberDocRef = doc(db, "groups", params.id, "members", memberDoc.id);
        await updateDoc(memberDocRef, { choice });
        setSelectedHand(choice)
      } else {
        console.log("メンバーが見つかりません。")
      }
    }
  }

  const handleGameStart = async() => {
    //ゲームをスタート・全員の手を取得
    if(params.id){
      const statusDoc = doc(db, "groups", params.id)
      await updateDoc(statusDoc, {
        status: "playing"
      })
      const memberQuery = query(collection(db, "groups", params.id, "members"));
      onSnapshot(memberQuery, (querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          setSelectedAllHand(doc.data().choice);
        })
      })
      console.log(selectedAllHand)
      setGameStart("playing")
    }
  }

  const handleGameRestart = async() => {
    //ゲームをリセット・全員の手を空に
    if(params.id && auth.currentUser){
      const statusDoc = doc(db, "groups", params.id)
      await updateDoc(statusDoc, {
        status: "waiting"
      })
      const memberQuery = query(collection(db, "groups", params.id, "members"))
      const memberQuerySnapshot = await getDocs(memberQuery);
      if(memberQuerySnapshot.size > 0) {
        memberQuerySnapshot.forEach(async(memberDoc) => {
          if(params.id){
            const memberDocRef = doc(db, "groups", params.id, "members", memberDoc.id);
            await updateDoc(memberDocRef, 
              { choice : "" }
            );
          }
        })
      }
      setGameStart("waiting")
    }
  }

  return (
    <div className="min-h-screen">
      <p className="flex justify-center w-full my-10">グループ名:{ groupName }</p>
      <div className="p-10 mb-20">
        <div className="flex w-full">
          <p className="flex w-[50%]">参加者</p>
          <p className="flex w-[50%]">じゃんけん</p>
        </div>
        { getMember.map((member) => (
          <div key={ member.userId } className="flex w-full">
            <div className="flex justify-center items-center bg-pink-200 w-[50%] h-[80px] p-2">
              <p>{ member.displayName }</p>
            </div>
            <div className="flex justify-center items-center bg-pink-300 w-[50%] h-[80px] p-2">
              {isGameStart === "playing"
                ? (<div>
                  {member.choice
                    ? (<Image 
                          src={`/images/${member.choice}.png`}
                          alt=""
                          width={100}
                          height={100}
                          priority={false}
                          className="w-[50px] h-auto"
                        />
                      )
                    : (<p>waiting...</p>)
                  }

                  </div>
                  )
                : (
                  <div>
                    {member.choice
                    ? (<p>Ready</p>)
                    : (<p>waiting...</p>)
                  }
                  </div>
                  )
              }
            </div>
          </div>
        )) }
      </div>
      <div className="flex justify-center w-full mb-10 gap-4">
        <button 
          onClick={() => handleChooseHand('rock')} 
          disabled={ isGameStart === "playing" }
          className={`${selectedHand === 'rock' ? 'bg-red-200' : ''} flex justify-center items-center w-[100px] h-[100px] border border-black rounded-full disabled:bg-gray-200`}>
          <Image 
            src="/images/rock.png"
            alt=""
            width={50}
            height={52}
            priority={false}
            className="w-[50px] h-auto"
          />
        </button>
        <button 
          onClick={() => handleChooseHand('scissors')}
          disabled={ isGameStart === "playing" }
          className={`${selectedHand === 'scissors' ? 'bg-red-200' : ''} flex justify-center items-center w-[100px] h-[100px] border border-black rounded-full disabled:bg-gray-200`}>
          <Image 
            src="/images/scissors.png"
            alt=""
            width={64}
            height={85}
            priority={false}
            className="w-[50px] h-auto"
          />
        </button>
        <button 
          onClick={() => handleChooseHand('paper')}
          disabled={ isGameStart === "playing" }
          className={`${selectedHand === 'paper' ? 'bg-red-200' : ''} flex justify-center items-center w-[100px] h-[100px] border border-black rounded-full disabled:bg-gray-200`}>
          <Image 
            src="/images/paper.png"
            alt=""
            width={64}
            height={68}
            priority={false}
            className="w-[50px] h-auto"
          />
        </button>
      </div>
      <div className="flex justify-center w-full">
        {isGameStart === "playing"
          ? 
          (
            <button
              onClick={ handleGameRestart }  
              className="flex justify-center items-center w-[200px] h-[200px] border border-black rounded-full disabled:bg-gray-200">
                もう1回じゃんけんする
            </button>
            )
          : 
          (
            <button 
              onClick={ handleGameStart } 
              disabled={ !isAllReady } 
              className="flex justify-center items-center w-[200px] h-[200px] border border-black rounded-full disabled:bg-gray-200">
                Start
            </button>
          )
        }
      </div>
      <Link href="/" onClick={() => { handleLeaveGroup }}>退出</Link>
    </div>
  )
}

export default page