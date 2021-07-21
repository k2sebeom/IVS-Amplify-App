import React from "react"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify'

function LiveStream({streamKey}) {
  return (
    <h2>key: {streamKey}</h2>
  )
}

class App extends React.Component {
  state = {
    streams: [
      "qweqweqw", "Qweqwdda", "afgdsfadfa", "saOokokoaaaaa"
    ]
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

  render() {
    const streams = this.state.streams;
    return (
      <div>
        <h1>Hello World</h1>
        {streams.map(sKey => {
          return <LiveStream streamKey={sKey} key={sKey}/>
        })}
	<button onClick={this.printToken}>Token</button>
	<AmplifySignOut/>
      </div>
    );
  }
}

export default withAuthenticator(App);
