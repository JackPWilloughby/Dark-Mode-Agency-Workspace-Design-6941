import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const KanbanColumn = ({ column, tasks, onTaskSelect, onTaskEdit, selectedTaskId }) => {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col h-full bg-dark-surface rounded-lg border border-dark-border">
      {/* Column Header */}
      <div className="flex-shrink-0 p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${column.color} mr-3`} />
            <h2 className="font-semibold text-dark-text-primary text-sm sm:text-base">
              {column.title}
            </h2>
          </div>
          <span className="px-2 py-1 bg-dark-bg text-dark-text-muted text-xs rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div 
        ref={setNodeRef} 
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onTaskSelect}
              onEdit={onTaskEdit}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-dark-text-muted text-sm border-2 border-dashed border-dark-border rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanColumn