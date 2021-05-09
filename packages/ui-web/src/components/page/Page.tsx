import React from 'react';
import './style.css';

export interface PageProps {
  actions?: object[];
}

export const Page: React.FC<PageProps> = ({ children, actions }) => {
  return (
    <>
      <div className="app-tool">{actions}</div>
      <div className="app-content">
        <div className="px-list-page">{children}</div>
      </div>
    </>
  );
};
