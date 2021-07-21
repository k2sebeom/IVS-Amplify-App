import React from "react"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { Auth } from 'aws-amplify'

function LiveStream({streamKey}) {
  return (
    <h2>key: {streamKey}</h2>
  )
}

class App extends React.Component {
  state = {
    streams: [
      "qweqweqw", "Qweqwdda", "afgdsfadfa", "saOokokoaaaaa", "stream/-key"
    ]
  }

  async printToken() {
    const session = await Auth.currentSession();
    console.log(session.getIdToken().getJwtToken()); 
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
	<AmplifySignOut />
      </div>
    );
  }
}

export default withAuthenticator(App);
