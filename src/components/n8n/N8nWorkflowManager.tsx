'use client';

import { useState } from 'react';
import { useN8nStore } from '@/store/n8nStore';
import { N8nEventType, N8nWorkflowConfig } from '@/types/n8n';

const EVENT_OPTIONS = [
  { value: N8nEventType.CONTENT_CREATED, label: 'Content Created' },
  { value: N8nEventType.CONTENT_UPDATED, label: 'Content Updated' },
  { value: N8nEventType.CONTENT_PUBLISHED, label: 'Content Published' },
  { value: N8nEventType.POST_PUBLISHED, label: 'Post Published' },
  { value: N8nEventType.POST_FAILED, label: 'Post Failed' },
  { value: N8nEventType.POST_SCHEDULED, label: 'Post Scheduled' },
  { value: N8nEventType.ANALYTICS_UPDATED, label: 'Analytics Updated' },
  { value: N8nEventType.ENGAGEMENT_THRESHOLD, label: 'Engagement Threshold' },
];

export function N8nWorkflowManager() {
  const { workflows, isConnected, addWorkflow, updateWorkflow, removeWorkflow, toggleWorkflow } = useN8nStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
    description: '',
    events: [] as N8nEventType[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateWorkflow(editingId, formData);
      setEditingId(null);
    } else {
      const newWorkflow: N8nWorkflowConfig = {
        id: Date.now().toString(),
        ...formData,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addWorkflow(newWorkflow);
    }
    
    setFormData({
      name: '',
      webhookUrl: '',
      description: '',
      events: [],
    });
    setShowAddForm(false);
  };

  const handleEdit = (workflow: N8nWorkflowConfig) => {
    setFormData({
      name: workflow.name,
      webhookUrl: workflow.webhookUrl,
      description: workflow.description || '',
      events: workflow.events,
    });
    setEditingId(workflow.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      removeWorkflow(id);
    }
  };

  const toggleEvent = (event: N8nEventType) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <p className="text-yellow-800 dark:text-yellow-200">
          Please configure and connect to n8n first.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">n8n Workflows</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Workflow
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Workflow' : 'Add New Workflow'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://your-n8n.com/webhook/abc123"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Trigger Events
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(option.value)}
                      onChange={() => toggleEvent(option.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Workflow
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    webhookUrl: '',
                    description: '',
                    events: [],
                  });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {workflows.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No workflows configured. Add one to get started.
          </p>
        ) : (
          workflows.map(workflow => (
            <div
              key={workflow.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{workflow.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      workflow.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {workflow.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {workflow.description && (
                  <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                )}
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Events:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {workflow.events.map(event => (
                      <span
                        key={event}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {EVENT_OPTIONS.find(o => o.value === event)?.label || event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => toggleWorkflow(workflow.id)}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  {workflow.active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleEdit(workflow)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}