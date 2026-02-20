import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../common/Toast.jsx';
import { LLM_PROVIDERS } from '../../utils/constants.js';
import LLMProviderFactory from '../../services/llm/LLMProviderFactory.js';

const PROVIDER_OPTIONS = [
  { value: LLM_PROVIDERS.CLAUDE, label: 'Claude (Anthropic)' },
  { value: LLM_PROVIDERS.OPENAI, label: 'OpenAI' },
  { value: LLM_PROVIDERS.AZURE_OPENAI, label: 'Azure OpenAI' },
  { value: LLM_PROVIDERS.OLLAMA, label: 'Ollama' },
  { value: LLM_PROVIDERS.LMSTUDIO, label: 'LM Studio' },
];

const PROVIDER_DEFAULTS = {
  [LLM_PROVIDERS.CLAUDE]: {
    apiKey: '',
    model: 'claude-sonnet-4-20250514',
    baseUrl: 'https://api.anthropic.com',
  },
  [LLM_PROVIDERS.OPENAI]: {
    apiKey: '',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com',
  },
  [LLM_PROVIDERS.AZURE_OPENAI]: {
    apiKey: '',
    baseUrl: 'https://your-resource.openai.azure.com',
    deploymentName: '',
    apiVersion: '2024-10-21',
    model: '',
  },
  [LLM_PROVIDERS.OLLAMA]: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2',
  },
  [LLM_PROVIDERS.LMSTUDIO]: {
    baseUrl: 'http://127.0.0.1:1234',
    model: 'default',
  },
};

const needsApiKey = (provider) =>
  provider === LLM_PROVIDERS.CLAUDE || provider === LLM_PROVIDERS.OPENAI || provider === LLM_PROVIDERS.AZURE_OPENAI;

