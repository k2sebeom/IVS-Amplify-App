import React from "react"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'

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

  render() {
    const streams = this.state.streams;
    return (
      <div>
        <h1>Hello World</h1>
        {streams.map(sKey => {
          return <LiveStream streamKey={sKey} key={sKey}/>
        })}
	<AmplifySignOut />
      </div>
    );
  }
}

export default withAuthenticator(App);
