import React from "react"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify'
import './App.css'

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

class App extends React.Component {
  state = {
    streams: [
      "qweqweqw", "Qweqwdda", "afgdsfadfa", "saOokokoaaaaa"
    ],
    buttonState: 0
  }

  async printToken() {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();

    var headers = new Headers()
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    var raw = JSON.stringify({"firstName": "Jake", "lastName": "Peralta"});
    var options = {
      method: "POST",
      headers: headers,
      body: raw,
      redirect: "follow"
    }
    let resp = await fetch("https://qqmwyopbu9.execute-api.us-west-2.amazonaws.com/dev", options);
    let text = await resp.text();
    let obj = JSON.parse(text).body;
    console.log(obj.channels);
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
        
	      {/* <button onClick={this.printToken}>Token</button> */}
	      <AmplifySignOut />
      </div>
    );
  }
}

export default withAuthenticator(App);
