import React, { useState } from 'react'

const ManageTimeLock = () => {
  const [isExecutePage, setIsExecutePage] = useState(true)

  return (
    <div className="px-10 py-5">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
          <li className="mr-2">
            <a
              href="#"
              onClick={() => {
                setIsExecutePage(true)
              }}
              className={
                !isExecutePage
                  ? 'inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
                  : 'inline-flex p-4 text-juno rounded-t-lg border-b-2 border-juno active dark:text-juno dark:border-juno group'
              }
            >
              Execute
            </a>
          </li>
          <li className="mr-2">
            <a
              href="#"
              onClick={() => {
                setIsExecutePage(false)
              }}
              className={
                isExecutePage
                  ? 'inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
                  : 'inline-flex p-4 text-juno rounded-t-lg border-b-2 border-juno active dark:text-juno dark:border-juno group'
              }
              aria-current="page"
            >
              Query
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ManageTimeLock
