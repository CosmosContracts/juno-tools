import clsx from 'clsx'
import DateTimePicker, {
  DateTimePickerProps,
} from 'react-datetime-picker/dist/entry.nostyle'

const InputDateTime = ({ className, ...rest }: DateTimePickerProps) => {
  return (
    <DateTimePicker
      className={clsx(
        'bg-white/10 rounded border-2 border-white/20 form-input',
        'placeholder:text-white/50',
        'focus:ring focus:ring-plumbus-20',
        className
      )}
      {...rest}
    />
  )
}

export default InputDateTime
