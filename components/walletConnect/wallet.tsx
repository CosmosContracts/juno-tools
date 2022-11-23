/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Box, Center, Grid, GridItem, Icon, Stack, useColorModeValue } from '@chakra-ui/react'
import { useWallet } from '@cosmos-kit/react'
import type { MouseEventHandler } from 'react'
import { useEffect } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

import {
  Astronaut,
  //ChainCard,
  Connected,
  ConnectedShowAddress,
  ConnectedUserInfo,
  Connecting,
  ConnectStatusWarn,
  CopyAddressBtn,
  Disconnected,
  Error,
  NotExist,
  Rejected,
  RejectedWarn,
  WalletConnectComponent,
} from './react'

const chainName = 'junotestnet'

export const WalletSection = () => {
  const walletManager = useWallet()
  const {
    connect,
    openView,
    walletStatus,
    username,
    address,
    message,
    currentChainName,
    currentWallet,
    currentChainRecord,
    getChainLogo,
    setCurrentChain,
  } = walletManager

  useEffect(() => {
    setCurrentChain(chainName)
  }, [setCurrentChain])

  const chain = {
    chainName: currentChainName,
    label: currentChainRecord?.chain.pretty_name,
    value: currentChainName,
    icon: getChainLogo(currentChainName),
  }

  // Events
  const onClickConnect: MouseEventHandler = async (e) => {
    e.preventDefault()
    await connect()
  }

  const onClickOpenView: MouseEventHandler = (e) => {
    e.preventDefault()
    openView()
  }

  // Components
  const connectWalletButton = (
    <WalletConnectComponent
      connected={<Connected buttonText="My Wallet" onClick={onClickOpenView} />}
      connecting={<Connecting />}
      disconnect={<Disconnected buttonText="Connect Wallet" onClick={onClickConnect} />}
      error={<Error buttonText="Change Wallet" onClick={onClickOpenView} />}
      notExist={<NotExist buttonText="Install Wallet" onClick={onClickOpenView} />}
      rejected={<Rejected buttonText="Reconnect" onClick={onClickConnect} />}
      walletStatus={walletStatus}
    />
  )

  const connectWalletWarn = (
    <ConnectStatusWarn
      error={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${currentWallet?.walletInfo.prettyName}: ${message}`}
        />
      }
      rejected={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${currentWallet?.walletInfo.prettyName}: ${message}`}
        />
      }
      walletStatus={walletStatus}
    />
  )

  const userInfo = username && <ConnectedUserInfo icon={<Astronaut />} username={username} />
  const addressBtn = currentChainName && (
    <CopyAddressBtn
      connected={<ConnectedShowAddress address={address} isLoading={false} />}
      walletStatus={walletStatus}
    />
  )

  return (
    <Center py={0}>
      <Grid alignItems="center" justifyContent="center" maxW="sm" rowGap={4} templateColumns="1fr" w="full">
        <GridItem px={6}>
          <Stack
            alignItems="center"
            bg={useColorModeValue('transparent', 'blackAlpha.400')}
            borderRadius="lg"
            boxShadow={useColorModeValue(
              '0 0 2px #dfdfdf, 0 0 6px -2px #d3d3d3',
              '0 0 2px #363636, 0 0 8px -2px #4f4f4f',
            )}
            justifyContent="center"
            px={0}
            py={{ base: 0, md: 0 }}
            spacing={0}
          >
            {userInfo}
            {addressBtn}
            <Box maxW={{ base: 52, md: 64 }} w="full">
              {connectWalletButton}
            </Box>
            {connectWalletWarn && <GridItem>{connectWalletWarn}</GridItem>}
          </Stack>
        </GridItem>
      </Grid>
    </Center>
  )
}
