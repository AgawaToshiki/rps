"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';

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
        const statusDocRef = query(collection(db, "groups"), where("groupId", "==", params.id))
        onSnapshot(statusDocRef, (querySnapshot) => {
          querySnapshot.docs.forEach((doc) => {
            const gameStatus: string = doc.data().status
            const groupName: string = doc.data().groupName
            setGroupName(groupName)
            setGameStart(gameStatus)
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
      setAllReady(false)
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
        setWinner(doc.data().winnerHand)
      })
    })
  }, [isGameStart, params.id])


  const winnerRps = (choices: string[]): string => {
    const allChoiceRock = choices.every((hand) => {
      return hand === "rock"
    })
    const allChoicePaper = choices.every((hand) => {
      return hand === "paper"
    })
    const allChoiceScissors = choices.every((hand) => {
      return hand === "scissors"
    })
    //全ての手が同じ場合はドロー:trueを返す
    const drawFlag = allChoiceRock || allChoicePaper || allChoiceScissors

    const rock = choices.includes("rock");
    const paper = choices.includes("paper");
    const scissors = choices.includes("scissors");
    //全ての種類の手が場に出ている場合はドロー:trueを返す
    const drawFlag2 = rock && paper && scissors

    //引き分けパターンを除いた残りの勝ちパターン
    if(!drawFlag && !drawFlag2){
      if(!rock && paper && scissors){
        return "scissors"
      } else if (!paper && rock && scissors){
        return "rock"
      } else if (!scissors && rock && paper){
        return "paper"
      } else {
        return "draw"
      }
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
        console.log("メンバーが見つかりません。")
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
      const docRef = doc(db, "groups", params.id, "members", auth.currentUser.uid);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        await deleteDoc(docRef);
      }
    }
  }

  const handleDeleteGroup = async() => {
    if(params.id){
      const groupDocRef = doc(db, "groups", params.id);
      const memberDocRef = collection(db, "groups", params.id, "members");
      const querySnapshot = await getDocs(memberDocRef);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      deleteDoc(groupDocRef);
    }
  }

  return (
    <div>
      <p className="flex justify-center w-full py-10 text-lg">グループ名:{ groupName }</p>
      {winner === selectedHand 
        ? (<p className="flex justify-center w-full py-10 text-lg bg-yellow-100">Win!!!</p>)
        : winner === "draw" 
         ? <p className="flex justify-center w-full py-10 text-lg bg-gray-100">Draw</p> 
         : winner === "no Hand"
          ? <p></p>
          : <p className="flex justify-center w-full py-10 text-lg bg-blue-100">Lose...</p>
      }
      <div className="m-10">
        <div className="flex max-w-[1920px] w-full">
          <p className="flex w-[50%]">参加者</p>
          <p className="flex w-[50%]">じゃんけん</p>
        </div>
        { getMember.map((member) => (
          <div key={ member.userId } className="flex w-full">
            <div className="flex justify-center items-center bg-pink-200 w-[50%] h-[80px] p-2 mb-2" >
              <p>{ member.displayName }</p>
            </div>
            <div className="flex justify-center items-center bg-pink-200 w-[50%] h-[80px] p-2">
              {isGameStart === "playing"
                ? (<div>
                  {member.choice
                    ? (<Image 
                          src={`/images/${member.choice}.png`}
                          alt=""
                          width={100}
                          height={100}
                          priority={false}
                          className="w-[40px] h-auto"
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
          className={`${selectedHand === 'rock' ? 'bg-red-300' : ''} flex justify-center items-center w-[100px] h-[100px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none`}>
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
          className={`${selectedHand === 'scissors' ? 'bg-red-300' : ''} flex justify-center items-center w-[100px] h-[100px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none`}>
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
          className={`${selectedHand === 'paper' ? 'bg-red-300' : ''} flex justify-center items-center w-[100px] h-[100px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none`}>
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
              onClick={ handleGameReset }  
              className="flex justify-center items-center w-[200px] h-[200px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none">
                Reset
            </button>
            )
          : 
          (
            <button 
              onClick={ handleGameStart } 
              disabled={ !isAllReady } 
              className="flex justify-center items-center w-[200px] h-[200px] border border-font-color rounded-full disabled:bg-gray-200 relative top-0 transition-all duration-200 ease-out hover:-top-[3px] hover:shadow-lg active:top-0 active:shadow-none">
                Start
            </button>
          )
        }
      </div>
      <div className="flex justify-start gap-[10px] m-10 max-md:flex-col-reverse">
        <Link href="/" onClick={() => { handleLeaveGroup() }} className="border-2 border-font-color p-2 text-center">退室</Link>
        <Link href="/" onClick={ () => { handleDeleteGroup() }} className="border-2 border-font-color p-2 text-center">グループ削除</Link>
      </div>
    </div>
  )
}

export default GroupPage