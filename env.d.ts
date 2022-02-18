/* eslint-disable no-unused-vars */

declare module '*.svg' {
  const Component: (
    props: import('react').SVGProps<SVGSVGElement>
  ) => JSX.Element
  export default Component
}

declare module 'react-datetime-picker/dist/entry.nostyle' {
  export { default } from 'react-datetime-picker'
}
