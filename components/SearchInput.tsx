import clsx from 'clsx'
import { DetailedHTMLProps, HTMLAttributes, InputHTMLAttributes } from 'react'
import { FaSearch } from 'react-icons/fa'

type DivProps<T = HTMLDivElement> = DetailedHTMLProps<HTMLAttributes<T>, T>
type BaseProps<T = HTMLInputElement> = Omit<
  DetailedHTMLProps<InputHTMLAttributes<T>, T>,
  'children'
>

export interface SearchInputProps extends BaseProps {
  _container?: DivProps
  value: string
  onClear: () => void
}

const SearchInput = (props: SearchInputProps) => {
  const { _container, value, onClear, ...rest } = props

  return (
    <div className="relative" {..._container}>
      {/* search icon as label */}
      <label
        aria-label="Search"
        htmlFor={props.id}
        className="flex absolute inset-y-0 left-4 items-center text-white/50"
      >
        <FaSearch size={16} />
      </label>

      {/* main search input element */}
      <input
        className={clsx(
          'py-2 pr-14 pl-10 w-[36ch] form-input placeholder-white/50',
          'bg-white/10 rounded border-2 border-white/25 focus:ring focus:ring-plumbus'
        )}
        placeholder="Search..."
        {...rest}
      />

      {/* clear button, visible when search value exists */}
      {value.length > 0 && (
        <div className="flex absolute inset-y-0 right-2 items-center">
          <button
            className={clsx(
              'py-1 px-2 text-xs font-bold text-plumbus',
              'hover:bg-plumbus/10 rounded border border-plumbus'
            )}
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchInput
