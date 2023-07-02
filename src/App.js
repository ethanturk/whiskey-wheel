import React from 'react';
import { useState, useEffect  } from "react";
import Winwheel from 'javascript-winwheel-react'
import { Modal, Button, Container, Row, Col } from 'react-bootstrap'

function App() {
  const [theWheel, setTheWheel] = useState({})
  const [wheelContents, setWheelContents] = useState([])
  const [wheelReadyToSpin, setWheelReadyToSpin] = useState(true)
  const [names, setNames] = useState('')
  const [winner, setWinner] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [show, setShow] = useState(false)
  const [clipboardIndicator, setClipboardIndicator] = useState({})
  const wheelColors = ["#eae56f", "#89f26e", "#7de6ef", "#e7706f", "#CC5500"]

  const handleNameChange = async e => {
    await populateWheel(e.target.value)
  }

  const handleSessionNameChange = async e => {
    setSessionName(e.target.value)
  }

  const copySessionInfo = async e => {
    await navigator.clipboard.writeText(`${window.location.origin}?session=${sessionName}`)
    await clipboardIndicator.classList.add('green')
    setTimeout(() => {
      clipboardIndicator.classList.remove('green');
    }, 5000)
  }

  function alertWinner(indicatedSegment) {
    if (!wheelReadyToSpin && indicatedSegment.text.length > 0) {
      setWinner(indicatedSegment.text)
      setShow(true)
    }
  }

  function spinWheel(override) {
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
    await populateWheel(newOrder)
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

  async function randomizeNames() {
    var nameArray = names.split('\n')
    nameArray = shuffleArray(nameArray)
    var newOrder = nameArray.join('\n')
    setNames(newOrder)
    await populateWheel(newOrder)
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

  async function populateWheel(wheelNameString) {
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
    await fetch(`${window.location.origin}/api/UpdateNames`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({names: names, partitionKey: sessionName, rowKey: sessionName})
    }).then(async (response) => {
      var responseText = await response.text()
      setSessionName(responseText)
    })
  }

  function getSessionNameFromQuery() {
    const queryParams = new URLSearchParams(window.location.search)
    var sessionId = queryParams.get("session")
    if (!sessionId || sessionId === '') { return }
    setSessionName(queryParams.get("session"))
  }

  /* eslint-disable */
  useEffect(() => {
    if (!sessionName || sessionName == '') { getSessionNameFromQuery() }
    async function fetchData() {
      await fetch(`${window.location.origin}/api/GetNames?sessionName=${sessionName}`)
        .then(async (ns) => {
          var localNames = await ns.text()
          localNames = localNames.replaceAll('\\n','\n')
          await populateWheel(localNames)
        })
      }
    fetchData()
  }, [sessionName])
  /* eslint-disable */
  
  return <Container>
    <Row className='align-items-center'>
      <Col className="thewheel col-sm-8">
        <div style={{width: 550}} onClick={spinWheel}>
          <Winwheel
            width='550'
            height='600'
            outerRadius='257'
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
        <br />
        <label className="text-light">Session Name: </label>
        <div className="input-group mb-3">
          <input 
            type="text"
            label="Session Name"
            className="form-control bg-dark bg-gradient text-light" 
            title="Session Name"
            value={sessionName}
            onChange={handleSessionNameChange} />
          <button className="form-control btn btn-dark" onClick={copySessionInfo}>Copy Link</button>
          <div className="input-group-append">
            <span 
              className="input-group-text" 
              id="basic-addon2">
                <i className="bi bi-clipboard-check-fill" ref={setClipboardIndicator}></i>
              </span>
          </div>
        </div>
      </Col>
      <Col className="thewheel col-sm-4">
        <Row>
          <textarea 
            title="Names" 
            placeholder="Names" 
            name="namesBox" 
            className="form-control align-middle bg-dark bg-gradient text-light" 
            rows={16}
            value={names}
            onChange={handleNameChange} 
            />
          <Col className="col-sm-2"></Col>
          <Col className="col-sm-8">
            <br />
            <button className="form-control btn btn-dark" onClick={spinWheel}>Spin the Wheel</button>
            <button className="form-control btn btn-dark" onClick={randomizeNames}>Randomize List</button>
            <button className="form-control btn btn-dark" onClick={updateNames}>Save List</button>
          </Col>
          <Col className="col-sm-2"></Col>
        </Row>
      </Col>
    </Row>
    <Row></Row>
    <Modal show={show} onHide={closeOnly}>
      <Modal.Header closeButton>
        <Modal.Title>Winner</Modal.Title>
      </Modal.Header>
      <Modal.Body>Congratulations, {winner}!</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={closeAndRemove}>
          Remove Entry
        </Button>
        <Button variant="primary" onClick={closeAndRemoveAndSpin}>
          Remove Entry and Spin Again
        </Button>
        <Button variant="secondary" onClick={closeOnly}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </Container>;
}

export default App;
