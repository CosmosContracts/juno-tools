import clsx from 'clsx'
import {
  cloneElement,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useState,
} from 'react'
import { usePopper } from 'react-popper'

type TooltipDivProps<T = HTMLDivElement> = DetailedHTMLProps<
  HTMLAttributes<T>,
  T
>

export interface TooltipProps extends TooltipDivProps {
  label: ReactNode
  children: ReactElement<any>
}

const Tooltip = ({ label, children, ...props }: TooltipProps) => {
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState<any>(null)
  const [show, setShow] = useState(false)

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top',
  })

  return (
    <>
      {/* children with attached ref and mouse events */}
      {cloneElement(children, {
        ...children.props,
        ref: setReferenceElement,
        onMouseOver: () => setShow(true),
        onMouseOut: () => setShow(false),
      })}

      {/* popper element */}
      {show && (
        <div
          {...props}
          {...attributes.popper}
          className={clsx(
            'py-1 px-2 m-1 text-sm bg-black/80 rounded shadow-md',
            props.className
          )}
          ref={setPopperElement}
          style={{ ...styles.popper, ...props.style }}
        >
          {label}
        </div>
      )}
    </>
  )
}

export default Tooltip
