import React, { useState } from 'react'

const CustomInput = (props: { placeholder: string | undefined }) => {
  return (
    <div className="flex flex-row">
      <input
        type="text"
        id="contract-id"
        className="basis-11/12 flex-1 rounded appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent mt-3"
        placeholder={props.placeholder}
      />
      <button type="button" className=" basis-1/12">
        <span className="hover:text-juno">+</span>
      </button>
    </div>
  )
}

export default CustomInput
