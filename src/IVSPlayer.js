import React, {useEffect, useRef} from 'react';


function AWSIVSPlayer({url, onMetadata}) {
    const divEl = useRef(null);
    const videoEl = useRef(null);

    useEffect(() => {

            const script = document.createElement('script');

            script.src = 'https://player.live-video.net/1.3.1/amazon-ivs-player.min.js';
            script.async = true;

            document.body.appendChild(script);

            script.onload = () => {
                // eslint-disable-next-line no-undef
                if (IVSPlayer.isPlayerSupported) {
                    // eslint-disable-next-line no-undef
                    const player = IVSPlayer.create();
                    // eslint-disable-next-line no-undef
                    player.addEventListener(IVSPlayer.PlayerEventType.TEXT_METADATA_CUE, (cue) => {
                        onMetadata(cue);
                    })
                    player.attachHTMLVideoElement(document.getElementById('video-player'));
                    player.load(url);
                    player.play();
                }
            }

            return () => {
                document.body.removeChild(script);
            }

        },
        []
    )

    return (
        <div ref={divEl}>
            <video
                id="video-player"
                ref={videoEl}
                playsInline
                autoPlay
                height={300}
                controls={true}
            />
        </div>
    );
}

export default AWSIVSPlayer;