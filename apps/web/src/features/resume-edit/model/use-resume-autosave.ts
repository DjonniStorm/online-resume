import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type ResumeEditorValues,
  editorValuesToUpdateInput,
  resumeToEditorValues,
} from '@/entities/resume';
import type { ResumeDto, UpdateResumeDto } from '@/shared/api/generated/types.gen';

import type { EditorForm } from './editor-form';
import { validateValues } from './validation';

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error' | 'invalid';

type AutosaveOptions = {
  form: EditorForm;
  resume: ResumeDto;
  saveError: { status?: number } | undefined;
  paused: boolean;
  onSave: (input: UpdateResumeDto) => Promise<ResumeDto | null>;
  onSaveStateChange: (state: SaveState) => void;
};

function signature(values: ResumeEditorValues): string {
  return JSON.stringify(editorValuesToUpdateInput(values, 0));
}

export function useResumeAutosave({
  form,
  resume,
  saveError,
  paused,
  onSave,
  onSaveStateChange,
}: AutosaveOptions) {
  const valuesRef = useRef(form.values);
  const formRef = useRef(form);
  const revisionRef = useRef(resume.revision);
  const savedSignatureRef = useRef(signature(resumeToEditorValues(resume)));
  const inFlightRef = useRef<Promise<ResumeDto | null> | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [savedVersion, setSavedVersion] = useState(0);

  useEffect(() => {
    revisionRef.current = resume.revision;
  }, [resume.revision]);

  useEffect(() => {
    onSaveStateChange(saveState);
  }, [onSaveStateChange, saveState]);

  useEffect(() => {
    valuesRef.current = form.values;
    formRef.current = form;
  }, [form.values]);

  const saveLatest = useCallback(
    async (flush: boolean): Promise<boolean> => {
      for (;;) {
        if (inFlightRef.current) {
          if (!(await inFlightRef.current)) {
            return false;
          }
        }

        const values = valuesRef.current;
        const errors = validateValues(values);
        formRef.current.setErrors(errors);
        if (Object.keys(errors).length > 0) {
          setSaveState('invalid');
          return false;
        }

        const currentSignature = signature(values);
        if (currentSignature === savedSignatureRef.current) {
          setSaveState('saved');
          return true;
        }

        const request = onSave(editorValuesToUpdateInput(values, revisionRef.current)).catch(
          () => null,
        );
        inFlightRef.current = request;
        setSaveState('saving');
        const saved = await request;
        inFlightRef.current = null;
        if (!saved) {
          setSaveState('error');
          if (signature(valuesRef.current) !== currentSignature) {
            setSavedVersion((version) => version + 1);
          }
          return false;
        }

        revisionRef.current = saved.revision;
        savedSignatureRef.current = currentSignature;
        setSavedVersion((version) => version + 1);
        if (signature(valuesRef.current) === currentSignature) {
          setSaveState('saved');
          return true;
        }
        setSaveState('dirty');
        if (!flush) {
          return true;
        }
      }
    },
    [onSave],
  );

  useEffect(() => {
    if (paused) {
      return;
    }
    if (signature(form.values) === savedSignatureRef.current) {
      if (!inFlightRef.current) {
        setSaveState('saved');
      }
      return;
    }
    if (saveError?.status === 409) {
      setSaveState('error');
      return;
    }
    if (!inFlightRef.current) {
      setSaveState('dirty');
    }
    const timer = window.setTimeout(() => {
      void saveLatest(false);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [form.values, paused, saveError?.status, savedVersion, saveLatest]);

  return saveLatest;
}
