import nextVitals from 'eslint-config-next/core-web-vitals';
const config=[...nextVitals,{ignores:['.next/**','node_modules/**','docs/**','data/**','public/**','contracts/**','test-results/**','playwright-report/**','Legacy/**']},{rules:{
 // State is synchronized with browser storage, offline state and external Workers.
 'react-hooks/set-state-in-effect':'off',
 'react-hooks/refs':'off'
}}];
export default config;
