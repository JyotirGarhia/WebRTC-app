import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { generateRoomId, getOrCreateUserId } from "../utils/ids";
import { localStream, setLocalStream } from "../utils/mediaStore";

const PreJoinPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const mode = searchParams.get("mode");
    const isHost = mode === "create";

    const roomIdFromUrl = searchParams.get("roomId");
    const isJoinWithLink = !isHost && !!roomIdFromUrl;

    const [isMicOn, setIsMicOn] = useState<boolean>(false);
    const [isCameraOn, setIsCameraOn] = useState(false);

    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [stream, setStream] = useState<MediaStream | null>(null);

    const videoElementRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isHost) {
            setRoomId(generateRoomId());
        } else if (roomIdFromUrl) {
            setRoomId(roomIdFromUrl);
        }
    }, [isHost, roomIdFromUrl]);

    useEffect(() => {
        const getMedia = async () => {
            try {
                const constraints = { video: true, audio: true };
                const media = await navigator.mediaDevices.getUserMedia(constraints);
                console.log("Local Stream obtained:", media);

                media.getAudioTracks().forEach(track => {
                    track.enabled = false
                });
                media.getVideoTracks().forEach(track => {
                    track.enabled = false
                });

                setStream(media);
                setLocalStream(media);

            } catch (e) {
                console.error("Error accessing media:", e);
            }
        }

        getMedia();
    }, []);

    useEffect(() => {
        if (videoElementRef.current && stream) {
            videoElementRef.current.srcObject = stream;
        }
    }, [stream]);

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


    const baseUrl = window.location.origin;
    const fullLink = `${baseUrl}/prejoin?mode=join&roomId=${roomId}`;

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
    }

    const handleJoin = () => {
        if (!name || !roomId) return;

        const userId = getOrCreateUserId();

        sessionStorage.setItem("name", name);
        sessionStorage.setItem("roomId", roomId);
        sessionStorage.setItem("isHost", String(isHost));
        sessionStorage.setItem("userId", userId);

        navigate(`/room?roomId=${roomId}`);
    };

    return (
        <div className="flex justify-center w-full">
            <div className="preview-container flex flex-col items-center p-10 gap-4">
                <label className="text-2xl font-bold">Preview</label>
                <div className="preview-video max-w-sm">
                    <video ref={videoElementRef}
                        autoPlay playsInline muted
                        className="scale-x-[-1]"
                    ></video>
                </div>
                <div className="controls-container flex gap-2">
                    <button onClick={toggleCamera}>
                        {isCameraOn ? "Stop Video" : "Start Video"}
                    </button>
                    <button onClick={toggleMic}>
                        {isMicOn ? "Mute" : "UnMute"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-10">
                <h1 className="text-2xl font-bold">
                    {isHost ? "Create Room" : "Join Room"}
                </h1>

                <input
                    className="border px-3 py-2 rounded w-72"
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />

                <div className="flex gap-2 border px-3 py-2 rounded w-72">
                    <input
                        className="focus:outline-none"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        disabled={isHost || isJoinWithLink}
                    />
                    {isHost && <button
                        className="cursor-pointer"
                        onClick={() => { handleCopy(fullLink) }}>Copy Link</button>
                    }
                </div>

                {isHost && (
                    <div className="border px-3 py-2 rounded flex flex-col gap-2 w-72">

                        <div className="text-sm font-medium">Share Link:</div>
                        <div className="text-xs break-all text-gray-600">{fullLink}</div>

                        <button
                            className="cursor-pointer text-white"
                            onClick={() => { handleCopy(fullLink) }}>Copy Link</button>
                    </div>
                )}

                <button
                    className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
                    onClick={handleJoin}
                    disabled={!name || !roomId}
                >
                    {isHost ? "Create & Join" : "Join Room"}
                </button>
            </div>

        </div>
    );
};

export default PreJoinPage;