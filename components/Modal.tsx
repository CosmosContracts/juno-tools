import clsx from 'clsx'
import { useState } from 'react'
import { FaAsterisk } from 'react-icons/fa'

import Button from './Button'
import Radio from './Radio'

export default function Modal() {
  const [showModal, setShowModal] = useState(true)
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  return (
    <>
      {showModal ? (
        <>
          <div className="flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 justify-center items-center outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-auto max-w-3xl">
              <div className="flex relative flex-col w-full bg-stone-800 rounded-lg border-[1px] border-slate-200/20 border-solid outline-none focus:outline-none shadow-lg">
                <div className="flex justify-between items-start p-5 rounded-t border-b border-slate-200/20 border-solid">
                  <h3 className="text-3xl font-bold">
                    Before using JunoTools...
                  </h3>
                </div>
                <div className="relative flex-auto p-6 my-4">
                  <p className="text-lg leading-relaxed">
                    JunoTools is a decentralized application where individuals
                    or communities can use smart contract dashboards to create
                    tokens, distribute tokens, collect airdrops, etc...
                    <br /> These are all done by instantiating, invoking and
                    querying smart contracts. <br />
                    <br />
                    JunoTools is made up of free, public, and open-source
                    software that is built on top of Juno Network. JunoTools
                    only provides tools for any of the mentioned functionalities
                    above and inside the dApp. Anyone can airdrop or generate
                    tokens on JunoTools. JunoTools does not search for any
                    criteria for airdrop listings, does not audit the
                    functionality of the tokens. <br />
                    <br />
                    AS DESCRIBED IN THE DISCLAIMER, JUNOTOOLS IS PROVIDED “AS
                    IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.
                    No developer or entity involved in creating the JunoTools
                    will be liable for any claims or damages whatsoever
                    associated with your use, inability to use, or your
                    interaction with other users of the JunoTools, including any
                    direct, indirect, incidental, special, exemplary, punitive
                    or consequential damages, or loss of profits, tokens, or
                    anything else.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Radio
                    id="disclaimer-accept"
                    htmlFor="disclaimer-accept"
                    title="I understand the risks and disclaimer of using JunoTools"
                    subtitle=""
                    onChange={() => setIsButtonDisabled(false)}
                    checked={!isButtonDisabled}
                  />
                </div>
                <div className="flex justify-end items-center p-6 mt-1">
                  <Button
                    onClick={() => setShowModal(false)}
                    disabled={isButtonDisabled}
                    isWide
                    leftIcon={<FaAsterisk />}
                    className={clsx({ 'opacity-50': isButtonDisabled })}
                  >
                    Enter JunoTools
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
