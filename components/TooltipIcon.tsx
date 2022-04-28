import { Tooltip } from 'components/Tooltip'
import { ReactNode } from 'react'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons/lib'

interface TooltipIconProps extends IconBaseProps {
  label: ReactNode
}

export const TooltipIcon = ({ label, ...rest }: TooltipIconProps) => {
  return (
    <Tooltip label={label}>
      <span>
        <FaRegQuestionCircle className="cursor-help" {...rest} />
      </span>
    </Tooltip>
  )
}
