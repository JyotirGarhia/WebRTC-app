import { useNavigate } from "react-router-dom";
const RoomClosed = () => {

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-xl font-semibold">
        Room Closed
      </h2>

      <p className="text-gray-500">
        The host has ended the room.
      </p>
      <button onClick={() => { navigate("/") }}>
        Home
      </button>
    </div>
  );
};

export default RoomClosed;
