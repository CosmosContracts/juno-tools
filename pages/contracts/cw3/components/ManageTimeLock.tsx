import React, { useState } from 'react'

const ManageTimeLock = () => {

  const [isExecutePage, setIsExecutePage] = useState(true);

  return (
    <div className='px-10 py-5'>

      <div className='border-b border-gray-200 dark:border-gray-700'>
        <ul className='flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400'>
          <li className='mr-2'>
            <a href='#'
               onClick={() => {setIsExecutePage(true)}}
               className={!isExecutePage ? 'inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
            :
                 'inline-flex p-4 text-juno rounded-t-lg border-b-2 border-juno active dark:text-juno dark:border-juno group'
            }
            >
              <svg
                className='mr-2 w-5 h-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                <path fill-rule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z'
                      clip-rule='evenodd'></path>
              </svg>
              Execute
            </a>
          </li>
          <li className='mr-2'>
            <a href='#'
               onClick={() => {setIsExecutePage(false)}}
               className={isExecutePage ? 'inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
                 :
                 'inline-flex p-4 text-juno rounded-t-lg border-b-2 border-juno active dark:text-juno dark:border-juno group'
               }
               aria-current='page'>
              <svg className='mr-2 w-5 h-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300' fill='currentColor' viewBox='0 0 20 20'
                   xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'></path>
              </svg>
              Query
            </a>
          </li>
        </ul>
      </div>

    </div>
  )
}

export default ManageTimeLock
