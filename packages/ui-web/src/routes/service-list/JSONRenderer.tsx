import React, { useEffect, useState, useRef } from 'react';
import * as monaco from 'monaco-editor';

export interface JSONRendererProps {
  value: string;
  getValue: (getCode: () => string) => void;
  root: HTMLElement | undefined;
}

export const JSONRenderer: React.FC<JSONRendererProps> = ({ root, value, children }) => {
  const rootContainer = useRef<HTMLElement>();
  const editorContainer = useRef<monaco.editor.IStandaloneCodeEditor>();

  if (rootContainer.current !== root) {
    if (root) {
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&');
      editorContainer.current = monaco.editor.create(root, {
        value,
        language: 'json',
        theme: 'vs-dark'
      });
    }
  }

  useEffect(() => {
    rootContainer.current = root;
  }, [root]);

  useEffect(() => {
    return () => {
      if (editorContainer.current) {
        editorContainer.current.getModel()?.dispose();
      }
    };
  }, []);

  return children;
};
