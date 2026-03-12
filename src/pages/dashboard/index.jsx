import viewIcon from "../../assets/view.png";

const index = () => {
  const username = "Rafli";
  const budget = 5000000;

  const now = new Date();
  const isDay = now.getHours() >= 6 && now.getHours() < 18;
  const greetingEmoji = isDay ? "☀️" : "🌙";
  const firstDateOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDateOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date) =>
    date.toLocaleDateString("in-ID", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="mx-auto w-full px-4 md:container md:px-0">
      <div className="dashboard-title flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="left-title flex w-full flex-row items-center gap-4">
          <div className="left-inner">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-lg text-slate-700">
              Hello, {username} {greetingEmoji}
            </p>
          </div>
          <img src={viewIcon} alt="View" className="h-auto w-4 md:w-6" />
        </div>
        <div className="right-title self-start bg-rose-200 w-fit max-w-full rounded-lg px-4 py-2 text-xs font-medium text-rose-900 sm:text-sm md:w-[10rem]">
          <p>Period</p>
          <p className="whitespace-nowrap">
            {`${formatDate(firstDateOfMonth)} - ${formatDate(lastDateOfMonth)}`}
          </p>
        </div>
      </div>

      <div className="budget-left mt-4 rounded-xl bg-gray-500 text-white p-8">
        <div className="top-side-budget flex flex-row justify-between">
          <div className="left-side-budget">
            <p className="text-xs md:text-sm mb-2">👇 Remaining Budget Left</p>
            <p className="text-4xl">Rp. {budget.toLocaleString("id-ID")}</p>
          </div>
          <div className="right-side-budget flex flex-row gap-4">
            <div className="income-budget">
              <p className="text-gray-200 text-sm md:text-lg mb-2">Income</p>
              <p className="text-xl text-green-400">Rp. 10.000.000</p>
            </div>
            <div className="expense-budget">
              <p className="text-gray-200 text-sm md:text-lg mb-2">Expense</p>
              <p className="text-xl text-red-400">Rp. 5.000.000</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-black rounded-full mt-2">
          <div
            className="bg-blue-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full h-4 flex items-center justify-center"
            style={{ width: "45%" }}
          >
            {" "}
            45%
          </div>
        </div>
        <p className="text-xs text-white mt-1">
          45% of your budget has been used
        </p>
      </div>
    </div>
  );
};

export default index;
