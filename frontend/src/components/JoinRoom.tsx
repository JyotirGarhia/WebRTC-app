type Props = {
  onJoin: (roomId: string) => void;
};

export default function JoinRoom({ onJoin }: Props) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <h2>Join a Room</h2>

      <input
        placeholder="Enter Room ID"
        className="border px-3 py-2 rounded"
      />

      <button onClick={() => onJoin("public-room-1")}>
        Request to Join
      </button>
    </div>
  );
}
