import Brand from 'assets/brand.svg'
import Anchor from 'components/Anchor'
import { NextPage } from 'next'
import { FaArrowRight } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'

const HomePage: NextPage = () => {
  return (
    <section className="px-8 pt-4 pb-16 mx-auto space-y-4 max-w-4xl">
      <Brand className="py-8 max-w-xs" />
      <h1 className="text-4xl font-bold">Welcome to JunoTools</h1>
      <p className="text-xl">
        JunoTools is a swiss knife that helps you build on Juno by providing
        smart contract front ends. We call these front-end apps as{' '}
        <b>Smart Contact Dashboards</b>.
      </p>

      <br />

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Manage Airdrops</h2>
          <p className="text-white/75">
            Looking for a fast and efficient way to airdrop your project? Or
            come to claim your allocation? Use our airdrop tool to create and/or
            claim your airdrop!
          </p>
          <Anchor
            href="/airdrops/list"
            className="flex items-center space-x-1 font-bold text-plumbus hover:text-plumbus-light hover:underline"
          >
            <span>View Airdrops</span> <FaArrowRight size={12} />
          </Anchor>
        </div>
        {/*
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Smart Contract Dashboard</h2>
          <p className="text-white/75">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta
            asperiores quis soluta recusandae sequi adipisci quod tempora modi,
            debitis beatae tempore accusantium, esse itaque quaerat obcaecati
            quia totam necessitatibus voluptas!
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Something Cool</h2>
          <p className="text-white/75">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga
            accusantium distinctio dignissimos maxime vero illum explicabo
            officiis. Pariatur magni, enim qui itaque atque quibusdam debitis
            iste delectus deserunt dolores quisquam?
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Adding Value</h2>
          <p className="text-white/75">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quasi enim
            minus voluptates dicta, eum debitis iusto commodi delectus itaque
            qui, unde adipisci. Esse eveniet dolorem consequatur tempore at
            voluptates aut?
          </p>
        </div>
        */}
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
