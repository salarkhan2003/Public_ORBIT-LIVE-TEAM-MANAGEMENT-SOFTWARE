import React from 'react';
import { Clock, CheckCircle, AlertCircle, User } from 'lucide-react';

const activities = [
	{
		id: 1,
		type: 'task_completed',
		title: 'Task completed',
		description: 'User authentication module testing',
		user: 'Demo User',
		time: '2 hours ago',
		icon: CheckCircle,
		color: 'text-green-600',
	},
	{
		id: 2,
		type: 'task_overdue',
		title: 'Task overdue',
		description: 'Database schema design review',
		user: 'Demo User',
		time: '4 hours ago',
		icon: AlertCircle,
		color: 'text-red-600',
	},
	{
		id: 3,
		type: 'new_member',
		title: 'New team member',
		description: 'A team member joined the team',
		user: 'Admin',
		time: '1 day ago',
		icon: User,
		color: 'text-blue-600',
	},
];

export function RecentActivity() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
			<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				Recent Activity
			</h3>
			<div className="space-y-4">
				{activities.map((activity) => {
					const Icon = activity.icon;
					return (
						<div key={activity.id} className="flex items-start space-x-3">
							<div
								className={`rounded-lg bg-gray-50 p-2 dark:bg-gray-700 ${activity.color}`}
							>
								<Icon className="h-4 w-4" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-gray-900 dark:text-white">
									{activity.title}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{activity.description}
								</p>
								<div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
									<Clock className="mr-1 h-3 w-3" />
									{activity.time}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}