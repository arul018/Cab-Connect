//usestate-->
//oru variable oda data va static ah illama dynamic ah oru function ah call panni change pannanum na usestate venum

//useEffect--->
// //The useEffect Hook allows you to perform side effects in your component like set timeout,set interval ,api fetch
// //rendering easy ah nadakum and app fast ah irukum useeffect use panna
// //it runs after rendering so rendering becomes fast and clean
//use efffect guaranteed to run  once when component mounts no matter whether u give dependency or not[]
// The use-effect will mount once mandatorly when component runs...like alert with "the data is "+null and also when i click button called show data ...in 2 seconds it want to show the alert with data-->alert("the data is arul"), right...i have one doubt...it like when we use use-effect the other functions have no need to wait for 2 seconds...right...the other methods do their work ...and after 2 seconds the data is shown...right or wrong...
//because useeffect with setTimout is asynchronous


import React, { useEffect } from 'react';

const Learning=()=> {
  // useEffect runs once when the component mounts
  useEffect(() => {
    setTimeout(() => {
      alert("The data is " + null);
    },2000);
  }, []);

  // Button click triggers another alert after 2 seconds
  const handleClick = () => {
    setTimeout(() => {
      alert("The data is arul");
    }, 2000);
  };

  return (
    <div>
      <h1>Hello React</h1>
      <button onClick={handleClick}>Show Data</button>
    </div>
  );
}

export default Learning;






//useRef-->
//use ref is like a invisible pocket/box where u can store any value like text, number or dom element
//mostly used to access the dom elements
//even if the value changes react will not rerender the component



//useref example :

// import { useRef } from 'react'
// const Learning = () => {
//     const box= useRef(null);
//     const handleFocus=()=>{
//         box.current.focus();
//     }
//   return (
//     <div>
//         <input ref={box} placeholder='type here'></input>
//         <button onClick={handleFocus}>focus</button>
//     </div>
//   )
// }

// export default Learning


//usestate vs useRef :

// import React, { useState ,useRef} from 'react'

// const Learning = () => {
// const count1=useRef(0);
// const[count,setCount]=useState(0);//usestate

//     const handleAdd=()=>{
//         setCount(count+1);

//     }
//     const handleAdd1=()=>{
//         count1.current=count1.current+1;
//         console.log(count1.current);
//     }

//   return (
//     <div>
//         <p>{count}</p>
//         <p>{count1.current}</p>
//         <button onClick={handleAdd}>click me to add to show use state</button>
//         <br/>
//           <br/>
//             <br/>
//          <button onClick={handleAdd1}>click me to add to show useref</button>
//     </div>
//   )
// }

// export default Learning


// import React from 'react'
// import { useState,useEffect } from 'react';
// const Learning = () => {
//   const [count,setCount]=useState(0);
//   const[msg,setMsg]=useState('');
  
//    /////////////////
   
//    const change=()=>{
//     setCount(count+1);
//    }


//   useEffect(() => {
//     setTimeout(() => {
//       setMsg(`My count is ${count}`);
//     }, 5000);
//   }, [count])

  

//   return (
//     <div>
//       <h1>{msg}</h1>
//       <button onClick={change}>Increment</button>

//     </div>
//   )
// }

// export default Learning
