"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { groupMemberDelete } from '../utils/group';
import { deleteToken } from '../utils/user';
import ProtectGroupRoute from '../components/ProtectGroupRoute';

const GroupPage = () => {
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
  const [winner, setWinner] = useState<string>("");
  const [isOwner, setOwner] = useState<boolean>(false);


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
          setMember(membersArray);
        })
        //グループ名とゲームの状態を取得
        const statusDocRef = query(collection(db, "groups"), where("groupId", "==", params.id))
        onSnapshot(statusDocRef, (querySnapshot) => {
          querySnapshot.docs.forEach((doc) => {
            const gameStatus: string = doc.data().status
            const groupName: string = doc.data().groupName
            const owner: string = doc.data().userId
            setGroupName(groupName);
            setGameStart(gameStatus);
            if(auth.currentUser)
            if(owner === auth.currentUser.uid){
              setOwner(true);
            }
          })
        })
      }
  }, [params.id])

  useEffect(() => {
    //Ready状態か監視
    const isReady = getMember.every((member) => member.choice !== "");
    if(isReady) {
      setAllReady(true);
    } else {
      setAllReady(false);
    }
  }, [getMember])

  useEffect(() => {
    //手のリセットはゲームが終わったタイミング
    if(isGameStart === "waiting")
      setSelectedHand("")
    //ゲーム状態が変更されるタイミングで勝ちの手を取得
    const winnerQuery = query(collection(db, "groups"), where("groupId", "==", params.id));
    onSnapshot(winnerQuery, (querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        setWinner(doc.data().winnerHand);
      })
    })
  }, [isGameStart, params.id])


  const winnerRps = (choices: string[]): string => {

    const rock = choices.includes("rock");
    const paper = choices.includes("paper");
    const scissors = choices.includes("scissors");

    //引き分けパターンを除いた勝ちパターン
      if(!rock && paper && scissors){
        return "scissors"
      } else if (!paper && rock && scissors){
        return "rock"
      } else if (!scissors && rock && paper){
        return "paper"
      } else {
        return "draw"
      }
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
        console.log("メンバーが見つかりません")
      }
    }
  }

  const handleGameStart = async() => {
    //ゲームをスタート・全員の手を取得
    if(params.id){
      const memberQuery = query(collection(db, "groups", params.id, "members"));
      const querySnapshot = await getDocs(memberQuery);
      const choiceArray: string[] = [];
      querySnapshot.forEach((doc) => {
        choiceArray.push(doc.data().choice);
      });

      const statusDoc = doc(db, "groups", params.id)
      await updateDoc(statusDoc, {
        status: "playing",
        winnerHand: winnerRps(choiceArray)
      })

      setGameStart("playing")
    }
  }

  const handleGameReset = async() => {
    //ゲームをリセット・全員の手を空に
    if(params.id && auth.currentUser){
      const statusDoc = doc(db, "groups", params.id)
      await updateDoc(statusDoc, {
        status: "waiting",
        winnerHand: "no Hand"
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

  const handleLeaveGroup = async() => {
    if(params.id && auth.currentUser){
      await groupMemberDelete(params.id, auth.currentUser.uid);
      await deleteToken(auth.currentUser.uid);
    }
  }

  const handleDeleteGroup = async() => {
    if(params.id){
      const groupDocRef = doc(db, "groups", params.id);
      const memberDocRef = collection(db, "groups", params.id, "members");
      const querySnapshot = await getDocs(memberDocRef);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(groupDocRef, {
          groupName: ""
        })
        await deleteDoc(doc.ref)
      })
      await deleteDoc(groupDocRef);
    }
  }

  const handleMemberSpectate = async(id: string) => {
    if(params.id){
      await groupMemberDelete(params.id, id);
    }
  }

  const handleReJoin = async() => {
    if(params.id && auth.currentUser){
      try {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if(userDoc.exists()){
          
          const displayName = userDoc.data().displayName;

          const memberDocRef = doc(db, "groups", params.id, "members", uid);
          await setDoc(memberDocRef, {
            userId: uid,
            displayName: displayName,
            choice: ""
          })
        }
      }catch(error){
        console.error(error);
      }
    }
  }

  return (
    <ProtectGroupRoute groupId={ params.id }>
      <div>
        { groupName === "" 
          ? (
            <div>
              <p className="flex justify-center w-full py-10 text-2xl">グループは解散されました</p>
              <div className="m-10 max-md:mx-2">
                <Link href="/" className="border-2 border-font-color p-2 text-center">グループ一覧へ戻る</Link>
              </div>
            </div>
            )
          : (
          <div>
            <p className="flex justify-center w-full my-14 text-2xl max-md:text-lg max-md:my-10">グループ名:{ groupName }</p>
            {winner === selectedHand 
              ? (<p className="flex justify-center w-full py-10 text-lg bg-yellow-100">Win!!!</p>)
              : winner === "draw" 
              ? <p className="flex justify-center w-full py-10 text-lg bg-gray-100">Draw</p> 
              : winner === "no Hand"
                ? <p></p>
                : <p className="flex justify-center w-full py-10 text-lg bg-blue-100">Lose...</p>
            }
            <div className="mx-10 my-14 max-md:mx-2 max-md:my-10">
              <div className="flex max-w-[1920px] w-full">
                <p className="flex w-[50%]">参加者</p>
                <p className="flex w-[50%]">じゃんけん</p>
              </div>
              { getMember.map((member) => (
                <div key={ member.userId } className="flex w-full items-center mb-2">
                  <div className={`${isAllReady && isGameStart === "waiting" ? 'bg-yellow-100': 'bg-red-200'} flex justify-center items-center w-[50%] h-[50px] p-2`} >
                    <p className="text-xl max-lg:text-lg max-md:text-base max-sm:text-sm">{ member.displayName }</p>
                  </div>
                  <div className={`${isAllReady && isGameStart === "waiting" ? 'bg-yellow-100': 'bg-red-200'} flex justify-center items-center w-[50%] h-[50px] p-2`}>
                    {isGameStart === "playing"
                      ? (<div>
                        {member.choice
                          ? (<Image 
                                src={`/images/${member.choice}.png`}
                                alt=""
                                width={100}
                                height={100}
                                priority={false}
                                className="w-[35px] h-auto max-md:w-[30px]"
                              />
                            )
                          : (<p>waiting...</p>)
                        }
    
                        </div>
                        )
                      : (
                        <div>
                          {member.choice
                          ? (<p className="text-xl max-lg:text-lg max-md:text-base max-sm:text-sm">Ready</p>)
                          : (<p className="text-xl max-lg:text-lg max-md:text-base max-sm:text-sm">waiting...</p>)
                        }
                        </div>
                        )
                    }
                  </div>
                  {isOwner 
                    ? (
                        <div className="w-[10%] text-center max-md:w-[20%]">
                          <button onClick={ () => handleMemberSpectate(member.userId) } className="border-2 border-font-color p-2 text-center bg-red-300">観戦</button>
                        </div>
                      )
                    : (
                      <div></div>
                    )
                  }
                </div>
              )) }
            </div>
            <div className="flex justify-center w-full mb-10 gap-4">
              <button 
                onClick={() => handleChooseHand('rock')} 
                disabled={ isGameStart === "playing" }
                className={`${selectedHand === 'rock' ? 'bg-red-300' : ''} flex justify-center items-center w-[100px] h-[100px] max-md:w-[80px] max-md:h-[80px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none`}>
                <Image 
                  src="/images/rock.png"
                  alt=""
                  width={50}
                  height={52}
                  priority={false}
                  className="w-[50px] h-auto max-md:w-[30px]"
                />
              </button>
              <button 
                onClick={() => handleChooseHand('scissors')}
                disabled={ isGameStart === "playing" }
                className={`${selectedHand === 'scissors' ? 'bg-red-300' : ''} flex justify-center items-center w-[100px] h-[100px] max-md:w-[80px] max-md:h-[80px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none`}>
                <Image 
                  src="/images/scissors.png"
                  alt=""
                  width={64}
                  height={85}
                  priority={false}
                  className="w-[50px] h-auto max-md:w-[30px]"
                />
              </button>
              <button 
                onClick={() => handleChooseHand('paper')}
                disabled={ isGameStart === "playing" }
                className={`${selectedHand === 'paper' ? 'bg-red-300' : ''} flex justify-center items-center w-[100px] h-[100px] max-md:w-[80px] max-md:h-[80px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none`}>
                <Image 
                  src="/images/paper.png"
                  alt=""
                  width={64}
                  height={68}
                  priority={false}
                  className="w-[50px] h-auto max-md:w-[30px]"
                />
              </button>
            </div>
            {isOwner 
              ? 
              (
                <div className="flex justify-center w-full">
                  {isGameStart === "playing"
                    ? 
                    (
                      <div>
                        <button
                          onClick={ handleGameReset }  
                          className="flex justify-center items-center w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] border border-font-color rounded-full relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none">
                            Reset
                        </button>
                      </div>
                      )
                    : 
                    (
                      <div>
                        {isAllReady
                          ? 
                          (
                            <button 
                              onClick={ handleGameStart }  
                              className="flex justify-center items-center w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] border border-font-color rounded-full relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none">
                                Start
                            </button>
                          )
                          :
                          (
                            <button 
                              onClick={ handleGameStart } 
                              disabled
                              className="flex justify-center items-center w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] border border-font-color rounded-full bg-gray-200">
                                Start
                            </button>
                          )
                        }
                      </div>
                    )
                  }
              </div>
              )
              : 
              (<div></div>)
            }
            <div className="flex justify-start gap-[10px] m-10 max-md:flex-col-reverse max-md:mx-2">
              {isOwner 
                ? 
                (
                  <Link href="/" onClick={ () => { handleDeleteGroup() }} className="border-2 border-font-color p-2 text-center bg-red-300">グループ削除</Link>
                )
                : (<div></div>)
              }
              <Link href="/" onClick={() => { handleLeaveGroup() }} className="border-2 border-font-color p-2 text-center">退室</Link>
              {isGameStart === "waiting"
                ?
                (
                  <button onClick={ handleReJoin } className="border-2 border-font-color p-2 text-center">再入室</button>
                )
                :
                (<div></div>)
              }
            </div>
          </div>
          )
        }
      </div>
    </ProtectGroupRoute>
  )
}

export default GroupPage