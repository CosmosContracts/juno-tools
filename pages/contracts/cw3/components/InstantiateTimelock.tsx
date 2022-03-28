import React, { useState } from 'react'
import CustomInput from './CustomInput'

const InstantiateTimelock = (props: {
  function: (
    arg0: number,
    arg1: Record<string, unknown>,
    arg2: string,
    arg3?: string | undefined
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
      <div className="relative px-10 py-5 flex flex-row">
        <div className="basis-8/12">
          <div className="flex flex-row">
            <CustomInput placeholder="Admins"/>
            <CustomInput placeholder="Proposers" />
            <CustomInput placeholder="Executers" />
          </div>
        </div>
        <div className='mb-6 basis-3/12'>
          <label htmlFor='small-input'
                 className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Minimum Delay (ns)</label>
          <input type='text'
                 className='rounded py-1'
          />
        </div>
        <div className="basis-1/12 px-10 mt-6">
          <button className="p-2 bg-juno rounded-lg">Instantiate</button>
        </div>
      </div>

      <br />
      {flag && <div></div>}
    </div>
  )
}

export default InstantiateTimelock