export default function LLMConfiguration() {
  const { llmConfig, saveLLMConfig } = useApp();
  const { addToast } = useToast();

  const [selectedProvider, setSelectedProvider] = useState(LLM_PROVIDERS.CLAUDE);
  const [formFields, setFormFields] = useState(PROVIDER_DEFAULTS[LLM_PROVIDERS.CLAUDE]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    if (llmConfig && llmConfig.provider) {
      setSelectedProvider(llmConfig.provider);
      const defaults = PROVIDER_DEFAULTS[llmConfig.provider] || {};
      setFormFields({
        ...defaults,
        ...llmConfig,
      });
    }
  }, [llmConfig]);

  const handleProviderChange = useCallback((provider) => {
    setSelectedProvider(provider);
    setFormFields({ ...PROVIDER_DEFAULTS[provider] });
    setTestResult(null);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setFormFields((prev) => ({ ...prev, [field]: value }));
    setTestResult(null);
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const provider = LLMProviderFactory.create(selectedProvider, formFields);
      const result = await provider.validateConfig();
      setTestResult(result);

      if (result.valid) {
        addToast('Connection test passed!', 'success');
      } else {
        addToast(`Connection test failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      const errorResult = { valid: false, error: err.message };
      setTestResult(errorResult);
      addToast(`Connection test error: ${err.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    try {
      const config = {
        provider: selectedProvider,
        ...formFields,
      };
      saveLLMConfig(config);
      addToast('LLM configuration saved successfully.', 'success');
    } catch (err) {
      addToast(`Failed to save configuration: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasSavedConfig = llmConfig && llmConfig.provider;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LLM Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the AI provider used for grading short-answer and long-answer questions.
        </p>
      </div>

      {/* Current Config */}
      {hasSavedConfig && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">Current Configuration Active</span>
          </div>
          <div className="text-sm text-green-700 ml-7">
            <span className="font-medium">Provider:</span>{' '}
            {PROVIDER_OPTIONS.find((p) => p.value === llmConfig.provider)?.label || llmConfig.provider}
            {' | '}
            <span className="font-medium">Model:</span> {llmConfig.model || 'default'}
            {llmConfig.baseUrl && (
              <>
                {' | '}
                <span className="font-medium">URL:</span> {llmConfig.baseUrl}
              </>
            )}
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Provider Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {PROVIDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* API Key (Claude / OpenAI only) */}
        {needsApiKey(selectedProvider) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={formFields.apiKey || ''}
              onChange={(e) => handleFieldChange('apiKey', e.target.value)}
              placeholder="Enter your API key..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {selectedProvider === LLM_PROVIDERS.CLAUDE
                ? 'Your Anthropic API key (starts with sk-ant-...)'
                : selectedProvider === LLM_PROVIDERS.AZURE_OPENAI
                ? 'Your Azure OpenAI API key from the Azure portal'
                : 'Your OpenAI API key (starts with sk-...)'}
            </p>
          </div>
        )}

        {/* Azure-specific: Deployment Name */}
        {selectedProvider === LLM_PROVIDERS.AZURE_OPENAI && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deployment Name
            </label>
            <input
              type="text"
              value={formFields.deploymentName || ''}
              onChange={(e) => handleFieldChange('deploymentName', e.target.value)}
              placeholder="e.g. gpt-4o-mini"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              The name of your model deployment in Azure OpenAI Studio.
            </p>
          </div>
        )}

        {/* Azure-specific: API Version */}
        {selectedProvider === LLM_PROVIDERS.AZURE_OPENAI && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Version
            </label>
            <input
              type="text"
              value={formFields.apiVersion || ''}
              onChange={(e) => handleFieldChange('apiVersion', e.target.value)}
              placeholder="2024-10-21"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Azure OpenAI API version. Default: 2024-10-21
            </p>
          </div>
        )}

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            value={formFields.model || ''}
            onChange={(e) => handleFieldChange('model', e.target.value)}
            placeholder="Enter model name..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Default: {PROVIDER_DEFAULTS[selectedProvider]?.model}
          </p>
        </div>

        {/* Base URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base URL
          </label>
          <input
            type="text"
            value={formFields.baseUrl || ''}
            onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
            placeholder="Enter base URL..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Default: {PROVIDER_DEFAULTS[selectedProvider]?.baseUrl}
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`rounded-lg p-4 ${
              testResult.valid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.valid ? (
                <>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    Configuration is valid
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm font-medium text-red-800">
                    {testResult.error || 'Configuration is invalid'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
          >
            {testing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testing...
              </span>
            ) : (
              'Test Connection'
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Provider Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Provider Notes</h2>
        <div className="space-y-3 text-sm text-gray-600">
          {selectedProvider === LLM_PROVIDERS.CLAUDE && (
            <div>
              <p className="font-medium text-gray-800">Claude (Anthropic)</p>
              <p>
                Requires an API key from Anthropic. Default model is{' '}
                <code className="bg-gray-100 px-1 rounded text-xs">claude-sonnet-4-20250514</code>.
                Supports the Messages API.
              </p>
            </div>
          )}
          {selectedProvider === LLM_PROVIDERS.OPENAI && (
            <div>
              <p className="font-medium text-gray-800">OpenAI</p>
              <p>
                Requires an API key from OpenAI. Default model is{' '}
                <code className="bg-gray-100 px-1 rounded text-xs">gpt-4o-mini</code>.
                Compatible with any OpenAI-compatible API endpoint.
              </p>
            </div>
          )}
          {selectedProvider === LLM_PROVIDERS.AZURE_OPENAI && (
            <div>
              <p className="font-medium text-gray-800">Azure OpenAI</p>
              <p>
                Requires an Azure OpenAI resource. Set the Base URL to your resource endpoint
                (e.g.{' '}
                <code className="bg-gray-100 px-1 rounded text-xs">
                  https://your-resource.openai.azure.com
                </code>
                ), enter your API key from the Azure portal, and specify the Deployment Name
                matching the model you deployed in Azure OpenAI Studio.
              </p>
            </div>
          )}
          {selectedProvider === LLM_PROVIDERS.OLLAMA && (
            <div>
              <p className="font-medium text-gray-800">Ollama</p>
              <p>
                Local inference server. No API key required. Ensure Ollama is running at the
                specified base URL (default:{' '}
                <code className="bg-gray-100 px-1 rounded text-xs">http://localhost:11434</code>).
                Default model is{' '}
                <code className="bg-gray-100 px-1 rounded text-xs">llama3.2</code>.
              </p>
            </div>
          )}
          {selectedProvider === LLM_PROVIDERS.LMSTUDIO && (
            <div>
              <p className="font-medium text-gray-800">LM Studio</p>
              <p>
                Local inference server. No API key required. Ensure LM Studio's local server is
                running at the specified base URL (default:{' '}
                <code className="bg-gray-100 px-1 rounded text-xs">http://127.0.0.1:1234</code>).
                Load the desired model in LM Studio before testing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
