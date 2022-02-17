import { ReactNode } from 'react'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons/lib'

import Tooltip from './Tooltip'

interface TooltipIconProps extends IconBaseProps {
  label: ReactNode
}

const TooltipIcon = ({ label, ...rest }: TooltipIconProps) => {
  return (
    <Tooltip label={label}>
      <span>
        <FaRegQuestionCircle className="cursor-help" {...rest} />
      </span>
    </Tooltip>
  )
}

export default TooltipIcon
