type Props = {
  roomId: string;
  onCreate: () => void;
};

export default function CreateRoom({ roomId, onCreate }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Create a Room</h2>

      <p className="text-sm text-gray-500">
        Share this Room ID with others:
      </p>

      <div className="bg-gray-800 px-4 py-2 rounded">
        {roomId}
      </div>

      <button onClick={onCreate}>
        Create Room
      </button>
    </div>
  );
}
