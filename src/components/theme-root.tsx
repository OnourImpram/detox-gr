import { useEffect } from 'react';
/** The visual redesign uses one botanical theme across all routes. */
export function ThemeRoot({children}:{children:React.ReactNode}) {
  useEffect(()=>{document.documentElement.dataset.theme='botanical';},[]);
  return <>{children}</>;
}
