import { useState, useEffect, React} from 'react';
import Winwheel from 'javascript-winwheel-react'
import { Modal, Button, Container, Row, Col } from 'react-bootstrap'

function App() {
  const [theWheel, setTheWheel] = useState({})
  const [wheelContents, setWheelContents] = useState([])
  const [wheelColors, setWheelColors] = useState(["#eae56f", "#89f26e", "#7de6ef", "#e7706f", "#CC5500"])
  const [wheelReadyToSpin, setWheelReadyToSpin] = useState(true)
  const [names, setNames] = useState('')
  const [winner, setWinner] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [bgName, setBgName] = useState('')
  const [show, setShow] = useState(false)
  const [clipboardIndicator, setClipboardIndicator] = useState({})

  const handleNameChange = async e => {
    await populateWheel(e.target.value)
  }

  const handleSessionNameChange = async e => {
    setSessionName(e.target.value)
  }

  const copySessionInfo = async e => {
    await updateNames();
    await navigator.clipboard.writeText(`${window.location.origin}?session=${sessionName}`)
    await clipboardIndicator.classList.add('green')
    setTimeout(() => {
      clipboardIndicator.classList.remove('green');
    }, 5000)
  }

  function alertWinner(indicatedSegment) {
    if (!wheelReadyToSpin && indicatedSegment?.text.length > 0) {
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
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array
  }

  function changeBackgroundEvent(e) {
    changeBackground(e.target.value)
  }

  function changeBackground(name) {
    var bgName = ''

    switch (name) {
      case 'HAWF':
        bgName = 'canvas-bg-hawf'
        setWheelColors(["#eae56f", "#89f26e", "#7de6ef", "#e7706f", "#CC5500"])
        break;
      case 'Naevia':
          bgName = 'canvas-bg-naevia'
          setWheelColors(["#5f5dbc", "#e87722", "#002f87", "#e7706f"])
          break;
      case 'DustyDan':
        bgName = 'canvas-bg-dustydan'
        setWheelColors(["#eae56f", "#89f26e", "#7de6ef", "#e7706f", "#CC5500"])
        break;
      case 'DD':
        bgName = 'canvas-bg-dd'
        setWheelColors(["#eae56f", "#89f26e", "#7de6ef", "#e7706f", "#CC5500"])
        break;
      default:
        bgName = localStorage.getItem('bgName')
        setWheelColors(["#eae56f", "#89f26e", "#7de6ef", "#e7706f", "#CC5500"])
        break;
    }

    setBgName(bgName)
    localStorage.setItem('bgName', name)
  }

  async function populateWheel(wheelNameString) {
    var colorNumber = 0
    var splitNames = wheelNameString.split('\n')
    if (splitNames?.length === 0 || splitNames[0] === '') { return }

    var wheelNames = []
    for (var i = 0; i < splitNames.length; i++) {
      if (!splitNames[i]) { continue }
      var fontSize = 18
      if (splitNames.length >= 30)
      {
        fontSize = 8
      }
      else if (splitNames.length >= 14)
      {
        fontSize = 12
      }
      wheelNames.push({'fillStyle' : wheelColors[colorNumber], 'text' : splitNames[i], 'textFontSize': fontSize})
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
    setSessionName(sessionId)
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
    changeBackground(localStorage.getItem('bgName'))
  }, [sessionName])
  /* eslint-disable */
  
  return <Container fluid>
    <Row className='align-items-center'>
      <Col className="thewheel col-sm-12 col-md-12 col-lg-9">
        <div id="winwheel" className="mx-auto" onClick={spinWheel}>
          <Winwheel
            width='800'
            height='900'
            className={`offset-lg-2 ${bgName}`}
            outerRadius='400'
            innerRadius='200'
            segments={wheelContents}
            textalignment='center'
            animation={{
                'type'     : 'spinToStop',
                'duration' : 6,
                'spins'    : 10,
                'callbackFinished': alertWinner
            }}
            ref={setTheWheel}
            style={{backgroundImage: `url(${bgName})`}}
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
      <Col lg={3} sm={12} md={12}>
        <Row className="justify-content-md-center">
          <Col lg={4} md={12} sm={12}>
            <button className="form-control btn btn-dark" onClick={spinWheel}>Spin</button>
          </Col>
          <Col lg={4} md={12} sm={12}>
            <button className="form-control btn btn-dark" onClick={randomizeNames}>Random</button>
          </Col>
          <Col lg={4} md={12} sm={12}>
            <button className="form-control btn btn-dark" onClick={updateNames}>Save</button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col className="padding-2">
            <select className="form-control bg-dark bg-gradient text-light" onChange={changeBackgroundEvent}>
              <option value="DD" selected={bgName == 'canvas-bg-dd'}>Drifting Drams</option>
              <option value="DustyDan" selected={bgName == 'canvas-bg-dustydan'}>Dusty Dan</option>
              <option value="HAWF" selected={bgName == 'canvas-bg-hawf'}>Hello Again Whiskey Friends</option>
              <option value="Naevia" selected={bgName == 'canvas-bg-naevia'}>Naevia</option>
            </select>
          </Col>
        </Row>
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
        </Row>
      </Col>
    </Row>
    <Row></Row>
    <Modal show={show} onHide={closeOnly}>
      <Modal.Header closeButton>
        <Modal.Title>Winner</Modal.Title>
      </Modal.Header>
      <Modal.Body><h2>Congratulations, {winner}!</h2></Modal.Body>
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
