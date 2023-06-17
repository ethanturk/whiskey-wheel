import React from 'react';
import { useState, useEffect  } from "react";
import Winwheel from 'javascript-winwheel-react'

function App() {
  const [theWheel, setTheWheel] = useState();
  const [wheelContents, setWheelContents] = useState();

  var goOnce = ""

  function alertWinner(indicatedSegment) {
    alert("You have won " + indicatedSegment.text);
  }

  useEffect(() => {
    var colors = ["#eae56f", "#89f26e", "#7de6ef", "#e7706f"]

    async function fetchData() {
      await fetch(`${window.location.origin}/api/GetNames?sessionName=Session1`)
        .then(async (ns) => {
          var names = await ns.json()
          var wheelContents = []
          var colorNumber = 0
          names.sort((a, b) => a.Order > b.Order ? 1 : -1)
          for (var i = 0; i < names.length; i++) {
            wheelContents.push({'fillStyle' : colors[colorNumber], 'text' : names[i].RowKey})
            if (colorNumber === 3) { colorNumber = 0 }
            colorNumber++
          };
          setWheelContents(wheelContents)
        })
    }
    fetchData()
  }, [goOnce])
  
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
    <div>
      <textarea name="names" rows={10} cols={40}></textarea>
    </div>
  </div>;
}

export default App;
