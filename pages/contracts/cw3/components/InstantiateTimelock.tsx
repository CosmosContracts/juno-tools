import React, { useState } from 'react'
import CustomInput from './CustomInput'

const InstantiateTimelock = (props: {
  function: (
    arg0: number,
    arg1: Record<string, unknown>,
    arg2: string,
    arg3?: string | undefined,
  ) => void
}) => {
  const [codeId, setCodeId] = useState(626)
  const [initMsg, setInitMsg] = useState<Record<string, unknown>>({})
  const [label, setLabel] = useState('')
  const [admin, setAdmin] = useState('')
  const [flag, setFlag] = useState(false)

  const resetFlags = () => {
    setFlag(false)
  }

  const handleDelayChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setLabel(event.target.value)
  }

  const initiate = () => {
    if (!(codeId && initMsg && label)) {
      setFlag(true)
      setTimeout(resetFlags, 3000)
    } else {
      props.function(codeId, initMsg, label, admin)
    }
  }
  return (
    <div>
      <div className='relative px-10 py-5 flex-col'>
        <div className='mb-10 flex flex-row w-max'>
          <div className="flex-col basis-1/4">
            <label
              htmlFor='small-input'
              className='mb-1 mx-5 block text-sm font-medium text-gray-900 dark:text-gray-300'
            >
              Min Delay (ns)
            </label>
            <input type='text' className='py-1 mx-5 rounded text-black' value={label} />
          </div>
          <select name='time' id='time' className='h-10 mt-5 basis-1/4 rounded text-black px-1 float-right'>
            <option value='days'>days</option>
            <option value='hours'>hours</option>
            <option value='minutes'>minutes</option>
            <option value='seconds'>seconds</option>
          </select>
          <div className='px-6 mt-5 basis-1/4'>
            <button className='p-2 bg-juno rounded-lg'>Instantiate</button>
          </div>
        </div>
        <hr />
        <div className="mt-10">
          <div className='flex flex-row'>
            <CustomInput placeholder='Admins' />
            <CustomInput placeholder='Proposers' />
            <CustomInput placeholder='Executers' />
          </div>
        </div>
      </div>

      <br />
      {flag && <div></div>}
    </div>
  )
}

export default InstantiateTimelock
