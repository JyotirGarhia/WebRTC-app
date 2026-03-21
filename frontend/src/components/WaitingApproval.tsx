type Props = {
    onCancel: () => void;
}

const WaitingApproval = ({ onCancel }: Props) => {
    return (
         <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-xl font-semibold">
        Waiting for approval…
      </h2>

      <p className="text-gray-500">
        The host must approve your request.
      </p>

      <button onClick={onCancel}>
        Cancel
      </button>
    </div>
    )
}

export default WaitingApproval