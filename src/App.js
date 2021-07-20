import React from "react"

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
      </div>
    );
  }
}

export default App;
