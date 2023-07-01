import React from 'react';
import { useState, useEffect  } from "react";
import Winwheel from 'javascript-winwheel-react'
import { Modal, Button } from 'react-bootstrap'

function App() {
  const [theWheel, setTheWheel] = useState({})
  const [wheelContents, setWheelContents] = useState([])
  const [wheelReadyToSpin, setWheelReadyToSpin] = useState(true)
  const [names, setNames] = useState('')
  const [winner, setWinner] = useState('')
  const [show, setShow] = useState(false)
  const wheelColors = ["#eae56f", "#89f26e", "#7de6ef", "#e7706f"]

  const handleNameChange = e => {
    populateWheel(e.target.value)
  }

  function alertWinner(indicatedSegment) {
    if (!wheelReadyToSpin && indicatedSegment.text.length > 0) {
      setWinner(indicatedSegment.text)
      setShow(true)
    }
  }

  function spinWheel(override) {
    console.log(wheelReadyToSpin)
    if (wheelReadyToSpin || override === true) {
      theWheel.spin()
      setWheelReadyToSpin(false)
    }
  }

  function closeOnly() {
    setShow(false)
    setWheelReadyToSpin(true)
  }

  async function removeName() {
    var nameArray = names.split('\n')
    for (var i = 0; i < nameArray.length; i++) {
      if (nameArray[i] === winner) {
        nameArray.splice(i, 1)
        break
      }
    }
    var newOrder = nameArray.join('\n')
    setNames(newOrder)
    populateWheel(newOrder)
  }

  async function closeAndRemove() {
    await removeName()
    setShow(false)
    setWheelReadyToSpin(true)
  }

  async function closeAndRemoveAndSpin() {
    removeName().then(() => {
      setShow(false)
      setWheelReadyToSpin(true)
      spinWheel(true)
    })
  }

  function randomizeNames() {
    var nameArray = names.split('\n')
    nameArray = shuffleArray(nameArray)
    var newOrder = nameArray.join('\n')
    setNames(newOrder)
    populateWheel(newOrder)
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

  async function updateNames() {
    var sessionName = getSessionName()
    await fetch(`${window.location.origin}/api/UpdateNames`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({names: names, partitionKey: sessionName, rowKey: sessionName})
    })
  }

  function getSessionName() {
    const queryParams = new URLSearchParams(window.location.search)
    return queryParams.get("session")
  }

  /* eslint-disable */
  useEffect(() => {
    async function fetchData() {
      var sessionName = getSessionName()
      await fetch(`${window.location.origin}/api/GetNames?sessionName=${sessionName}`)
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
      <div className="thewheel col" onClick={spinWheel}>
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
          <button className="form-control" onClick={updateNames}>Update</button>
        </span>
      </div>
    </div>
    <div className="row">
    </div>
    <Modal show={show} onHide={closeOnly}>
      <Modal.Header closeButton>
        <Modal.Title>Winner</Modal.Title>
      </Modal.Header>
      <Modal.Body>Winner is {winner}!</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeOnly}>
          Close
        </Button>
        <Button variant="primary" onClick={closeAndRemove}>
          Remove Entry
        </Button>
        <Button variant="primary" onClick={closeAndRemoveAndSpin}>
          Remove Entry and Spin Again
        </Button>
      </Modal.Footer>
    </Modal>
  </div>;
}

export default App;
