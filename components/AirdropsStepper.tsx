import clsx from 'clsx'

import Anchor from './Anchor'

/**
 * Airdrops page steps defined with step name and page route
 */
export const steps = [
  { name: 'Configure', href: '/airdrops/create' },
  { name: 'Escrow', href: '/airdrops/escrow' },
  { name: 'Register', href: '/airdrops/register' },
  { name: 'Fund', href: '/airdrops/fund' },
] as const

export interface AirdropsStepperProps {
  step: number
}

const AirdropsStepper = (props: AirdropsStepperProps) => {
  const { step } = props

  if (!(step > 0 && step <= steps.length)) {
    throw new Error('AirdropsStepperError: invalid step value')
  }

  return (
    <ol className="flex items-center pb-8 text-center">
      {steps.map(({ name, href }, i) => (
        <li key={`step-${name}`} className="relative pr-24 last:pr-0">
          {/* horizontal line */}
          {i + 1 < steps.length && (
            <div
              className="flex absolute inset-0 left-10 items-center"
              aria-hidden="true"
            >
              <div className="w-full h-0.5 bg-juno" />
            </div>
          )}
          {/* anchor step */}
          <Anchor
            href={href}
            className={clsx(
              'group flex relative justify-center items-center w-10 h-10 rounded-full',
              'border-2 border-plumbus',
              i < step ? 'bg-plumbus' : 'bg-transparent hover:bg-plumbus/25'
            )}
          >
            <span className="font-bold">{i + 1}</span>
            <span
              className={clsx(
                'absolute -bottom-8 pt-4 text-sm group-hover:underline',
                { 'font-bold': i + 1 == step }
              )}
            >
              {name}
            </span>
          </Anchor>
        </li>
      ))}
    </ol>
  )
}

export default AirdropsStepper
