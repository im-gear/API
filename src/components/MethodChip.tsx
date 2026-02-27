import React from 'react';

export const MethodChip = ({ method }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' }) => {
  return (
    <span className={`method-chip method-chip-${method}`}>
      {method}
    </span>
  );
};
