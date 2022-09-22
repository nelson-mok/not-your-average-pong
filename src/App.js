import './App.css';
import React, { useEffect } from 'react';
import {useState,useRef} from 'react';
import './script.js'

function useMouse(){
    const [mousePos, setMousePos] = useState({
    x: null,
    y: null,
    padX: null,
    padY: null
  })

  useEffect(()=>{
    function handle(e){
      setMousePos({
        x: e.pageX,
        y: e.pageY,
      })
    }
    document.addEventListener("mousemove",handle)
    return()=>document.removeEventListener("mousemove",handle)
  })
  return mousePos;
}




function App() {
  const [windowSize, setWindowSize] = useState(getWindowSize());

  var padLength = Math.round(0.1*windowSize.innerHeight);
  var ballSize = Math.round(0.02*windowSize.innerHeight);
  var leftLimit = Math.round(0.025*windowSize.innerWidth);
  var rightLimit = Math.round(0.665*windowSize.innerWidth);
  var screenLength = Math.round(0.70*windowSize.innerHeight);
  var screenWidth = Math.round(0.70*windowSize.innerWidth);

  let ballInterval = null;
  const player = useRef();
  const bot = useRef();
  const splitTest  = useRef();
  const { x, y } = useMouse();
  const [gameStart,setGameStart] = useState(false);
  const [ballPos,setBallPos] = useState({x:Math.round(screenWidth/2-ballSize/2), y:Math.round(screenLength/2-ballSize/2), xdir: 1, ydir: 1})
  const [botPos,setBotPos] = useState({y:300})
  const [playerX, setPlayerX] = useState();
  const [playerY, setPlayerY] = useState();
  const [split,setSplit] = useState(true);
  const [splitPos,setSplitPos] = useState({x:ballPos.x,y:ballPos.y,xdir:ballPos.xdir,ydir:ballPos.ydir})
  const [counter,setCounter] = useState(1)
  const [botChance,setBotChance] = useState(50)
  const [score,setScore] = useState(0)
  const [ability,setAbility] = useState(false)
  const [ballSpeed,setBallSpeed] = useState(2)
  const [ballDeg, setBallDeg] = useState({x:1,y:1})





  //get mouse position and window size
  useEffect(() => {
    window.addEventListener("mousemove", getPlayerPosition);

    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const getPlayerPosition = () => {
    const x = player.current.offsetLeft;
    setPlayerX(x);
    const y = player.current.offsetTop;
    setPlayerY(y);
  };

  function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }

  //check user key press
  useEffect(() => {
    const keyDownHandler = event => {
      console.log('User pressed: ', event.key);
      if (event.key === 'Enter') {
        start();
      }
      if (event.key == 's'){
        splitEffect()
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  });
 
  //start/stop game
  const start = () => {
    setGameStart(!gameStart)
  };
  

  //split effect
  const splitEffect=()=>{
    setSplit(!split)
    if (split){
      splitTest.current.className='split'
    } else {
      splitTest.current.className=''
      setCounter(0)
    }
  }
  
  //bot's probability of hitting the ball, default 31, 0.8
  useEffect(()=>{
    let chance = Math.floor(Math.random()*11)/100+3
    setBotChance(chance)
    if (gameStart){
      console.log('hello')
      setScore(score+1)
      console.log(score)
    }
  },[ballDeg.x])
  
  //bot movement
  useEffect(()=>{
    if (botPos.y+padLength/2 !== ballPos.y+ballSize/2){
      let nextPos = Math.sign(ballPos.y+ballSize/2-(botPos.y+padLength/2))*botChance+botPos.y
      setBotPos({y:Math.max(0,Math.min(nextPos,screenLength-padLength))})
      //setBotPos({y:ballPos.y+60})
    }
  },[ballPos.y])


  //check if player/bot hits ball
  useEffect(()=>{
    let xdir = ballDeg.x
    let ydir = ballPos.ydir
    if (gameStart){

      //check if player hits ball
      if (ballPos.x<=leftLimit +2 && ballPos.x>=leftLimit-2){
        if (playerY+padLength>=ballPos.y+ballSize/2 && ballPos.y+ballSize/2>=playerY)
        {
          xdir = 1
          var returnAngle = (ballPos.y+ballSize/2-(playerY+padLength/2))/padLength*6
          if (ballDeg.x<0){
            setBallDeg({x:ballDeg.x*-1, y:returnAngle})
          }
/*           if (playerY+padLength>=ballPos.y+ballSize/2 && ballPos.y+ballSize/2>=playerY+padLength*3/4){
            setBallDeg(2)
          }else if(playerY+padLength*3/4>=ballPos.y+ballSize/2 && ballPos.y+ballSize/2>=playerY+padLength*1/2){
            setBallDeg(0)
          }else if(playerY+padLength*1/2>=ballPos.y+ballSize/2 && ballPos.y+ballSize/2>=playerY+padLength*1/4){
            setBallDeg(-0)
          }else {
            setBallDeg(-2)
          } */
        } else {
          console.log(playerY, ballPos.y)
          setGameStart(false)
        }
        setAbility(false)
      }

      
      //check if bot hits ball
      if (ballPos.x<=rightLimit +2 && ballPos.x>=rightLimit-2){
          if (botPos.y+padLength>=ballPos.y+ballSize/2 && ballPos.y+ballSize/2>=botPos.y){
            xdir = -1
            var returnAngle = (ballPos.y+ballSize/2-(botPos.y+padLength/2))/padLength*6
            if (ballDeg.x>0){
              setBallDeg({x:ballDeg.x*-1, y:returnAngle})
            }
/*             if (botPos.y+padLength>=ballPos.y+ballSize/2 && ballPos.y+ballSize/2>=botPos.y+padLength/2){
              setBallDeg(0)
            } else {
              setBallDeg(-0)
            } */
          } else {
            console.log(playerY, ballPos.y)
            setGameStart(false)
          }
          setAbility(false)
      }

      //change ball y-direction when it hits upper/bottom boundaries
      if (ballPos.y<=0 && ballDeg.y<0){
        setBallDeg({x:ballDeg.x, y:-1*ballDeg.y})
      } else if (ballPos.y>=screenLength-ballSize && ballDeg.y>0){
        setBallDeg({x:ballDeg.x, y:-1*ballDeg.y})
      }

      //ball movement
      ballInterval = setInterval(()=>{
        setBallPos({x: ballPos.x+ballDeg.x,y:ballPos.y+ballDeg.y, xdir: xdir, ydir: ballDeg.y})

        //split ability
        if (split && counter<150){
          splitTest.current.className='split'
          setSplitPos({x: ballPos.x+ballDeg.x,y:ballPos.y+ballDeg+counter, xdir: xdir, ydir: ballDeg.y})
          setCounter(counter+1)
        } else {
          setSplit(false)
          splitTest.current.className=''
        }
      },2)

      
      return ()=>clearInterval(ballInterval);
    }
  })

  const testAbility = () =>{
    return(<div id='ability' style={{
      position:'absolute',
      backgroundColor: "red",
      left: screenWidth/2-0.05*screenLength/2,
      top: screenLength/2-0.05*screenLength/2,
      width: 0.05*screenLength,
      height: 0.05*screenLength
      }}></div>)
  }



  useEffect(()=>{
    if(document.getElementById("ability") && gameStart){
      if ((ballPos.y>=screenLength/2-0.05*screenLength && ballPos.y<=screenLength/2+0.05*screenLength)&&
      (ballPos.x>=screenWidth/2-0.05*screenLength && ballPos.x<=screenWidth/2+0.05*screenLength/2)){
        setAbility(true)
      }


    }
  })

  //double speed ability
  useEffect(()=>{
    if (gameStart && ability){
      console.log(ability)
      setBallDeg({x:ballDeg.x*2,y:ballDeg.y*2})
    } else{
      setBallDeg({x:ballDeg.x/ballDeg.x*2,y:ballDeg.y})
    }
  },[ability])

  return (
    <div>
      <div id='gameWindow' className="App"  style={{position:'relative'}}>
          <div id='pad' ref={player}
          style={{
            position:'absolute',
            top: Math.min(Math.max(0,y),screenLength-padLength)
            }}></div>

          <div id='botPad' ref={bot}
          style={{
            position:'absolute',
            top: Math.min(Math.max(0,botPos.y),screenLength-padLength)
            }}></div>

          <div id='ball' style={{
            position:'absolute',
            left: ballPos.x,
            top: ballPos.y
            }}></div>
          
            <div>{
            
            score%1==0 && score!=0?(
                testAbility()
              ):""
            
            }
            </div>
          
          <div id='split1' className='' ref={splitTest} style={{
            position:'absolute',
            left: splitPos.x,
            top: splitPos.y
            }}></div> 
      </div>
      <h3>Press Enter to start game. Refresh the page to restart after game ends</h3>
      <div>Mouse PosX:{x}, Mouse PosY:{y}</div>
      <div>Ball Pos x: {ballPos.x}, y: {ballPos.y}, {ballDeg.x}, {ballPos.ydir}</div>
      <div>Player Pos x:{playerX}, y: {playerY}</div>
      <div>Bot Pos y:{botPos.y}</div>
    </div>
  )
}

export default App;