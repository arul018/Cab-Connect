
// import React, { useState } from 'react'

// const practice = () => {
//   const [count ,setCount]=useState(0);
//   const handleClick=()=>{
//     setCount(count+1);
//   }
//   return (
//     <div>
//     <h2>{count}</h2>
//     <button style={{color:"red"}} onClick={handleClick}>click here </button>
     
//     </div>
//   )
// }

// export default practice


//use effect is a hook from react used to perform the side effects in our application...
//use effect is used whenever we want to trigger something when some piece of state changes
//we have not anythinh to dependency....it is guarentted to run atleast once on component mounting
// import { useState ,useEffect } from 'react'
// const practice = () => {
//   const [count,setCount]=useState(0);


//    useEffect(()=>{

//   //the code that we want to run

//   console.log("the count is"+count);


//  },[count]);//dependency--->what it would listen to run the code
 

//   return (
//     <div> 
//       <h2>{count}</h2>
//       <button onClick={()=>setCount(count+1)}>click here</button>
   
//     </div>
//   )
// }

// export default practice


//use effect 

// import React, { useEffect, useState } from 'react'

// const practice = () => {
//   const [count,setCount]=useState(0);

//    useEffect(()=>{
     
//    setTimeout(()=>{
// console.log("The count is "+count);
//    },1000)
     

//    },[count])
//   return (
//     <div>
//      <h2>{count}</h2>
//      <button onClick={()=>setCount(count+1)}>Click me!</button>
//     </div>
//   )
// }

// export default practice



// import React, { useRef, useSyncExternalStore } from 'react'

// const practice = () => {

//   const box=useRef(null);
//   const handleFocus=()=>{
//     box.current.focus();
     
//   }
//   return (
//     <div>
//       <input  ref={box} placeholder='Enter name '></input>
//       <button onClick={handleFocus}>focus</button>
//     </div>
//   )
// }

// export default practice


// import React, { useReducer, useState } from 'react'

// const initialState={count:0};
// //reducer is a function
// const reducer=(state,action)=>{
//   //state===>current value
//   switch(action.type)
//   {
//     case 'increment':
//     return {count:state.count+1}
//      case 'decrement':
//     return {count:state.count-1}
//      case 'reset':
//     return {count:0}
//     default:
//       return state;
//   }
  

// }
// const practice = () => {
//   const[count,setCount]=useState(0);
//   const[state,dispatch]=useReducer(reducer,initialState);
//   return (
//     <div>
//       <h2>Count :{state.count}</h2>
//       {/* //dispatch --->reducer */}
//     <button onClick={()=>dispatch({type:"increment"})}>Increment</button>
//       <button onClick={()=>dispatch({type:"decrement"})}>decrement</button>
//         <button onClick={()=>dispatch({type:"reset"})}>Reset</button>
//     </div>
//   )
// }

// export default practice

// import React from 'react'

// const practice = () => {
//     const fruits=['apple','orange','mango','banana'];
//   return (
//     <div>
//     <ul>
//         {

//             fruits.map((fruit,index)=>(
//                 <li key={index}>{fruit}</li>
//             ))
//         }
//     </ul>
//     </div>
//   )
// }

// export default practice

// import React, { useState } from 'react'

// const practice = () => {
//   const [name,setName]=useState("");
//   const handleChange=(e)=>{
//     setName(e.target.value);
//   }
//   //e is a event object that represents the event happened like onchange, click , submit
//   return (
//     <div>
//     <p>My name is : {name}</p>
//     <label>Enter name :</label>
//     <input onChange={handleChange}></input>


//     </div>
//   )
// }

// export default practice

// import React, { useState } from 'react'
// const Practice = () => {

// const[error,setError]=useState('');
// const [user,setUser]=useState({username:"",password:"", gender: "", occupation: ""});

// const handleChange=(e)=>{
// const{name,value}=e.target;
// setUser({...user,[name]:value});

// if(name==='username' && value.length<4)
// setError("name should not be less than 4 characters");
// else if (name==='password' && value.length<4)
// setError("password should not be less than 4 characters");
// else 
// setError("");
// }

// const popup=()=>{

//   alert("form submitted successfully");
// }
//   return (
//     <div>
//       <p>Welcome {user.username} , your password is {user.password}, you are a {user.gender}, and your occupation is {user.occupation}.</p>
//     <form onSubmit={popup}>
//       <label>username</label>
//       <input type='text' name='username' placeholder='Enter here'onChange={handleChange}/>

//       <label>password</label>
//       <input type='password' name='password' placeholder='Enter here'onChange={handleChange}/>

//       <label>Gender:</label>
//       <input type="radio" name="gender" value="male" onChange={handleChange} checked={user.gender === 'male'} /> Male
//       <input type="radio" name="gender" value="female" onChange={handleChange} checked={user.gender === 'female'} /> Female

//       <label>Occupation:</label>
//       <select name="occupation" value={user.occupation} onChange={handleChange}>
//         <option value="">--Please choose an option--</option>
//         <option value="student">Student</option>
//         <option value="engineer">Engineer</option>
//         <option value="doctor">Doctor</option>
//       </select>

//       <button type='submit'>Submit</button>
//       <p style={{color:"red"}}>{error}</p>

//     </form>
   

//     </div>
//   )
// }

// export default Practice


import React, { useState } from 'react'

const Practice = () => {
const[user,setUser]=useState({username:"",password:"", gender: "", occupation: ""});
const[error,setError]=useState("");

const handleChange=(e)=>{
  const{name,value}=e.target;
  setUser(prevUser => ({...prevUser, [name]:value}));

   if(name==='username') {
     if (value.length > 5) {
        setError("username cannot exceed more than 5 characters");
     } else {
        setError("");
     }
   }
}
  return (
    <div>
      <p>My name is {user.username} and my password is {user.password}. I am a {user.gender} and work as an {user.occupation}.</p>
      <form>
        <label>Username:</label>
        <input type='text' placeholder='enter here' name='username' onChange={handleChange}></input>
        <label>password:</label>
        <input type='password'placeholder='enter here' name='password' onChange={handleChange}></input>
        <br />
        <label>Gender:</label>
        <input type="radio" name="gender" value="male" onChange={handleChange} checked={user.gender === 'male'} /> Male
        <input type="radio" name="gender" value="female" onChange={handleChange} checked={user.gender === 'female'} /> Female
        <br />
        <label>Occupation:</label>
        <select name="occupation" value={user.occupation} onChange={handleChange}>
          <option value="">--Please choose an option--</option>
          <option value="student">Student</option>
          <option value="engineer">Engineer</option>
          <option value="doctor">Doctor</option>
        </select>
      </form>
      <p style={{ color: 'red' }}>{error}</p>
    </div>
  )
}

export default Practice