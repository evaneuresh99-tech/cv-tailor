'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cvTemplates, type CVTemplate, type CVTrack } from '@/lib/cv-templates';

const STORAGE_KEY = 'cv-tailor-templates';

function loadTemplates(): CVTemplate[] {
  if (typeof window === 'undefined') return cvTemplates;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : cvTemplates;
  } catch {
    return cvTemplates;
  }
}

function TagInput({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-xs font-medium"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="hover:text-indigo-600 leading-none"
              aria-label="Remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

function ExperienceEditor({
  exp,
  onChange,
  onRemove,
}: {
  exp: CVTemplate['experience'][0];
  onChange: (e: CVTemplate['experience'][0]) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-500">Title</label>
            <input
              value={exp.title}
              onChange={(e) => onChange({ ...exp, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Company</label>
            <input
              value={exp.company}
              onChange={(e) => onChange({ ...exp, company: e.target.value })}
              className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Period</label>
            <input
              value={exp.period}
              onChange={(e) => onChange({ ...exp, period: e.target.value })}
              className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm shadow-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Bullets (one per line)</label>
          <Textarea
            rows={5}
            value={exp.bullets.join('\n')}
            onChange={(e) => onChange({ ...exp, bullets: e.target.value.split('\n') })}
            className="mt-1 text-sm"
          />
        </div>
        <Button type="button" size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={onRemove}>
          Remove role
        </Button>
      </CardContent>
    </Card>
  );
}

function TemplateEditor({
  template,
  onChange,
}: {
  template: CVTemplate;
  onChange: (t: CVTemplate) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={template.summary}
            onChange={(e) => onChange({ ...template, summary: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Competencies */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Core Competencies</CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput
            values={template.competencies}
            onChange={(v) => onChange({ ...template, competencies: v })}
          />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Experience</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...template,
                experience: [
                  ...template.experience,
                  { title: '', company: '', period: '', bullets: [''] },
                ],
              })
            }
          >
            + Add role
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {template.experience.map((exp, i) => (
            <ExperienceEditor
              key={i}
              exp={exp}
              onChange={(e) => {
                const updated = [...template.experience];
                updated[i] = e;
                onChange({ ...template, experience: updated });
              }}
              onRemove={() =>
                onChange({
                  ...template,
                  experience: template.experience.filter((_, idx) => idx !== i),
                })
              }
            />
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Key Achievements (one per line)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={template.achievements.join('\n')}
            onChange={(e) => onChange({ ...template, achievements: e.target.value.split('\n') })}
          />
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tools & Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(template.tools).map(([category, tools]) => (
            <div key={category}>
              <label className="text-xs font-medium text-gray-500">{category}</label>
              <TagInput
                values={tools}
                onChange={(v) =>
                  onChange({ ...template, tools: { ...template.tools, [category]: v } })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {template.languages.map((lang, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={lang.language}
                onChange={(e) => {
                  const updated = [...template.languages];
                  updated[i] = { ...lang, language: e.target.value };
                  onChange({ ...template, languages: updated });
                }}
                className="flex-1 rounded-md border border-input px-3 py-1.5 text-sm shadow-sm"
                placeholder="Language"
              />
              <input
                value={lang.level}
                onChange={(e) => {
                  const updated = [...template.languages];
                  updated[i] = { ...lang, level: e.target.value };
                  onChange({ ...template, languages: updated });
                }}
                className="w-40 rounded-md border border-input px-3 py-1.5 text-sm shadow-sm"
                placeholder="Level"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const [templates, setTemplates] = useState<CVTemplate[]>(cvTemplates);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  function updateTemplate(track: CVTrack, updated: CVTemplate) {
    setTemplates((prev) => prev.map((t) => (t.track === track ? updated : t)));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setTemplates(cvTemplates);
    localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">CV Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Edit the source CV templates. Changes persist to localStorage for this session.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>Reset to defaults</Button>
          <Button size="sm" onClick={handleSave} className={saved ? 'bg-green-600 hover:bg-green-700' : ''}>
            {saved ? '✓ Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ops-lead">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="ops-lead">Operations Lead</TabsTrigger>
          <TabsTrigger value="product-owner">Product Owner</TabsTrigger>
          <TabsTrigger value="technical-pm">Technical PM</TabsTrigger>
        </TabsList>

        {(['ops-lead', 'product-owner', 'technical-pm'] as CVTrack[]).map((track) => {
          const tmpl = templates.find((t) => t.track === track);
          if (!tmpl) return null;
          return (
            <TabsContent key={track} value={track} className="mt-4">
              <TemplateEditor template={tmpl} onChange={(updated) => updateTemplate(track, updated)} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
