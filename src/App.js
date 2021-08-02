import React from "react"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify'
import './App.css'
// import ReactHLS from 'react-hls'
import AWSIVSPlayer from "./IVSPlayer.js";

const apiEndPoint = "https://30u94hmapi.execute-api.us-west-2.amazonaws.com/dev"
let token = ""

async function getToken() {
  if (token.length === 0) {
    const session = await Auth.currentSession();
    token = session.getIdToken().getJwtToken();
  }
}

async function callAPI(route, params, method, onComplete) {
  await getToken()
  var headers = new Headers()
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${token}`);
  var raw = JSON.stringify(params);
  var options = {
    method: method,
    headers: headers,
    redirect: "follow"
  }
  if (method !== "GET") {
    options.body = raw;
  }

  let resp = await fetch(apiEndPoint + route, options);
  let text = await resp.text();
  onComplete();
  return JSON.parse(text)
}

function LiveStream({stream, changeState}) {
  const {ChannelTitle, StreamStatus, StreamKey, PlaybackUrl, ID, ChannelType, ChannelMode} = stream;
  if (StreamStatus.S === "active") {
    return (
      <tr align="center" className="channel-item">
        <td>{ChannelTitle.S}</td>
        <td>{StreamKey.S}</td>
        <td>{ChannelMode.S}</td>
        <td>{ChannelType.S}</td>
        <td>{StreamStatus.S}</td>
        <td><button onClick={()=>{
          changeState({url: PlaybackUrl.S, type: "stream", arn: ID.S});
        }}>Join</button></td>
      </tr>
    )
  }
  else {
    return (
      <tr align="center" className="channel-item">
        <td>{ChannelTitle.S}</td>
        <td>{StreamKey.S}</td>
        <td>{ChannelMode.S}</td>
        <td>{ChannelType.S}</td>
        <td>{StreamStatus.S}</td>
        <td></td>
      </tr>
    )
  }
}

function VODAsset({asset, changeState}) {
  const {ChannelTitle, MediaDuration, PlaybackUrl, DownloadStatus, DownloadUrl} = asset;
  return (
    <tr align="center" className="channel-item">
      <td>{ChannelTitle.S}</td>
      <td>{MediaDuration.S === "0" ? "--" : MediaDuration.S}</td>
      <td>{MediaDuration.S === "0" ? "processing" : "ready"}</td>
      <td>{MediaDuration.S === "0" ? "" : <button onClick={()=>{
        changeState({url: PlaybackUrl.S, type: "asset"});
      }}>Play</button>}</td>
      <td>{DownloadStatus.S === "ready" ? <a href={DownloadUrl.S} download>Download</a> : "processing"}</td>
    </tr>
  )
}

function StreamTable({streams, changeState}) {
  return (
    <table border="1" className="channel-container" align="center">
        <thead>
          <tr align="center" className="orange">
            <th>Channel Title</th>
            <th>Stream Key</th>
            <th>Latency</th>
            <th>Type</th>
            <th>Status</th>
            <th>Join</th>
          </tr>
        </thead>
        <tbody>
          {streams.map(stream => {
            return <LiveStream stream={stream} key={stream.StreamKey.S} changeState={changeState}/>
          })}
        </tbody>
      </table>
  )
}

function AssetTable({assets, changeState}) {
  return (
    <table border="1" className="channel-container" align="center">
        <thead>
          <tr align="center" className="orange">
            <th>Recorded Channel</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Play</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(asset => {
            return <VODAsset asset={asset} key={asset.Prefix.S} changeState={changeState}/>
          })}
        </tbody>
      </table>
  )
}

class SendQuizForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: "",
      answer: "TRUE",
      arn: props.arn
    }
    this.updateAnswer = this.updateAnswer.bind(this);
    this.updateText = this.updateText.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._text = React.createRef();
    this._select = React.createRef();
  }

  updateText(event) {
      this.setState({
          question: event.target.value,
          answer: this.state.answer,
          arn: this.state.arn
      })
  }

  updateAnswer(event) {
      this.setState({
          question: this.state.question,
          answer: event.target.value,
          arn: this.state.arn
      })
  }

  async handleSubmit(event) {
    event.preventDefault();
    let resp = await callAPI("/metadata", {
      arn: this.state.arn,
      metadata: JSON.stringify({
        text: this.state.question,
        answer: this.state.answer
      })
    }, "POST", () => {
      this._text.current.value = "";
      this._select.current.value = "TRUE";
      this.setState({
        question: "",
        answer: "TRUE"
      })
    });
    console.log(resp);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label className="orange">
          T/F Question:
          <input ref={this._text} type="text" value={this.state.question} onChange={this.updateText} />
        </label>
        <label className="orange">
          Answer
          <select ref={this._select} value={this.state.answer} onChange={this.updateAnswer}>
            <option value="TRUE">TRUE</option>
            <option value="FALSE">FALSE</option>
          </select>
        </label>
        <input className="btn-primary" type="submit" value="Post Quiz" />
      </form>
    )
  }
}

class CreateChannelForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channelName: "",
      channelType: "STANDARD",
      latencyMode: "LOW"
    }
    this.updateName = this.updateName.bind(this);
    this.updateLatency = this.updateLatency.bind(this);
    this.updateType = this.updateType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._form = React.createRef();
  }
  
  updateName(event) {
    this.setState({
      channelName: event.target.value,
      channelType: this.state.channelType,
      latencyMode: this.state.latencyMode
    })
  }

  updateType(event) {
    this.setState({
      channelName: this.state.channelName,
      channelType: event.target.value,
      latencyMode: this.state.latencyMode
    })
  }

  updateLatency(event) {
    this.setState({
      channelName: this.state.channelName,
      channelType: this.state.channelType,
      latencyMode: event.target.value
    })
  }

  async handleSubmit(event) {
    event.preventDefault();
    await callAPI("/channels", this.state, "POST", () => {
      alert(`Channel ${this.state.channelName} is created`);
      this._form.current.submit();
    });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} ref={this._form}>
        <label className="orange">
          Channel Name:
          <input type="text" value={this.state.channelName} onChange={this.updateName} />
        </label>
        <label className="orange">
          Latency Mode
          <select value={this.state.latencyMode} onChange={this.updateLatency}>
            <option value="LOW">LOW</option>
            <option value="NORMAL">NORMAL</option>
          </select>
        </label>
        <label className="orange">
          Channel Type
          <select value={this.state.channelType} onChange={this.updateType}>
            <option value="STANDARD">STANDARD</option>
            <option value="BASIC">BASIC</option>
          </select>
        </label>
        <input className="btn-primary" type="submit" value="Create Channel" />
      </form>
    )
  }
}

class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content,
      status: 0 // 0 question 1: right 2: wrong
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      content: props.content,
      status: 0
    })
  }

  render() {
    if(this.state.content == null) {
      return (
        <p></p>
      )
    }
    if(this.state.status === 0) {
      return (
        <div className="quiz-container">
          <h2 className="orange">{this.state.content.text}</h2>
          <button className="btn-secondary" onClick={() => {
            if(this.state.content.answer === "TRUE") {
              this.setState({
                content: this.state.content,
                status: 1
              })
            }
            else {
              this.setState({
                content: this.state.content,
                status: 2
              })
            }
            setTimeout(() => {
              this.setState({
                content: null,
                status: 0
              })
            }, 3000)
          }}>TRUE</button>
          <button className="btn-secondary"onClick={() => {
            if(this.state.content.answer === "FALSE") {
              this.setState({
                content: this.state.content,
                status: 1
              })
            }
            else {
              this.setState({
                content: this.state.content,
                status: 2
              })
            }
            setTimeout(() => {
              this.setState({
                content: null,
                status: 0
              })
            }, 3000)
          }}>FALSE</button>
        </div>
      )
    }
    else if(this.state.status === 1) {
      return (
        <h2 className="orange quiz-container">Congratulations!</h2>
      )
    }
    else {
      return (
        <h2 className="orange quiz-container">Wrong!!</h2>
      )
    }
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      streams: [],
      assets: [],
      buttonState: 0,
      quiz: null,
    }
    this.updateState = this.updateState.bind(this);
    this.mainWindow = this.mainWindow.bind(this);
  }

  updateState(props) {
    let temp = this.state;
    Object.keys(props).forEach((key) => {
      temp[key] = props[key];
    })
    this.setState(temp);
  }

  async loadStreams(completion) {
    let resp = await callAPI("/channels", {}, "GET", () => {});
    completion(resp.body.Items);
  }

  async loadAssets(completion) {
    let resp = await callAPI("/assets", {}, "GET", () => {});
    completion(resp.body.Items);
  }

  componentDidMount() {
    this.loadStreams((streams) => {
      this.updateState({
        streams: streams
      });
    });
    this.loadAssets((assets) => {
      this.updateState({
        assets: assets
      })
    });
  }

  componentDidUpdate() {
    if (this.state.buttonState === 0) {
      this.loadStreams((streams) => {
        this.updateState({
          streams: streams
        })
      });
    }
    else if(this.state.buttonState === 1) {
      this.loadAssets((assets) => {
        this.updateState({
          assets: assets
        });
      });
    }
  }

  upperBanner() {
    return (
      <div>
        <h1 className="orange">Interactive Video Service</h1>
        <hr></hr>
      </div>
    )
  }

  buttonSection({buttonState, onClick}) {
    return (
      <div className="center">
        <button className={buttonState === 0 ? "btn-secondary" : "btn-primary"} onClick={() => {
          onClick(0);
        }}>Channel List</button>
        <button className={buttonState === 1 ? "btn-secondary" : "btn-primary"} onClick={() => {
          onClick(1);
        }}>Assets</button>
        <button className={buttonState === 2 ? "btn-secondary" : "btn-primary"} onClick={() => {
          onClick(2);
        }}>Create Channel</button>
      </div>
    )
  }

  mainWindow({buttonState, streams, assets, changeState}) {
    if(buttonState === 0) {
      return (
        <StreamTable streams={streams} changeState={changeState}/>
      )
    }
    else if(buttonState === 1) {
      return (
        <AssetTable assets={assets} changeState={changeState}/>
      )
    }
    else if(buttonState === 2) {
      return (
        <CreateChannelForm />
      )
    }
    else {
      if (buttonState.type === "asset") {
        return (
          <div className="video-container">
            <AWSIVSPlayer url={buttonState.url} onMetadata={(cue) => {
              console.log(cue.text);
              this.updateState({
                quiz: JSON.parse(cue.text)
              });
            }} />
            <Quiz content={this.state.quiz} />
         </div>
        )
      }
      else {
        return (
          <div>
            <div className="video-container">
              <AWSIVSPlayer url={buttonState.url} onMetadata={(cue) => {
                console.log(cue.text);
                this.updateState({
                  quiz: JSON.parse(cue.text)
                });
              }} />
              <Quiz content={this.state.quiz} />
            </div>
            <br></br>
            <h3 className="orange">Streamer Tool</h3>
            <SendQuizForm arn={buttonState.arn}/>
          </div>
          // <ReactHLS url={buttonState.url} autoplay/>
        )
      }
    }
  }

  render() {
    return (
      <div>
        <this.upperBanner />
        <this.buttonSection buttonState={this.state.buttonState} onClick={(i) => {
          this.setState({
            buttonState: i,
            assets: this.state.assets,
            streams: this.state.streams
          })
        }}/>
        < this.mainWindow buttonState={this.state.buttonState} streams={this.state.streams} assets={this.state.assets}
        changeState={(i) => {
          this.setState({
            buttonState: i,
            assets: this.state.assets,
            streams: this.state.streams
          });
        }}/>
        <h3 className="orange">RTMPS Endpoint: rtmps://af69049e8f9d.global-contribute.live-video.net:443/app</h3>
	      <AmplifySignOut />
      </div>
    );
  }
}

export default withAuthenticator(App);
