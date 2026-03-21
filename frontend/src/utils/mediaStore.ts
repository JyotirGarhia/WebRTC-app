export let localStream: MediaStream | null = null;
export let micEnabled: boolean = true;
export let cameraEnabled: boolean = true;
export const setLocalStream = (stream: MediaStream) => {
    localStream = stream;
};
