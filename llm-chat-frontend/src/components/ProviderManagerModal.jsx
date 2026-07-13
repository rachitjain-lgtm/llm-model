import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Trash2, Pencil } from 'lucide-react';
import { setProviderManagerModalOpen } from '../store/uiSlice';
import { createProviderAsync, deleteProviderAsync, updateProviderAsync, selectAllProviderProfiles } from '../store/providerSlice';
import { FIELD_LABELS, PROVIDER_FIELD_PRESETS, PROVIDER_OPTIONS, getProviderTypeLabel } from '../config/models';

const EMPTY_CONFIG = {
  apiKey: '',
  apiBaseUrl: '',
  appName: '',
  endpoint: '',
  deploymentName: '',
  apiVersion: '',
  awsRegion: '',
  accessKeyId: '',
  secretAccessKey: '',
  modelId: '',
  knowledgeBaseId: '',
  guardrailId: '',
};

export default function ProviderManagerModal() {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.ui.providerManagerModalOpen);
  const profiles = useSelector(selectAllProviderProfiles);

  const [editingId, setEditingId] = useState(null);
  const [providerType, setProviderType] = useState('openrouter');
  const [name, setName] = useState('');
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [modelsText, setModelsText] = useState('');

  const preset = PROVIDER_FIELD_PRESETS[providerType] || PROVIDER_FIELD_PRESETS.openrouter;

  useEffect(() => {
    if (!open) return;
    if (!name) {
      setName(`${preset.label} Profile`);
    }
  }, [open, preset.label, name]);

  if (!open) return null;

  const resetForm = () => {
    setEditingId(null);
    setProviderType('openrouter');
    setName('');
    setConfig(EMPTY_CONFIG);
    setModelsText('');
  };

  const handleFieldChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (profile) => {
    setEditingId(profile.id);
    setProviderType(profile.providerType || 'openrouter');
    setName(profile.name || '');
    const nextConfig = { ...EMPTY_CONFIG, ...(profile.config || {}) };
    setConfig(nextConfig);
    setModelsText((profile.models || []).map((m) => (typeof m === 'string' ? m : m.id)).join('\n'));
  };

  const handleSave = async () => {
    const payload = {
      name: name.trim() || `${preset.label} Profile`,
      providerType,
      config,
      models: modelsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((id) => ({ id, label: id })),
    };

    if (editingId) {
      await dispatch(updateProviderAsync({ id: editingId, payload }));
    } else {
      await dispatch(createProviderAsync(payload));
    }

    resetForm();
    dispatch(setProviderManagerModalOpen(false));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={() => dispatch(setProviderManagerModalOpen(false))} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E7E7E7] dark:border-[#23272A]">
          <div>
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#eceff1]">Register Provider</h3>
            <p className="text-[11px] text-[#737373] dark:text-[#94A3B8] mt-1">Add a provider profile and the models it exposes.</p>
          </div>
          <button onClick={() => dispatch(setProviderManagerModalOpen(false))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8]">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-0 flex-1 min-h-0">
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-[#E7E7E7] dark:border-[#23272A] overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#94A3B8]">Provider Type</label>
                <select value={providerType} onChange={(e) => setProviderType(e.target.value)} className="w-full h-10 px-3.5 rounded-lg border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#1E2326] text-xs text-[#171717] dark:text-[#eceff1] font-semibold appearance-none">
                  {PROVIDER_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#94A3B8]">Profile Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${preset.label} Profile`} className="w-full h-10 px-3.5 rounded-lg border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#1E2326] text-xs text-[#171717] dark:text-[#eceff1] font-semibold" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preset.fields.map((field) => (
                <div key={field} className="space-y-1.5 md:col-span-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#94A3B8]">{FIELD_LABELS[field] || field}</label>
                  <input
                    value={config[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    placeholder={FIELD_LABELS[field] || field}
                    type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#1E2326] text-xs text-[#171717] dark:text-[#eceff1] font-semibold"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#94A3B8]">Model IDs</label>
              <textarea
                value={modelsText}
                onChange={(e) => setModelsText(e.target.value)}
                rows={5}
                placeholder={providerType === 'aws-bedrock' ? 'anthropic.claude-3-5-sonnet\nmeta.llama3-70b-instruct-v1:0' : 'One model id per line'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#1E2326] text-xs text-[#171717] dark:text-[#eceff1] font-semibold resize-y"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-[#245955] text-white text-xs font-semibold hover:bg-[#1d4643]">
                <Plus size={14} />
                {editingId ? 'Update Profile' : 'Save Profile'}
              </button>
              <button onClick={resetForm} className="px-4 h-10 rounded-lg border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#1E2326] text-xs font-semibold text-[#171717] dark:text-[#eceff1]">
                Reset
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto bg-[#FAFAFA] dark:bg-[#0f1214]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-[#94A3B8]">Saved Profiles</h4>
            </div>
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div key={profile.id} className="p-3 rounded-xl border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#171717] dark:text-[#eceff1] truncate">{profile.name}</div>
                      <div className="text-[10px] text-[#737373] dark:text-[#94A3B8]">{getProviderTypeLabel(profile.providerType)}{profile.isBuiltin ? ' built-in' : ''}</div>
                    </div>
                    {!profile.isBuiltin && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(profile)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8]"><Pencil size={13} /></button>
                        <button onClick={() => dispatch(deleteProviderAsync(profile.id))} className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#737373] hover:text-rose-500"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-[#737373] dark:text-[#94A3B8]">
                    {(profile.models || []).map((m) => (typeof m === 'string' ? m : m.id)).join(', ') || 'No models yet'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}