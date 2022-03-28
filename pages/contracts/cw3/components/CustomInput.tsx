import React, { useState } from 'react'

const CustomInput = (props: { placeholder: string | undefined }) => {
  const [input, setInput] = useState('')
  const [items, setItems] = useState([])

  const handleChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setInput(event.target.value)
    console.log(input)
  }

  const addClicked = () => {
    // @ts-ignore
    setItems([...items, input])
  }

  return (
    <div className="px-3">
      <div className="flex flex-row">
        <div className="mb-6">
          <label
            htmlFor="small-input"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            {props.placeholder}
          </label>
          <input
            type="text"
            className="rounded py-1 text-black"
            value={input}
            onChange={handleChange}
          />
        </div>
        <button type="button" className=" basis-1/12" onClick={addClicked}>
          <span className="hover:text-juno px-2">+</span>
        </button>
      </div>
      <div className="flex flex-col">
        {items.map((item) => {
          return (
            <div key={item}>
              <div className="flex flex-row p-2">
                <div className="basis-3/4">{item}</div>
                <button
                  type="button"
                  className=" basis-1/4"
                  onClick={addClicked}
                >
                  <span className="hover:text-juno px-2">-</span>
                </button>
              </div>
              <hr />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CustomInput
