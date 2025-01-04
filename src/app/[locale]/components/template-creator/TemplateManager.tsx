"use client";
import { NextPage } from 'next';
import React, { useState, ChangeEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocale, useTranslations } from 'next-intl';
import { v4 } from 'uuid';
import { set } from 'lodash';

// Define the Template interface with the new structure
interface Template {
  id: string; // Unique identifier for each template
  template_name: string;
  message: string;
}

interface TemplateManagerProps {
  userEmail: string | null;
}

// Simple helper to show a toast/alert (replace with your favorite toast library if you wish)
const showToast = (message: string) => {
  alert(message);
};

const TemplateManager: NextPage<TemplateManagerProps> = ({ userEmail }) => {
  const [templatesList, setTemplatesList] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const t = useTranslations("templateManager");

  // Fetch existing templates from the backend
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/user/find-user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const user = await response.json();

        // All templates from user
        const userTemplates: Template[] = user?.messageTemplates || [];

        setTemplatesList(userTemplates);

        console.log(`User Templates: ${JSON.stringify(userTemplates)}`);

        // Select the first template by default if available
        if (userTemplates.length > 0) {
          setSelectedTemplate(userTemplates[0]);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch templates.');
      }
    }
    fetchTemplates();
  }, []);

  // Handle selecting a template from the list
  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  // Add a new template
  const handleAddNewTemplate = () => {
    const newTemplate: Template = {
      id: `template-${v4().slice(-4)}`, // Generate a unique ID (replace with your own logic)
      template_name: `New Template ${templatesList.length + 1}`,
      message: '',
    };
    setTemplatesList((prevList) => [...prevList, newTemplate]);
    setSelectedTemplate(newTemplate);
  };

  // Save template changes
  const handleSaveTemplate = async () => {
    if (!selectedTemplate) {
      showToast('No template selected.');
      return;
    }

    // Validate template_name and message
    if (!selectedTemplate.template_name.trim()) {
      showToast('Template name cannot be empty.');
      return;
    }

    if (!selectedTemplate.message.trim()) {
      showToast('Message content cannot be empty.');
      return;
    }

    try {
      const response = await fetch('/api/message/append-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template: selectedTemplate }),
      });

      if (response.ok) {
        toast.success(t("templateSaved"));
        // Optionally, refresh the templates list or handle state accordingly
        location.reload(); // Refresh the page after saving
      } else {
        toast.error('Failed to save the template.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving the template.');
    }
  };

  // Delete the entire template
  const handleDeleteTemplate = async () => {
    if (selectedTemplate) {
      const confirmed = window.confirm(`Are you sure you want to delete template "${selectedTemplate.template_name}"?`);
      if (confirmed) {
        // Remove template from the list
        setTemplatesList((prevTemplates) => prevTemplates.filter((tpl) => tpl.id !== selectedTemplate.id));

        const templates_to_send = templatesList.filter((tpl) => tpl.id !== selectedTemplate.id)
        const response = await fetch('/api/message/delete-template', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: selectedTemplate.id }),
        });

        // Clear the selected template
        setSelectedTemplate(null);

        location.reload(); // Refresh the page after deleting
      }
    } else {
      showToast('No template selected.');
    }
  };

  // Handle changes in the template fields
  const handleTemplateChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedTemplate) return;
    const { name, value } = e.target;
    setSelectedTemplate({
      ...selectedTemplate,
      [name]: value,
    });
    setTemplatesList((prevTemplates) =>
      prevTemplates.map((tpl) => (tpl.id === selectedTemplate.id ? { ...tpl, [name]: value } : tpl))
  )};

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      {/* Left Column: Templates List (25% width) */}
      <div
        style={{
          width: '25%',
          borderRight: '1px solid #ccc',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>All Templates</h3>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {templatesList.map((template) => (
            <li key={template.id} style={{ marginBottom: '0.8rem' }}>
              <button
                style={{
                  display: 'flex',
                  width: '100%',
                  textAlign: 'left',
                  backgroundColor: selectedTemplate?.id === template.id ? '#e0f7fa' : '#f9f9f9',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '0.8rem 1rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                onClick={() => handleTemplateClick(template)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eaeaea';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedTemplate?.id === template.id ? '#e0f7fa' : '#f9f9f9';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <img src="/static/templateIcon.png" alt="template" style={{ width: '40px', marginRight: '0.5rem' }} />
                {template.template_name}
              </button>
            </li>
          ))}
        </ul>

        {/* Add New Template Button (at the bottom) */}
        <button
          onClick={handleAddNewTemplate}
          className="bg-blue-500 text-white p-2 cursor-pointer rounded-full"
        >
          + Add New Template
        </button>
      </div>

      {/* Right Column: Selected Template Management (75% width) */}
      <div style={{ width: '75%', padding: '1rem', overflowY: 'auto' }}>
        {selectedTemplate ? (
          <>
            {/* Template Name */}
            <input
              type="text"
              name="template_name"
              value={selectedTemplate.template_name}
              onChange={handleTemplateChange}
              placeholder="Template Name"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.2rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            {/* Template Message */}
            <textarea
              name="message"
              value={selectedTemplate.message}
              onChange={handleTemplateChange}
              placeholder="Template Message"
              rows={10}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical',
              }}
            />

            {/* Save and Delete Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
              >
                Delete Template
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
              >
                Save Template
              </button>
            </div>
          </>
        ) : (
          <p>Select a template to view or edit its details.</p>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
