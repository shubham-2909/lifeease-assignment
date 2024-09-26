export function MatchUpdate() {
  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      {/* Top Section with Striker, Non-striker, Bowler */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-400 p-4 text-center bg-emerald-500 text-white">
          Striker: Sachin
        </div>
        <div className="border border-gray-400 p-4 text-center bg-emerald-500 text-white">
          Non-striker: Dravid
        </div>
        <div className="border border-gray-400 p-4 text-center bg-emerald-500 text-white">
          Bowler: Lee
        </div>
      </div>

      {/* Buttons Section */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          0
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          1
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          2
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          3
        </div>

        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          4
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          6
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          Wicket
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          Wide
        </div>

        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          Bye
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          Legbye
        </div>
        <div className="border border-gray-400 p-6 text-center bg-rose-500 text-white">
          Noball
        </div>
        <div className="col-span-4 border border-gray-400 p-6 text-center bg-rose-500 text-white">
          New Ball
        </div>
      </div>
    </div>
  );
}
