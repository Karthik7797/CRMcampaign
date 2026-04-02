import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/client'
import { CheckSquare, Plus, Clock, Circle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatDate } from '../lib/utils'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Tasks() {
  const qc = useQueryClient()
  const [showCompleted, setShowCompleted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', { completed: showCompleted ? undefined : 'false' }],
    queryFn: () => tasksApi.getAll({
      completed: showCompleted ? undefined : 'false',
    }).then(r => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => tasksApi.toggle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated')
    },
  })

  const priorityColors: Record<string, string> = {
    HIGH: 'text-red-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-green-400',
  }

  const priorityIcons: Record<string, any> = {
    HIGH: AlertTriangle,
    MEDIUM: Clock,
    LOW: Circle,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Tasks</h2>
          <p className="text-slate-400 text-sm">Manage follow-ups and reminders</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={() => setShowCompleted(!showCompleted)}
              className="rounded border-surface-600"
            />
            Show completed
          </label>
          <button className="btn-primary flex items-center gap-1.5"><Plus size={15} /> New Task</button>
        </div>
      </div>

      <div className="card p-0 divide-y divide-surface-700">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className="w-5 h-5 bg-surface-700 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-700 rounded animate-pulse w-48" />
                <div className="h-3 bg-surface-700 rounded animate-pulse w-32" />
              </div>
            </div>
          ))
        ) : data?.tasks?.length > 0 ? (
          data.tasks.map((task: any) => {
            const PriorityIcon = priorityIcons[task.priority] || Circle
            const isOverdue = !task.completed && new Date(task.dueDate) < new Date()
            return (
              <div key={task.id} className="px-5 py-4 flex items-start gap-4 hover:bg-surface-700/30 transition-colors">
                <button
                  onClick={() => toggleMutation.mutate(task.id)}
                  className={`mt-0.5 transition-colors ${task.completed ? 'text-green-400' : 'text-slate-500 hover:text-brand-400'}`}
                >
                  {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {task.description && (
                      <span className="text-xs text-slate-500">{task.description}</span>
                    )}
                    <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                      <Clock size={11} />
                      {isOverdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${priorityColors[task.priority]}`}>
                      <PriorityIcon size={11} />
                      {task.priority}
                    </span>
                    {task.lead && (
                      <span className="text-xs bg-surface-700 text-slate-400 px-2 py-0.5 rounded">
                        {task.lead.name}
                      </span>
                    )}
                    {task.assignedTo && (
                      <span className="text-xs text-slate-500">
                        → {task.assignedTo.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-16">
            <CheckSquare size={32} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-500">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  )
}
