import { auth } from "../../firebase"
import { sendPasswordResetEmail } from "firebase/auth";

const ResetPassword = () => {
  const user = auth.currentUser
  if(user && user.email) {
    sendPasswordResetEmail(auth, user.email)
    .then(() => {
      alert("パスワードリセット用のメールを送りました。")
    })
    .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`${errorCode}:${errorMessage}`)
    });
  }

}

export default ResetPassword
