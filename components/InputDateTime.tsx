import clsx from 'clsx'
import DateTimePicker, {
  DateTimePickerProps,
} from 'react-datetime-picker/dist/entry.nostyle'
import { FaCalendar, FaTimes } from 'react-icons/fa'

const InputDateTime = ({ className, ...rest }: DateTimePickerProps) => {
  return (
    <DateTimePicker
      className={clsx(
        'bg-white/10 rounded border-2 border-white/20 form-input',
        'placeholder:text-white/50',
        'focus:ring focus:ring-plumbus-20',
        className
      )}
      clearIcon={<FaTimes className="text-plumbus-40 hover:text-plumbus-60" />}
      calendarIcon={<FaCalendar className="text-white hover:text-white/80" />}
      {...rest}
    />
  )
}

export default InputDateTime
