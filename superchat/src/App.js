import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState,useRef } from 'react';
import './App.css'

const firebaseConfig = {
  apiKey: "AIzaSyBOyeCmRgz2FAcxP9UYZFrKG_uRxuC0CTw",
  authDomain: "chat-app-4ca8f.firebaseapp.com",
  projectId: "chat-app-4ca8f",
  storageBucket: "chat-app-4ca8f.firebasestorage.app",
  messagingSenderId: "399748758559",
  appId: "1:399748758559:web:f03666991c54f43795292a",
  measurementId: "G-S8L6NP5MZ4"
};

const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);


function App() {
  const [user] =  useAuthState(auth)
  return (
    <div className="App">
      <header className="App-header">
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section >
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn (){
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const dummy = useRef()
  const messagesRef = collection(firestore, 'messages')
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));
  const [formValue, setFormValue] = useState('')
  const [messages] = useCollectionData(messagesQuery, {idField: 'id'})

  const sendMessage = async(e)=>{
    e.preventDefault()
    const {uid, photoURL} = auth.currentUser
    console.log('current: ', auth.currentUser);
    

    await addDoc(messagesRef,{
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')
    dummy.current.scrollIntoView({behavior: 'smooth'})
  }

  return(
    <>
      <div>
        {messages && messages.map(msg=><ChatMessage key={msg.id} message={msg}/>)}
        <span ref={dummy}></span>
        <form onSubmit={sendMessage} >
          <input value={formValue} onChange={(e)=> setFormValue(e.target.value)}/>
          <button type='submit'>Send</button>
        </form>
      </div>
    </>
  )

}

function ChatMessage(props){
  const {text,uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://watchhentai.net/uploads/2022/5/succubus-stayed-life-animation/poster.jpg'} alt='img'/>
      <p>{text}</p>
    </div>
  )
}
export default App;
