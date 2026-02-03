export default function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Active Reports</p>
          <p className="text-3xl font-bold text-primary mt-2">124</p>
          <p className="text-green-600 text-sm mt-1">+12% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">New Matches</p>
          <p className="text-3xl font-bold text-primary mt-2">38</p>
          <p className="text-green-600 text-sm mt-1">+8% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Response Rate</p>
          <p className="text-3xl font-bold text-primary mt-2">78%</p>
          <p className="text-green-600 text-sm mt-1">+5% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Avg Score</p>
          <p className="text-3xl font-bold text-primary mt-2">72</p>
          <p className="text-gray-500 text-sm mt-1">Stable</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">New borrower match</p>
                  <p className="text-sm text-gray-500">Score: 85 - Mortgage Ready</p>
                </div>
                <span className="text-sm text-gray-400">2h ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition">
              Browse Reports
            </button>
            <button className="w-full py-3 border border-primary text-primary rounded-lg hover:bg-gray-50 transition">
              Update Criteria
            </button>
            <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
