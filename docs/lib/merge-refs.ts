import type * as React from 'react';

export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (value) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        const cleanup = ref(value);
        return typeof cleanup === 'function' ? cleanup : () => ref(null);
      } else if (ref) {
        ref.current = value;
        return () => {
          ref.current = null;
        };
      }
    });
    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
    };
  };
}
