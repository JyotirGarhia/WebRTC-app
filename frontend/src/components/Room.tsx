import { useEffect, useRef, useState } from "react"
import PendingRequests from "./PendingRequests"
import { useSocket } from "../hooks/useSocket"
import { localStream } from "../utils/mediaStore"

type RoomProps = {
    isHost: boolean;
    pendingRequests: PendingRequest[];
    onApprove: (userId: string) => void;
    onReject: (userId: string) => void
    onEndRoom: () => void
}

type PendingRequest = {
    userId: string,
    name: string
}

const peerConnectionConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ]
};

const Room = ({
    isHost,
    pendingRequests,
    onApprove, onReject,
    onEndRoom
}: RoomProps) => {

    // const localStreamRef = useRef<MediaStream | null>(null);
    const userId = sessionStorage.getItem("userId")!;

    const [isMicOn, setIsMicOn] = useState<boolean>(() => localStream?.getAudioTracks()[0].enabled ?? false);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(() => localStream?.getVideoTracks()[0].enabled ?? false);

    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [activeScreenUser, setActiveScreenUser] = useState<string | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    // const remoteVideoRefs = useRef<Record<string,HTMLVideoElement | null>>({});
    const screenVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});

    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const remoteStreamsRef = useRef<Record<string, MediaStream>>({});

    const screenVideoStream =
        activeScreenUser === userId
            ? screenStream
            : activeScreenUser
                ? remoteStreams[activeScreenUser]
                : null;

    const createPeerConnection = (peerId: string) => {
        const peerConnection = new RTCPeerConnection(peerConnectionConfig);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("ICE candidate found. Sending to :", peerId);

                send({
                    type: "ice-candidate",
                    targetUserId: peerId,
                    candidate: event.candidate
                });
            }
        };

        peerConnection.ontrack = (event) => {
            console.log("Remote Track received from:", peerId);

            const remoteStream = event.streams[0];

            if (!remoteStreamsRef.current[peerId]) {
                remoteStreamsRef.current[peerId] = remoteStream;

                setRemoteStreams(prev => ({
                    ...prev,
                    [peerId]: remoteStream
                }));
            }
        };

        peerConnectionsRef.current[peerId] = peerConnection;
        console.log(peerConnectionsRef.current[peerId])

        return peerConnection;
    }

    const { send } = useSocket((msg) => {
        switch (msg.type) {
            case "user-connected": {
                console.log("NEW USER CONNECTED")
                if (peerConnectionsRef.current[msg.userId]) {
                    console.log("PeerConnection already exists");
                    break;
                }

                const peerConnection = createPeerConnection(msg.userId);
                console.log(peerConnectionsRef.current)

                const audioTrack = localStream?.getAudioTracks()[0];
                const videoTrack = localStream?.getVideoTracks()[0];

                if (audioTrack && localStream) {
                    peerConnection.addTrack(audioTrack, localStream);
                }

                if (videoTrack && localStream) {
                    peerConnection.addTrack(videoTrack, localStream!);
                }

                (async () => {
                    try {
                        const offer = await peerConnection.createOffer();

                        console.log("Offer created:", offer);

                        await peerConnection.setLocalDescription(offer);
                        console.log(`Offer set as local description for ${msg.userId}`);

                        send({
                            type: "offer",
                            targetUserId: msg.userId,
                            offer
                        });

                    } catch (error) {
                        console.error('Error creating offer:', error);
                    }
                })();

                break;
            }

            case "offer": {
                const { fromUserId, offer } = msg;
                console.log("OFFER RECEIVED")

                let peerConnection = peerConnectionsRef.current[fromUserId];

                if (!peerConnection) {
                    peerConnection = createPeerConnection(fromUserId);
                }

                const audioTrack = localStream?.getAudioTracks()[0];
                const videoTrack = localStream?.getVideoTracks()[0];

                if (audioTrack && localStream) {
                    peerConnection.addTrack(audioTrack, localStream);
                }

                if (videoTrack && localStream) {
                    peerConnection.addTrack(videoTrack, localStream!);
                }

                (async () => {
                    try {
                        await peerConnection.setRemoteDescription(offer);
                        console.log(`Offer set as remote description for ${fromUserId}`);

                        const answer = await peerConnection.createAnswer();
                        console.log("Answer created:", answer);

                        await peerConnection.setLocalDescription(answer);
                        console.log(`Answer set as local description for ${fromUserId}`);

                        send({
                            type: "answer",
                            targetUserId: fromUserId,
                            answer
                        });

                    } catch (error) {
                        console.error('Error setting remote description:', error);
                    }
                })();

                break;
            }

            case "answer": {
                const { fromUserId, answer } = msg;
                console.log("ANSWER RECEIVED")

                const peerConnection = peerConnectionsRef.current[fromUserId];

                if (!peerConnection) {
                    console.warn(`PeerConnection not found for ${fromUserId}`);
                    break;
                }

                (async () => {
                    try {
                        await peerConnection.setRemoteDescription(answer);
                        console.log(`Answer set as remote description for ${fromUserId}`);
                    } catch (error) {
                        console.error('Error setting remote description:', error);
                    }
                })();
                break;
            }

            case "ice-candidate": {
                const { fromUserId, candidate } = msg;
                console.log("ICE CANDIDATE RECEIVED")

                const peerConnection = peerConnectionsRef.current[fromUserId];

                if (!peerConnection) {
                    console.warn(`PeerConnection not found for ${fromUserId}`);
                    break;
                }

                (async () => {
                    try {
                        await peerConnection.addIceCandidate(candidate);
                        console.log(`ICE candidate added for ${fromUserId}`);
                    } catch (error) {
                        console.error('Error adding ICE candidate:', error);
                    }
                })();
                break;
            }

            case "screen-share-started": {
                setActiveScreenUser(msg.userId);
                break;
            }

            case "screen-share-ended": {
                setActiveScreenUser(null);
                break;
            }

            default:
                console.log("unknown message type")
                break;
        }
    })

    useEffect(() => {
        console.log("room mounted");
        // if (localStream && localVideoRef.current) {
        //     console.log("local stream available")
        //     localVideoRef.current.srcObject = localStream;


        // }
        // console.log("rooom video unavailable", localStream)

        return () => {
            console.log("cleanup for local media")
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop();
                });
            }
        }
    }, [])

    // useEffect(() => {
    //     console.log("room mounted")

    //     const getLocalMedia = async () => {
    //         try {
    //             const constraints = { video: true, audio: true };

    //             const stream = await navigator.mediaDevices.getUserMedia(constraints);

    //             console.log("Local media stream obtained:", stream);

    //             localStreamRef.current = stream;
    //             console.log(stream.getTracks());

    //             if (localVideoRef.current && localStreamRef.current) {

    //                 console.log("Attaching local stream to video element");

    //                 localVideoRef.current.srcObject = stream;

    //             }

    //         } catch (error) {
    //             console.error('Error accessing media devices:', error);
    //         }
    //     }

    //     getLocalMedia();

    //     return () => {
    //         console.log("cleanup for local media")

    //         if (localStreamRef.current) {
    //             localStreamRef.current.getTracks().forEach(track => {
    //                 track.stop();
    //             });
    //             localStreamRef.current = null;
    //         }
    //     }
    // }, [])


    useEffect(() => {
        const video = screenVideoRef.current;
        if (!video) return;

        if (video.srcObject !== screenVideoStream) {
            video.srcObject = screenVideoStream;
        }
    }, [screenVideoStream])

    useEffect(() => {
        const video = localVideoRef.current;
        if (!video) return;

        const desiredStream =
            activeScreenUser === userId
                ? null
                : localStream;

        if (video.srcObject !== desiredStream) {
            video.srcObject = desiredStream;
        }
    }, [activeScreenUser])


    const toggleMic = () => {
        if (!localStream) return;

        localStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled
        })
        setIsMicOn(prev => !prev)
    }

    const toggleCamera = () => {
        if (!localStream) return;

        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled
        })
        setIsCameraOn(prev => !prev)
    }

    const handleScreenShare = async () => {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            })
            setScreenStream(displayStream);
            setActiveScreenUser(userId);

            send({
                type: "screen-share-started"
            });

            const screenTrack = displayStream.getVideoTracks()[0];

            for (const peerConnection of Object.values(peerConnectionsRef.current)) {
                const senders = peerConnection.getSenders();

                const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video')

                if (videoSender) {
                    await videoSender.replaceTrack(screenTrack);
                }
            }

            screenTrack.onended = () => {
                setScreenStream(null);
                setActiveScreenUser(null);

                send({
                    type: "screen-share-ended"
                });

                const cameraTrack = localStream?.getVideoTracks()[0];

                Object.values(peerConnectionsRef.current).forEach(peerConnection => {
                    const videoSender = peerConnection.getSenders().find(
                        sender => sender.track && sender.track.kind === 'video'
                    );

                    if (videoSender && cameraTrack) {
                        videoSender.replaceTrack(cameraTrack);
                    }
                })
            }
        } catch (e) {
            console.error("Error capturing screen:", e);
        }

    }


    return (
        <div className="room-container flex flex-col items-center p-5">
            <h2>Welcome to Video Chat Room</h2>

            <div className="videos-container grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mx-auto w-full max-w-[1200px] px-4 mt-5 justify-items-center">

                {activeScreenUser && (
                    <div className="col-span-full flex flex-col items-center relative bg-black rounded-lg overflow-hidden aspect-video w-full max-w-[900px] shadow-md">
                        <label className="absolute bottom-1 text-white bg-black/40 px-2 py-1 rounded text-sm z-10">
                            Screen Share
                        </label>

                        <video
                            ref={screenVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}

                <div className="video-local flex flex-col items-center relative bg-black rounded-lg overflow-hidden aspect-video w-full max-w-[600px] shadow-md">
                    <label className="absolute bottom-1 text-white bg-black/40 px-2 py-1 rounded text-sm z-10" htmlFor="">Your Video</label>
                    <video ref={localVideoRef}
                        autoPlay playsInline muted
                        className="w-full h-full object-cover scale-x-[-1]"
                    ></video>
                </div>

                {Object.entries(remoteStreams).map(([peerId, stream]) => (
                    <div key={peerId} className="video-remote flex flex-col items-center relative bg-black rounded-lg overflow-hidden aspect-video w-full max-w-[600px] shadow-md">
                        <label className="absolute bottom-1 text-white bg-black/40 px-2 py-1 rounded text-sm z-10">Remote User</label>
                        <video
                            key={`${peerId}-${activeScreenUser}`}
                            autoPlay playsInline
                            className="w-full h-full object-cover"
                            ref={(video) => {
                                if (!video) return;

                                const desiredStream =
                                    activeScreenUser === peerId
                                        ? null
                                        : stream;

                                if (video.srcObject !== desiredStream) {
                                    video.srcObject = desiredStream;
                                }
                            }}
                        ></video>
                    </div>
                ))}
            </div>

            <div className="controls-container flex gap-1 mt-5">
                <button onClick={toggleMic}>
                    {isMicOn ? "Mute" : "UnMute"}
                </button>
                <button onClick={handleScreenShare}>
                    Share Screen
                </button>
                <button onClick={toggleCamera}>
                    {isCameraOn ? "Stop Video" : "Start Video"}
                </button>
            </div>

            {isHost && (
                <>
                    <div className="mt-6 w-full max-w-md border-2 border-gray-500 rounded-md p-4">
                        <PendingRequests
                            requests={pendingRequests}
                            onApprove={onApprove}
                            onReject={onReject}
                        />
                    </div>
                    <button
                        className="mt-4 bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => onEndRoom()}
                    >
                        End Room
                    </button>
                </>
            )}

        </div>
    )
}

export default Room