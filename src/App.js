import React from 'react';
import { useState, useEffect  } from "react";
import Winwheel from 'javascript-winwheel-react'

function App() {
  const [theWheel, setTheWheel] = useState({})
  const [wheelContents, setWheelContents] = useState([])
  const [names, setNames] = useState('')
  const wheelColors = ["#eae56f", "#89f26e", "#7de6ef", "#e7706f"]

  const handleNameChange = e => {
    populateWheel(e.target.value)
  }

  function alertWinner(indicatedSegment) {
    alert("You have won " + indicatedSegment.text)
  }

  function randomizeNames() {
    var nameArray = names.split('\n')
    nameArray = shuffleArray(nameArray)
    populateWheel(nameArray.join('\n'))
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array
  }

  function populateWheel(wheelNameString) {
    var colorNumber = 0
    var splitNames = wheelNameString.split('\n')
    if (splitNames?.length === 0 || splitNames[0] === '') { return }

    var wheelNames = []
    for (var i = 0; i < splitNames.length; i++) {
      if (!splitNames[i]) { continue }
      wheelNames.push({'fillStyle' : wheelColors[colorNumber], 'text' : splitNames[i]})
      if (colorNumber === wheelColors.length-1) { colorNumber = 0 }
      colorNumber++
    }
    
    setNames(wheelNameString)
    setWheelContents(wheelNames)
  }

  /* eslint-disable */
  useEffect(() => {
    async function fetchData() {
      await fetch(`${window.location.origin}/api/GetNames?sessionName=Session1`)
        .then(async (ns) => {
          var localNames = await ns.text()
          localNames = localNames.replaceAll('\\n','\n')
          populateWheel(localNames)
        })
      }
    fetchData()
  }, [])
  /* eslint-disable */
  
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
          <button className="form-control" onClick={randomizeNames}>Randomize</button>
          <button className="form-control" onClick={populateWheel}>Update</button>
        </span>
      </div>
    </div>
    <div className="row">
    </div>
  </div>;
}

export default App;
