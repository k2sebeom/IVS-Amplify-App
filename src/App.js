import React from "react"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify'
import './App.css'

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
    body: raw,
    redirect: "follow"
  }

  let resp = await fetch(apiEndPoint + route, options);
  let text = await resp.text();
  onComplete();
  return JSON.parse(text)
}

function LiveStream({streamKey}) {
  return (
    <tr align="center" className="channel-item">
      <td>1</td>
      <td>CHannel 2</td>
      <td>Owner</td>
      <td>{streamKey}</td>
      <td>active</td>
      <td><button>Join</button></td>
    </tr>
  )
}

function StreamTable({streams}) {
  return (
    <table border="1" className="channel-container" align="center">
        <thead>
          <tr align="center" className="orange">
            <th>No.</th>
            <th>Channel Title</th>
            <th>Owner</th>
            <th>Stream Key</th>
            <th>Status</th>
            <th>Join</th>
          </tr>
        </thead>
        <tbody>
          {streams.map(sKey => {
            return <LiveStream streamKey={sKey} key={sKey}/>
          })}
        </tbody>
      </table>
  )
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


class App extends React.Component {
  state = {
    streams: [
      "qweqweqw", "Qweqwdda", "afgdsfadfa", "saOokokoaaaaa"
    ],
    buttonState: 0
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
        }}>My Channels</button>
        <button className={buttonState === 2 ? "btn-secondary" : "btn-primary"} onClick={() => {
          onClick(2);
        }}>Create Channel</button>
      </div>
    )
  }

  mainWindow({buttonState, streams}) {
    if(buttonState === 0) {
      return (
        <StreamTable streams={streams} />
      )
    }
    else if(buttonState === 1) {
      return (
        <h1>Loading...</h1>
      )
    }
    else {
      return (
        <CreateChannelForm />
      )
    }
  }

  render() {
    const streams = this.state.streams;
    return (
      <div>
        <this.upperBanner />
        <this.buttonSection buttonState={this.state.buttonState} onClick={(i) => {
          this.setState({
            buttonState: i,
            streams: this.state.streams
          })
        }}/>
        < this.mainWindow buttonState={this.state.buttonState} streams={this.state.streams} />
	      <AmplifySignOut />
        <button onClick={() => {
          callAPI("/channels", {"channelName": "NewCHannel", "channelType": "STANDARD", "latencyMode": "LOW"}, "POST");
        }}>MakeCHannel</button>
      </div>
    );
  }
}

export default withAuthenticator(App);
