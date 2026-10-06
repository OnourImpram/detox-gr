import { useEffect } from 'react';
/** The user-approved botanical direction supersedes the original walnut theme. */
export function ThemeRoot({children}:{children:React.ReactNode}) {
  useEffect(()=>{document.documentElement.dataset.theme='botanical';},[]);
  return <>{children}</>;
}
