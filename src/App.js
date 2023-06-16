import React from 'react';
import { useState, useEffect  } from "react";
import Winwheel from 'javascript-winwheel-react'

function App() {
  const [theWheel, setTheWheel] = useState();
  const [names, setNames] = useState();
  const [wheelContents, setWheelContents] = useState();

  var colors = ["#eae56f", "#89f26e", "#7de6ef", "#e7706f"]

  var goOnce = ""

  useEffect(() => {
    buildWheel()
  }, [goOnce])

  function getAllNames() {
    return fetch('http://127.0.0.1:4280/api/GetNames?sessionName=Session1')
      //.then(result => { setNames(result) })
  }

  function alertWinner(indicatedSegment) {
    alert("You have won " + indicatedSegment.text);
  }

  async function buildWheel() {
    await getAllNames().then(async (ns) => {
      var names = ns.json()
      var wheelContents = []
      var colorNumber = 0
      let namesFinished = await names
      namesFinished.sort((a, b) => a.Order > b.Order ? 1 : -1)
      for (var i = 0; i < namesFinished.length; i++) {
        wheelContents.push({'fillStyle' : colors[colorNumber], 'text' : namesFinished[i].RowKey})
        if (colorNumber == 3) { colorNumber = 0 }
        colorNumber++
      };
      setWheelContents(wheelContents)
    })
  }
  
  return <div className="App">
    <div className="thewheel" width="500" onClick={()=>theWheel.spin()}>
      <Winwheel 
        width='440'
        height='500'
        outerRadius='212'
        innerRadius='75'
        segments={wheelContents}
        animation={{
            'type'     : 'spinToStop',
            'duration' : 8,
            'spins'    : 10,
            'callbackFinished': alertWinner
        }}
        pins={{
          'number'     : 24,
          'fillStyle'  : 'silver',
          'outerRadius': 4,
        }}
        ref={setTheWheel}
      ></Winwheel>
    </div>
  </div>;
}

export default App;
