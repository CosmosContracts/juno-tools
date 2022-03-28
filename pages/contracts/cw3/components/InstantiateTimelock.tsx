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
      <div className="relative px-10 py-5">
        <CustomInput placeholder="Admins" />
        <CustomInput placeholder="Proposers" />
        <CustomInput placeholder="Executers" />
        <input
          type="text"
          id="contract-id"
          className=" flex-1 rounded appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent mt-3"
          placeholder="Minimum Delay in nanosecs"
        />
        <button className="p-3 bg-juno rounded-lg mt-3">Instantiate</button>
      </div>

      <br />
      {flag && <div></div>}
    </div>
  )
}

export default InstantiateTimelock
