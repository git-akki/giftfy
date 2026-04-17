interface ScheduleRevealProps {
  scheduledDate: string;
  onChange: (date: string) => void;
}

const ScheduleReveal = ({ scheduledDate, onChange }: ScheduleRevealProps) => {
  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
      <p className="font-display text-base font-bold text-gray-800 mb-2">Schedule reveal ⏰</p>
      <p className="font-body text-xs text-gray-500 mb-3">
        The gift will only be visible after this date & time
      </p>
      <input
        type="datetime-local"
        value={scheduledDate}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        className="w-full font-body text-sm px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-200"
      />
    </div>
  );
};

export default ScheduleReveal;
