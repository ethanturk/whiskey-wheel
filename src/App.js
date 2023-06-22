import React from 'react';
import { useState, useEffect  } from "react";
import Winwheel from 'javascript-winwheel-react'

function App() {
  const [theWheel, setTheWheel] = useState({})
  const [wheelContents, setWheelContents] = useState([])
  const [names, setNames] = useState([])
  const wheelColors = ["#eae56f", "#89f26e", "#7de6ef", "#e7706f"]

  var goOnce = ""

  function alertWinner(indicatedSegment) {
    alert("You have won " + indicatedSegment.text);
  }

  const handleNameChange = e => {
    console.log(e.target.value)
    setNames(mapNames(e.target.value))
  }

  function mapNames(value) {
    return value?.map(n => { return `${n?.Name}` })
  }

  useEffect(() => {

    async function fetchData() {
      await fetch(`${window.location.origin}/api/GetNames?sessionName=Session1`)
        .then(async (ns) => {
          var localNames = await ns.json()
          var wheelContents = []
          var colorNumber = 0
          setNames(localNames.sort((a, b) => a.Order > b.Order ? 1 : -1).map(n => { return n.Name }))
          for (var i = 0; i < localNames.length; i++) {
            wheelContents.push({'fillStyle' : wheelColors[colorNumber], 'text' : localNames[i].RowKey})
            if (colorNumber === wheelColors.length-1) { colorNumber = 0 }
            colorNumber++
          };
          setWheelContents(wheelContents)
        })
    }
    fetchData()
  }, [goOnce])
  
  return <div className="App container">
    <div className="row">
      <div className="thewheel col" onClick={()=>theWheel.spin()}>
        <Winwheel 
          width='440'
          height='500'
          class='column'
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
      <div className="col">
        <br />
        <textarea 
          title="Names" 
          placeholder="Names" 
          name="namesBox" 
          className="form-control align-middle" 
          rows={16}
          value={names}
          onChange={handleNameChange} 
          />
        <br />
        <span>
          <button className="form-control">Randomize</button>
          <button className="form-control">Update</button>
        </span>
      </div>
    </div>
    <div className="row">
    </div>
  </div>;
}

export default App;
