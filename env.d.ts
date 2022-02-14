/* eslint-disable no-unused-vars */

declare module '*.svg' {
  const Component: (
    props: import('react').SVGProps<SVGSVGElement>
  ) => JSX.Element
  export default Component
}
